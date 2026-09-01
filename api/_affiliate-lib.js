/**
 * Affiliate program — shared server logic.
 *
 * Underscore-prefixed so Vercel does not turn it into a route. Every function
 * here uses the service-role key and must only be reached through an
 * authenticated endpoint (api/affiliate.js or api/admin.js).
 *
 * Attribution model
 * -----------------
 *   1. A visitor lands with ?ref=CODE. The browser stores the code and pings
 *      `track`, which records a click for an APPROVED affiliate.
 *   2. When that visitor signs in for the first time, the browser calls `bind`.
 *      The server writes an affiliate_referrals row keyed on their email.
 *      First touch wins — a unique index means a later affiliate cannot take
 *      over someone else's referral.
 *   3. Every completed payment by a bound person creates one commission at the
 *      affiliate's CURRENT rate. That includes renewals of the monthly
 *      RoadMap — the binding is permanent, not first-purchase-only.
 */

import { PACKAGES, sbSelect, sbInsert, sbPatch, likeSafe } from './_admin-lib.js';

export const DEFAULT_COMMISSION_PCT = 15;

/**
 * Paid products an affiliate can promote, with the page each link lands on.
 * `all` is the universal link — the same code, so any purchase attributes back
 * regardless of which link was actually shared.
 */
export const AFFILIATE_PRODUCTS = [
  { code: 'all',              label: 'Everything (universal link)', path: '/',                        blurb: 'Lands on the homepage. Earns on whatever they buy.' },
  { code: 'claude-master',    label: 'Master Claude in 7 Days',     path: '/claude-master-in-7-days', blurb: '$45 one-time' },
  { code: 'aaa-accelerator',  label: 'Road to $50K/mo AI Agency',   path: '/progress',                blurb: '$159/mo — earns on every renewal' },
  { code: 'all-access',       label: 'All Access bundle',           path: '/#courses',                blurb: '$199 one-time' },
  { code: 'session-1on1',     label: '1:1 Private Session',         path: '/#mentors',                blurb: '$599 one-time' },
];

const lower = (v) => String(v ?? '').trim().toLowerCase();

// ─── Settings ─────────────────────────────────────────────────────────────────

let settingsCache = { at: 0, map: null };

export async function getSettings() {
  if (settingsCache.map && Date.now() - settingsCache.at < 60_000) return settingsCache.map;
  const rows = await sbSelect('app_settings', 'select=key,value');
  const map = new Map(rows.map((r) => [r.key, r.value]));
  settingsCache = { at: Date.now(), map };
  return map;
}

export async function defaultCommissionPct() {
  const settings = await getSettings();
  const raw = Number(settings.get('affiliate_default_pct'));
  return Number.isFinite(raw) && raw >= 0 && raw <= 100 ? raw : DEFAULT_COMMISSION_PCT;
}

export async function cookieDays() {
  const settings = await getSettings();
  const raw = Number(settings.get('affiliate_cookie_days'));
  return Number.isFinite(raw) && raw > 0 ? raw : 90;
}

// ─── Codes ────────────────────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 — these get misread when a code is typed by hand

function randomChunk(n) {
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

/** A readable code seeded from the person's name, e.g. ZAIN-7KQ2. */
async function generateUniqueCode(seedSource) {
  const seed = String(seedSource || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4) || 'AFH';

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `${seed}${randomChunk(4)}`;
    const clash = await sbSelect('affiliates', `select=id&code=ilike.${encodeURIComponent(likeSafe(code))}&limit=1`);
    if (!clash.length) return code;
  }
  return `AFH${randomChunk(7)}`; // vanishingly unlikely fallback
}

