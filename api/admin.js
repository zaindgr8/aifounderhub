/**
 * POST /api/admin — the entire /admin backend behind one authenticated route.
 *
 * Body: { action: string, ...params }
 *
 * Reads:   overview | customers | payments | leads | audit | whoami
 * Writes:  member.grant | member.revoke | payment.manual
 *
 * Every request is authenticated against Supabase and checked against the admin
 * allowlist before anything is read. The dataset here is small (hundreds of
 * rows), so aggregation happens in-process rather than in SQL — that keeps the
 * panel working on the base schema as well as after migration 0003.
 */

import {
  PACKAGES, resolveProduct, amountCents,
  sbSelect, sbPatch, sbInsertTolerant, listAuthUsers, likeSafe,
  requireAdmin, audit, setCors, supabaseConfigured,
} from './_admin-lib.js';
import { affiliateStats, maskEmail, recordCommission, defaultCommissionPct } from './_affiliate-lib.js';

const MAX_ROWS = 5000;
const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Small helpers ────────────────────────────────────────────────────────────

const lower = (v) => String(v ?? '').trim().toLowerCase();
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

function rangeToDays(range) {
  return { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[range] ?? null; // null = all time
}

/** Builds a zero-filled day-by-day bucket map for the last `days` days (inclusive of today). */
function emptySeries(days) {
  const out = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    out.push({ date: dayKey(today.getTime() - i * DAY_MS), signups: 0, revenueCents: 0, leads: 0, orders: 0 });
  }
  return out;
}

function isActiveMember(m) {
  if (!m) return false;
  if (m.status !== 'active') return false;
  if (!m.expires_at) return true;
  return new Date(m.expires_at).getTime() > Date.now();
}

// ─── Data loading ─────────────────────────────────────────────────────────────

/** One round-trip per source, in parallel. Everything downstream works off this. */
async function loadAll() {
  const [users, payments, members, leads, bookings, progress] = await Promise.all([
    listAuthUsers(),
    sbSelect('payments', `select=*&order=created_at.desc&limit=${MAX_ROWS}`),
    sbSelect('members',  `select=*&order=created_at.desc&limit=${MAX_ROWS}`),
    sbSelect('leads',    `select=*&order=created_at.desc&limit=${MAX_ROWS}`),
    sbSelect('bookings', `select=*&order=created_at.desc&limit=${MAX_ROWS}`),
    sbSelect('user_progress', `select=user_id,completed&limit=${MAX_ROWS}`),
  ]);
  return { users, payments, members, leads, bookings, progress };
}

/**
 * The core join: one row per human, keyed on email, merged from every source.
 * A person shows up here whether they signed up, only left a lead, or only paid.
 */