export function normalizeCode(code) {
  return String(code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

export async function getAffiliateByEmail(email) {
  const rows = await sbSelect('affiliates', `select=*&email=ilike.${encodeURIComponent(likeSafe(lower(email)))}&limit=1`);
  return rows[0] ?? null;
}

export async function getAffiliateByCode(code) {
  const clean = normalizeCode(code);
  if (!clean) return null;
  const rows = await sbSelect('affiliates', `select=*&code=ilike.${encodeURIComponent(likeSafe(clean))}&limit=1`);
  return rows[0] ?? null;
}

// ─── Application ──────────────────────────────────────────────────────────────

/** Creates a pending application. Idempotent — re-applying returns the existing row. */
export async function applyForAffiliate({ email, userId, fullName, payoutMethod, payoutDetails, note }) {
  const target = lower(email);
  const existing = await getAffiliateByEmail(target);
  if (existing) return { affiliate: existing, created: false };

  const code = await generateUniqueCode(fullName || target);
  const pct = await defaultCommissionPct();

  const result = await sbInsert('affiliates', {
    email: target,
    user_id: userId ?? null,
    full_name: fullName ?? null,
    code,
    status: 'pending',
    commission_pct: pct,
    payout_method: payoutMethod ?? null,
    payout_details: payoutDetails ?? null,
    applicant_note: note ?? null,
  });
  if (!result.ok) return { error: `Could not submit the application: ${result.raw?.slice(0, 160)}` };
  return { affiliate: result.data?.[0] ?? null, created: true };
}

// ─── Click tracking ───────────────────────────────────────────────────────────

/** Records a link visit. Silently ignores unknown or unapproved codes. */
export async function trackClick({ code, landingPath, referrer, visitorHash }) {
  const affiliate = await getAffiliateByCode(code);
  if (!affiliate || affiliate.status !== 'approved') return { ok: false };

  // The partial unique index dedupes the same browser on the same landing page,
  // so a refresh loop cannot inflate the count. A duplicate is a success here.
  const result = await sbInsert('affiliate_clicks', {
    affiliate_id: affiliate.id,
    code: affiliate.code,
    landing_path: String(landingPath ?? '/').slice(0, 300),
    referrer: referrer ? String(referrer).slice(0, 300) : null,
    visitor_hash: visitorHash ?? null,
  }, { returning: 'minimal' });

  // 409 is the dedupe index doing its job. Anything else is a real failure and
  // should be visible in the logs rather than silently reported as a duplicate.
  if (!result.ok && result.status !== 409) {
    console.warn('[affiliate] trackClick failed:', result.status, result.raw?.slice(0, 160));
    return { ok: true, duplicate: false, stored: false };
  }
  return { ok: true, duplicate: result.status === 409, stored: result.ok };
}

// ─── Referral binding ─────────────────────────────────────────────────────────

/**
 * Binds a signed-in person to the affiliate whose link they arrived through.
 * No-ops on self-referral, unapproved affiliates, or a person already bound.
 */
export async function bindReferral({ code, email, userId, landingPath }) {
  const target = lower(email);
  if (!target) return { ok: false, reason: 'no-email' };

  const affiliate = await getAffiliateByCode(code);
  if (!affiliate) return { ok: false, reason: 'unknown-code' };
  if (affiliate.status !== 'approved') return { ok: false, reason: 'not-approved' };
  if (lower(affiliate.email) === target) return { ok: false, reason: 'self-referral' };

  const existing = await sbSelect('affiliate_referrals', `select=id,affiliate_id&referred_email=ilike.${encodeURIComponent(likeSafe(target))}&limit=1`);
  if (existing.length) {
    // First touch wins — but fill in the user id if we did not have it before.
    if (userId) await sbPatch('affiliate_referrals', `id=eq.${existing[0].id}`, { referred_user_id: userId });
    return { ok: existing[0].affiliate_id === affiliate.id, reason: 'already-bound' };
  }

  const result = await sbInsert('affiliate_referrals', {
    affiliate_id: affiliate.id,
    referred_email: target,
    referred_user_id: userId ?? null,
    landing_path: landingPath ? String(landingPath).slice(0, 300) : null,
  }, { returning: 'minimal' });

  if (!result.ok && result.status !== 409) {
    console.warn('[affiliate] bindReferral failed:', result.status, result.raw?.slice(0, 160));
    return { ok: false, reason: 'write-failed' };
  }
  return { ok: true, reason: 'bound', affiliateCode: affiliate.code };
}

// ─── Commission ───────────────────────────────────────────────────────────────

/**
 * Creates the commission for a completed payment, if the buyer was referred.
 * Safe to call repeatedly: a unique index on payment_id means the second call
 * is a no-op rather than a double payout.
 *
 * Never throws — a reporting failure must not break a customer's checkout.
 */
export async function recordCommission({ paymentId, customerEmail, amountCents, productCode, productLabel }) {
  try {
    const target = lower(customerEmail);
    if (!target || !amountCents || amountCents <= 0) return { ok: false, reason: 'no-sale' };

    const referrals = await sbSelect('affiliate_referrals', `select=id,affiliate_id,first_purchase_at&referred_email=ilike.${encodeURIComponent(likeSafe(target))}&limit=1`);
    if (!referrals.length) return { ok: false, reason: 'not-referred' };

    const referral = referrals[0];
    const affiliates = await sbSelect('affiliates', `select=*&id=eq.${referral.affiliate_id}&limit=1`);
    const affiliate = affiliates[0];
    if (!affiliate) return { ok: false, reason: 'affiliate-missing' };
    if (affiliate.status !== 'approved') return { ok: false, reason: 'affiliate-not-approved' };
    if (lower(affiliate.email) === target) return { ok: false, reason: 'self-referral' };

    const pct = Number(affiliate.commission_pct ?? DEFAULT_COMMISSION_PCT);
    const commissionCents = Math.round((amountCents * pct) / 100);
    const pkg = PACKAGES[productCode];

    const result = await sbInsert('affiliate_commissions', {
      affiliate_id: affiliate.id,
      payment_id: paymentId ?? null,
      referred_email: target,
      product_code: productCode ?? null,
      product_label: productLabel ?? pkg?.label ?? null,
      sale_amount_cents: amountCents,
      commission_pct: pct,
      commission_cents: commissionCents,
      status: 'pending',
    }, { returning: 'minimal' });

    if (!result.ok) {
      // 409 = this payment already produced a commission. That is the guard
      // doing its job, not an error.
      if (result.status === 409) return { ok: false, reason: 'already-recorded' };
      console.warn('[affiliate] recordCommission failed:', result.status, result.raw?.slice(0, 160));
      return { ok: false, reason: 'write-failed' };
    }

    if (!referral.first_purchase_at) {
      await sbPatch('affiliate_referrals', `id=eq.${referral.id}`, { first_purchase_at: new Date().toISOString() });
    }

    console.log('[affiliate] commission recorded:', { affiliate: affiliate.code, commissionCents, pct });
    return { ok: true, commissionCents, pct, affiliateCode: affiliate.code };
  } catch (err) {
    console.error('[affiliate] recordCommission error:', err?.message);
    return { ok: false, reason: 'exception' };
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Masks a referred person's address — the affiliate needs a handle, not their PII. */
export function maskEmail(email) {
  const [user = '', domain = ''] = String(email ?? '').split('@');
  const head = user.slice(0, 2);
  return `${head}${'•'.repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

export async function affiliateStats(affiliateId) {
  const [clicks, referrals, commissions] = await Promise.all([
    sbSelect('affiliate_clicks', `select=id,created_at&affiliate_id=eq.${affiliateId}&limit=5000`),
    sbSelect('affiliate_referrals', `select=id,referred_email,created_at,first_purchase_at&affiliate_id=eq.${affiliateId}&order=created_at.desc&limit=2000`),
    sbSelect('affiliate_commissions', `select=*&affiliate_id=eq.${affiliateId}&order=created_at.desc&limit=2000`),
  ]);

  const live = commissions.filter((c) => c.status !== 'void');
  const sum = (rows) => rows.reduce((total, c) => total + (c.commission_cents ?? 0), 0);

  // Payouts are sent by hand, so the ledger is a review queue:
  //   pending  → earned, waiting for the team to check the referral
  //   approved → cleared, this is what the affiliate can actually claim
  //   paid     → transferred outside the system and marked off here

  return {
    clicks: clicks.length,
    referrals: referrals.length,
    buyers: new Set(live.map((c) => c.referred_email)).size,
    sales: live.length,
    earnedCents: sum(live),
    underReviewCents: sum(live.filter((c) => c.status === 'pending')),
    claimableCents: sum(live.filter((c) => c.status === 'approved')),
    paidCents: sum(live.filter((c) => c.status === 'paid')),
    salesVolumeCents: live.reduce((total, c) => total + (c.sale_amount_cents ?? 0), 0),
    recentReferrals: referrals.slice(0, 50).map((r) => ({
      email: maskEmail(r.referred_email),
      joinedAt: r.created_at,
      converted: Boolean(r.first_purchase_at),
    })),
    commissions: commissions.slice(0, 200).map((c) => ({
      id: c.id,
      date: c.created_at,
      email: maskEmail(c.referred_email),
      productLabel: c.product_label || c.product_code || '—',
      saleAmountCents: c.sale_amount_cents,
      commissionPct: Number(c.commission_pct),
      commissionCents: c.commission_cents,
      status: c.status,
      paidAt: c.paid_at,
    })),
  };
}