function buildPeople({ users, payments, members, leads, progress }) {
  const people = new Map();

  const get = (email) => {
    const key = lower(email);
    if (!key) return null;
    if (!people.has(key)) {
      people.set(key, {
        email: key, name: null, avatar: null, provider: null,
        signedUpAt: null, lastSignInAt: null, isUser: false,
        memberships: [], hasActiveAccess: false, orders: [], totalSpentCents: 0, packages: [],
        lead: null, tasksCompleted: 0,
      });
    }
    return people.get(key);
  };

  const progressByUser = new Map();
  for (const row of progress) {
    if (!row.completed) continue;
    progressByUser.set(row.user_id, (progressByUser.get(row.user_id) ?? 0) + 1);
  }

  for (const u of users) {
    const p = get(u.email);
    if (!p) continue;
    const meta = u.user_metadata || {};
    p.isUser = true;
    p.name = meta.full_name || meta.name || p.name;
    p.avatar = meta.avatar_url || meta.picture || null;
    p.provider = (u.app_metadata || {}).provider || 'email';
    p.signedUpAt = u.created_at;
    p.lastSignInAt = u.last_sign_in_at || null;
    p.tasksCompleted = progressByUser.get(u.id) ?? 0;
  }

  for (const m of members) {
    const p = get(m.email);
    if (!p) continue;
    p.name = p.name || m.full_name || null;
    const active = isActiveMember(m);
    const code = m.product_code || 'aaa-accelerator';
    const label = m.product_label || PACKAGES[code]?.label || code;

    // One row per product owned. This used to assign a single p.member, so a
    // customer holding Claude AND the RoadMap showed only whichever row was
    // read last.
    p.memberships.push({
      productCode: code,
      productLabel: label,
      status: m.status,
      active,
      startedAt: m.started_at || m.created_at,
      expiresAt: m.expires_at || null,
    });
    if (active) p.hasActiveAccess = true;
    if (active && label && !p.packages.includes(label)) {
      p.packages.push(label);
    }
  }

  for (const pay of payments) {
    const p = get(pay.customer_email);
    if (!p) continue;
    const product = resolveProduct(pay);
    const cents = amountCents(pay);
    p.name = p.name || pay.customer_name || null;
    p.orders.push({
      id: pay.id,
      date: pay.created_at,
      completedAt: pay.completed_at || (pay.status === 'completed' ? pay.updated_at : null),
      productCode: product.code,
      productLabel: product.label,
      amountCents: cents,
      currency: pay.currency || 'USD',
      status: pay.status,
      isTest: pay.is_test !== false,
      intentId: pay.ziina_intent_id || null,
      provider: pay.provider || 'ziina',
    });
    if (pay.status === 'completed') {
      p.totalSpentCents += cents;
      if (!p.packages.includes(product.label)) p.packages.push(product.label);
    }
  }

  for (const l of leads) {
    const p = get(l.email);
    if (!p) continue;
    p.name = p.name || l.first_name || null;
    // leads are ordered newest-first, so the first one we see is the freshest
    if (!p.lead) {
      p.lead = {
        id: l.id,
        createdAt: l.created_at,
        source: l.source || 'unknown',
        goal: l.goal || null,
        phone: l.full_phone || l.phone || null,
        countryCode: l.country_code || null,
        workshopTitle: l.workshop_title || null,
        ticketNumber: l.ticket_number || null,
        submissions: l.submissions ?? 1,
      };
    }
  }

  for (const p of people.values()) {
    p.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    p.memberships.sort((a, b) => Number(b.active) - Number(a.active));
    p.paid = p.totalSpentCents > 0;
  }

  return [...people.values()];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function actionOverview({ range = '30d' }) {
  const data = await loadAll();
  const people = buildPeople(data);
  const { users, payments, members, leads, bookings } = data;

  const days = rangeToDays(range);
  const now = Date.now();
  const from = days ? now - days * DAY_MS : 0;
  const prevFrom = days ? from - days * DAY_MS : 0;
  const inRange = (ts) => ts && new Date(ts).getTime() >= from;
  const inPrev = (ts) => {
    if (!days || !ts) return false;
    const t = new Date(ts).getTime();
    return t >= prevFrom && t < from;
  };

  const completed = payments.filter((p) => p.status === 'completed');
  const paidWhen = (p) => p.completed_at || p.updated_at || p.created_at;

  // ── Headline numbers ────────────────────────────────────────────────────────
  const revenueAllCents = completed.reduce((s, p) => s + amountCents(p), 0);
  const revenueRangeCents = completed.filter((p) => inRange(paidWhen(p))).reduce((s, p) => s + amountCents(p), 0);
  const revenuePrevCents = completed.filter((p) => inPrev(paidWhen(p))).reduce((s, p) => s + amountCents(p), 0);

  const signupsRange = users.filter((u) => inRange(u.created_at)).length;
  const signupsPrev = users.filter((u) => inPrev(u.created_at)).length;

  const leadsRange = leads.filter((l) => inRange(l.created_at)).length;
  const leadsPrev = leads.filter((l) => inPrev(l.created_at)).length;

  const payingPeople = people.filter((p) => p.paid);
  const payingRange = new Set(completed.filter((p) => inRange(paidWhen(p))).map((p) => lower(p.customer_email))).size;
  const payingPrev = new Set(completed.filter((p) => inPrev(paidWhen(p))).map((p) => lower(p.customer_email))).size;

  const activeEntitlements = members.filter(isActiveMember);
  const activeMemberEmails = new Set(activeEntitlements.map((m) => lower(m.email)));
  const lapsedMemberEmails = new Set(
    members.filter((m) => !isActiveMember(m)).map((m) => lower(m.email)),
  );
  // Someone whose RoadMap lapsed but who still owns Claude is not "lapsed".
  for (const email of activeMemberEmails) lapsedMemberEmails.delete(email);

  // MRR = every active recurring ENTITLEMENT at its package price. A person
  // holding Claude (one-time) plus the RoadMap contributes the RoadMap only.
  const mrrCents = activeEntitlements.reduce((sum, m) => {
    const pkg = PACKAGES[m.product_code] || PACKAGES['aaa-accelerator'];
    return sum + (pkg.recurring ? pkg.priceCents : 0);
  }, 0);

  const ordersRange = completed.filter((p) => inRange(paidWhen(p)));
  const aovCents = ordersRange.length ? Math.round(revenueRangeCents / ordersRange.length) : 0;

  // ── Daily series (always 30 buckets for the sparkline/columns) ───────────────
  const seriesDays = days ?? 30;
  const series = emptySeries(Math.min(seriesDays, 90));
  const byDay = new Map(series.map((d) => [d.date, d]));
  for (const u of users) { const b = byDay.get(dayKey(u.created_at)); if (b) b.signups++; }
  for (const l of leads) { const b = byDay.get(dayKey(l.created_at)); if (b) b.leads++; }
  for (const p of completed) {
    const b = byDay.get(dayKey(paidWhen(p)));
    if (b) { b.revenueCents += amountCents(p); b.orders++; }
  }

  // ── Breakdowns ──────────────────────────────────────────────────────────────
  const packageMap = new Map();
  for (const p of completed) {
    if (!inRange(paidWhen(p))) continue;
    const product = resolveProduct(p);
    const entry = packageMap.get(product.code) || { code: product.code, label: product.label, orders: 0, revenueCents: 0, customers: new Set() };
    entry.orders++;
    entry.revenueCents += amountCents(p);
    entry.customers.add(lower(p.customer_email));
    packageMap.set(product.code, entry);
  }
  const byPackage = [...packageMap.values()]
    .map((e) => ({ ...e, customers: e.customers.size }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  const sourceMap = new Map();
  for (const l of leads) {
    if (!inRange(l.created_at)) continue;
    const key = l.source || 'unknown';
    sourceMap.set(key, (sourceMap.get(key) ?? 0) + 1);
  }
  const bySource = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const goalMap = new Map();
  for (const l of leads) {
    if (!inRange(l.created_at)) continue;
    const key = l.goal || 'unknown';
    goalMap.set(key, (goalMap.get(key) ?? 0) + 1);
  }
  const byGoal = [...goalMap.entries()].map(([goal, count]) => ({ goal, count })).sort((a, b) => b.count - a.count);

  // ── Funnel (all-time — a funnel across a window double-counts stages) ────────
  const funnel = [
    { stage: 'Leads captured',  value: leads.length },
    { stage: 'Accounts created', value: users.length },
    { stage: 'Paying customers', value: payingPeople.length },
    { stage: 'Active members',   value: activeMemberEmails.size },
  ];

  // ── Recent activity ─────────────────────────────────────────────────────────
  const activity = [
    ...users.map((u) => ({ type: 'signup', at: u.created_at, email: lower(u.email), name: (u.user_metadata || {}).full_name || null, detail: (u.app_metadata || {}).provider || 'email' })),
    ...completed.map((p) => ({ type: 'payment', at: paidWhen(p), email: lower(p.customer_email), name: p.customer_name, detail: resolveProduct(p).label, amountCents: amountCents(p) })),
    ...leads.map((l) => ({ type: 'lead', at: l.created_at, email: lower(l.email), name: l.first_name, detail: l.source || 'website' })),
    ...bookings.map((b) => ({ type: 'booking', at: b.created_at, email: lower(b.customer_email), name: b.customer_name, detail: b.status })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 25);

  const pct = (curr, prev) => (prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null);

  return {
    range,
    generatedAt: new Date().toISOString(),
    kpis: {
      revenueCents:     { value: revenueRangeCents, allTime: revenueAllCents, deltaPct: pct(revenueRangeCents, revenuePrevCents) },
      signups:          { value: signupsRange, allTime: users.length, deltaPct: pct(signupsRange, signupsPrev) },
      payingCustomers:  { value: payingRange, allTime: payingPeople.length, deltaPct: pct(payingRange, payingPrev) },
      leads:            { value: leadsRange, allTime: leads.length, deltaPct: pct(leadsRange, leadsPrev) },
      activeMembers:    { value: activeMemberEmails.size, allTime: members.length, deltaPct: null },
      lapsedMembers:    { value: lapsedMemberEmails.size, allTime: lapsedMemberEmails.size, deltaPct: null },
      mrrCents:         { value: mrrCents, allTime: mrrCents, deltaPct: null },
      aovCents:         { value: aovCents, allTime: completed.length ? Math.round(revenueAllCents / completed.length) : 0, deltaPct: null },
      conversionPct:    { value: users.length ? +((payingPeople.length / users.length) * 100).toFixed(1) : 0, allTime: null, deltaPct: null },
      pendingPayments:  { value: payments.filter((p) => p.status === 'pending').length, allTime: null, deltaPct: null },
    },
    series,
    byPackage,
    bySource,
    byGoal,
    funnel,
    activity,
    health: {
      supabase: supabaseConfigured,
      paymentsRecorded: payments.length,
      leadsRecorded: leads.length,
      migration0003: payments.some((p) => 'product_code' in p) || leads.some((l) => 'workshop_title' in l),
    },
  };
}

async function actionCustomers() {
  const data = await loadAll();
  const people = buildPeople(data).sort((a, b) => {
    const at = new Date(a.signedUpAt || a.lead?.createdAt || a.orders[0]?.date || 0).getTime();
    const bt = new Date(b.signedUpAt || b.lead?.createdAt || b.orders[0]?.date || 0).getTime();
    return bt - at;
  });
  return { people, count: people.length };
}

async function actionPayments() {
  const rows = await sbSelect('payments', `select=*&order=created_at.desc&limit=${MAX_ROWS}`);
  const payments = rows.map((p) => {
    const product = resolveProduct(p);
    return {
      id: p.id,
      createdAt: p.created_at,
      completedAt: p.completed_at || (p.status === 'completed' ? p.updated_at : null),
      customerName: p.customer_name,
      customerEmail: lower(p.customer_email),
      productCode: product.code,
      productLabel: product.label,
      amountCents: amountCents(p),
      currency: p.currency || 'USD',
      status: p.status,
      isTest: p.is_test !== false,
      intentId: p.ziina_intent_id,
      provider: p.provider || 'ziina',
      error: p.latest_error || null,
    };
  });
  return { payments, count: payments.length, packages: Object.values(PACKAGES) };
}

async function actionLeads() {
  const rows = await sbSelect('leads', `select=*&order=created_at.desc&limit=${MAX_ROWS}`);
  const leads = rows.map((l) => ({
    id: l.id,
    createdAt: l.created_at,
    name: l.first_name,
    email: lower(l.email),
    phone: l.full_phone || l.phone || null,
    countryCode: l.country_code || null,
    goal: l.goal || null,
    source: l.source || 'unknown',
    workshopTitle: l.workshop_title || null,
    ticketNumber: l.ticket_number || null,
    submissions: l.submissions ?? 1,
    lastSeenAt: l.last_seen_at || l.created_at,
  }));
  return { leads, count: leads.length };
}

async function actionAudit() {
  const rows = await sbSelect('admin_audit_log', 'select=*&order=created_at.desc&limit=200');
  return { entries: rows };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Grants one product to one person via the atomic DB function. Uniqueness on
 * members lives on an expression index, which PostgREST cannot name as an
 * upsert conflict target — so this goes through RPC rather than POST /members.
 */
async function grantMemberProduct({ email, productCode, productLabel, expiresAt, fullName, source }) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/grant_member_product`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_email: email,
        p_product_code: productCode,
        p_product_label: productLabel ?? null,
        p_status: 'active',
        p_expires_at: expiresAt,
        p_full_name: fullName ?? null,
        p_source: source ?? 'admin-panel',
      }),
    });
    if (res.ok) return { ok: true };
    const error = await res.text();
    console.error('[admin] grant_member_product failed:', res.status, error);
    return { ok: false, error: error.slice(0, 160) };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'request failed' };
  }
}

async function actionMemberGrant(actor, { email, days = 31, productCode = 'aaa-accelerator', fullName }) {
  const target = lower(email);
  if (!target) return { error: 'An email is required' };

  const pkg = PACKAGES[productCode] || PACKAGES['aaa-accelerator'];
  // A one-time course does not lapse; a subscription gets a dated window.
  const expiresAt = pkg.recurring === false && productCode !== 'aaa-accelerator'
    ? null
    : new Date(Date.now() + Number(days) * DAY_MS).toISOString();

  const result = await grantMemberProduct({
    email: target,
    productCode: pkg.code,
    productLabel: pkg.label,
    expiresAt,
    fullName,
    source: 'admin-panel',
  });
  if (!result.ok) return { error: `Could not grant access: ${result.error}` };

  await audit(actor.email, 'member.grant', target, { days, productCode: pkg.code });
  return { ok: true, email: target, expiresAt, productLabel: pkg.label };
}

async function actionMemberRevoke(actor, { email, productCode }) {
  const target = lower(email);
  if (!target) return { error: 'An email is required' };

  // Without a productCode this revokes every entitlement the person holds.
  const scope = productCode ? `&product_code=eq.${encodeURIComponent(productCode)}` : '';
  const result = await sbPatch('members', `email=ilike.${encodeURIComponent(likeSafe(target))}${scope}`, {
    status: 'cancelled', expires_at: new Date().toISOString(),
  });
  if (!result.ok) return { error: `Could not revoke access: ${result.raw?.slice(0, 160)}` };

  await audit(actor.email, 'member.revoke', target, { productCode: productCode ?? 'all' });
  return { ok: true, email: target, revoked: result.data?.length ?? 0 };
}

/**
 * Record a purchase that did not come through Ziina checkout — a bank transfer,
 * an invoice, or a sale made before payments were being persisted. Keeps
 * revenue reporting honest instead of silently under-counting.
 */
async function actionPaymentManual(actor, { email, name, productCode = 'aaa-accelerator', amountCents: cents, date, grantAccess = true }) {
  const target = lower(email);
  if (!target) return { error: 'An email is required' };

  const pkg = PACKAGES[productCode] || PACKAGES['aaa-accelerator'];
  const value = Number.isFinite(Number(cents)) && Number(cents) > 0 ? Math.round(Number(cents)) : pkg.priceCents;
  const at = date ? new Date(date).toISOString() : new Date().toISOString();

  const full = {
    purpose: pkg.purpose, status: 'completed', amount_fils: value, amount_cents: value, currency: 'USD',
    customer_name: name || null, customer_email: target, is_test: false,
    product_code: pkg.code, product_label: pkg.label, provider: 'manual',
    created_at: at, completed_at: at, metadata: { recordedBy: actor.email },
  };
  const base = {
    purpose: pkg.purpose, status: 'completed', amount_fils: value, currency: 'USD',
    customer_name: name || null, customer_email: target, is_test: false, created_at: at,
  };

  const result = await sbInsertTolerant('payments', full, base);
  if (!result.ok) return { error: `Could not record payment: ${result.raw?.slice(0, 160)}` };

  await audit(actor.email, 'payment.manual', target, { productCode: pkg.code, amountCents: value });

  // A sale logged by hand still earns the referrer their commission.
  await recordCommission({
    paymentId: result.data?.[0]?.id ?? null,
    customerEmail: target,
    amountCents: value,
    productCode: pkg.code,
    productLabel: pkg.label,
  });

  if (grantAccess) await actionMemberGrant(actor, { email: target, productCode: pkg.code, fullName: name });
  return { ok: true, email: target, amountCents: value, productLabel: pkg.label };
}

// ── Affiliates ────────────────────────────────────────────────────────────────

/** Every applicant with their performance, newest application first. */
async function actionAffiliates() {
  const [affiliates, clicks, referrals, commissions, defaultPct] = await Promise.all([
    sbSelect('affiliates', `select=*&order=applied_at.desc&limit=${MAX_ROWS}`),
    sbSelect('affiliate_clicks', `select=affiliate_id&limit=${MAX_ROWS}`),
    sbSelect('affiliate_referrals', `select=affiliate_id,first_purchase_at&limit=${MAX_ROWS}`),
    sbSelect('affiliate_commissions', `select=*&limit=${MAX_ROWS}`),
    defaultCommissionPct(),
  ]);

  const tally = (rows, pick = () => 1) => {
    const map = new Map();
    for (const r of rows) map.set(r.affiliate_id, (map.get(r.affiliate_id) ?? 0) + pick(r));
    return map;
  };

  const clickCount = tally(clicks);
  const referralCount = tally(referrals);
  const live = commissions.filter((c) => c.status !== 'void');
  const earned = tally(live, (c) => c.commission_cents ?? 0);
  const unpaid = tally(live.filter((c) => c.status !== 'paid'), (c) => c.commission_cents ?? 0);
  const volume = tally(live, (c) => c.sale_amount_cents ?? 0);
  const saleCount = tally(live);

  return {
    defaultPct,
    affiliates: affiliates.map((a) => ({
      id: a.id,
      email: a.email,
      fullName: a.full_name,
      code: a.code,
      status: a.status,
      commissionPct: Number(a.commission_pct),
      payoutMethod: a.payout_method,
      payoutDetails: a.payout_details,
      applicantNote: a.applicant_note,
      adminNote: a.admin_note,
      appliedAt: a.applied_at,
      reviewedAt: a.reviewed_at,
      reviewedBy: a.reviewed_by,
      clicks: clickCount.get(a.id) ?? 0,
      referrals: referralCount.get(a.id) ?? 0,
      sales: saleCount.get(a.id) ?? 0,
      salesVolumeCents: volume.get(a.id) ?? 0,
      earnedCents: earned.get(a.id) ?? 0,
      unpaidCents: unpaid.get(a.id) ?? 0,
    })),
  };
}

async function actionCommissions() {
  const [rows, affiliates] = await Promise.all([
    sbSelect('affiliate_commissions', `select=*&order=created_at.desc&limit=${MAX_ROWS}`),
    sbSelect('affiliates', `select=id,email,code&limit=${MAX_ROWS}`),
  ]);
  const byId = new Map(affiliates.map((a) => [a.id, a]));
  return {
    commissions: rows.map((c) => {
      const a = byId.get(c.affiliate_id);
      return {
        id: c.id,
        date: c.created_at,
        affiliateEmail: a?.email ?? '—',
        affiliateCode: a?.code ?? '—',
        buyerEmail: maskEmail(c.referred_email),
        productLabel: c.product_label || c.product_code || '—',
        saleAmountCents: c.sale_amount_cents,
        commissionPct: Number(c.commission_pct),
        commissionCents: c.commission_cents,
        status: c.status,
        paidAt: c.paid_at,
      };
    }),
  };
}

const AFFILIATE_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

async function actionAffiliateReview(actor, { id, status, adminNote }) {
  if (!id) return { error: 'Missing affiliate id' };
  if (!AFFILIATE_STATUSES.includes(status)) return { error: `Status must be one of: ${AFFILIATE_STATUSES.join(', ')}` };

  const result = await sbPatch('affiliates', `id=eq.${id}`, {
    status,
    admin_note: adminNote ?? null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: actor.email,
  });
  if (!result.ok) return { error: `Could not update that affiliate: ${result.raw?.slice(0, 160)}` };

  await audit(actor.email, `affiliate.${status}`, result.data?.[0]?.email ?? id, { adminNote });
  return { ok: true, status };
}

/** Sets one affiliate's rate. Existing commissions keep the rate they were earned at. */
async function actionAffiliateRate(actor, { id, commissionPct }) {
  const pct = Number(commissionPct);
  if (!id) return { error: 'Missing affiliate id' };
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return { error: 'Commission must be between 0 and 100' };

  const result = await sbPatch('affiliates', `id=eq.${id}`, { commission_pct: pct });
  if (!result.ok) return { error: `Could not update the rate: ${result.raw?.slice(0, 160)}` };

  await audit(actor.email, 'affiliate.rate', result.data?.[0]?.email ?? id, { commissionPct: pct });
  return { ok: true, commissionPct: pct };
}

/** Programme-wide default for future applicants. Does not touch existing rates. */
async function actionAffiliateDefaultRate(actor, { commissionPct }) {
  const pct = Number(commissionPct);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return { error: 'Commission must be between 0 and 100' };

  const existing = await sbSelect('app_settings', `select=key&key=eq.affiliate_default_pct&limit=1`);
  const result = existing.length
    ? await sbPatch('app_settings', 'key=eq.affiliate_default_pct', { value: String(pct), updated_at: new Date().toISOString() })
    : await sbInsertTolerant('app_settings', { key: 'affiliate_default_pct', value: String(pct) }, { key: 'affiliate_default_pct', value: String(pct) });
  if (!result.ok) return { error: 'Could not save the default rate' };

  await audit(actor.email, 'affiliate.defaultRate', 'app_settings', { commissionPct: pct });
  return { ok: true, commissionPct: pct };
}

const COMMISSION_STATUSES = ['pending', 'approved', 'paid', 'void'];

async function actionCommissionStatus(actor, { ids, status }) {
  const list = Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean);
  if (!list.length) return { error: 'No commissions selected' };
  if (!COMMISSION_STATUSES.includes(status)) return { error: `Status must be one of: ${COMMISSION_STATUSES.join(', ')}` };

  const query = `id=in.(${list.map((i) => encodeURIComponent(i)).join(',')})`;
  const result = await sbPatch('affiliate_commissions', query, {
    status,
    paid_at: status === 'paid' ? new Date().toISOString() : null,
  });
  if (!result.ok) return { error: `Could not update those commissions: ${result.raw?.slice(0, 160)}` };

  await audit(actor.email, `commission.${status}`, `${list.length} commission(s)`, { ids: list });
  return { ok: true, updated: result.data?.length ?? list.length };
}

// ─── Router ───────────────────────────────────────────────────────────────────

const READ_ACTIONS = {
  overview: actionOverview,
  customers: actionCustomers,
  payments: actionPayments,
  leads: actionLeads,
  audit: actionAudit,
  affiliates: actionAffiliates,
  commissions: actionCommissions,
};

const WRITE_ACTIONS = {
  'member.grant': actionMemberGrant,
  'member.revoke': actionMemberRevoke,
  'payment.manual': actionPaymentManual,
  'affiliate.review': actionAffiliateReview,
  'affiliate.rate': actionAffiliateRate,
  'affiliate.defaultRate': actionAffiliateDefaultRate,
  'commission.status': actionCommissionStatus,
};

export async function admin(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await requireAdmin(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const { action, ...params } = req.body ?? {};

  if (action === 'whoami') return res.status(200).json({ email: auth.email, role: auth.role });

  try {
    if (READ_ACTIONS[action]) {
      const payload = await READ_ACTIONS[action](params);
      return res.status(200).json(payload);
    }
    if (WRITE_ACTIONS[action]) {
      if (auth.role === 'viewer') return res.status(403).json({ error: 'Your account is read-only' });
      const payload = await WRITE_ACTIONS[action](auth, params);
      return res.status(payload?.error ? 400 : 200).json(payload);
    }
    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('[admin] action failed:', action, err);
    return res.status(500).json({ error: 'Something went wrong loading that view' });
  }
}

export default admin;
