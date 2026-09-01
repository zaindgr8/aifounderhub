/**
 * POST /api/confirm-payment
 *
 * 1. Verifies a Ziina Payment Intent is "completed"
 * 2. Looks up the customer (fullName, email) from the session store
 * 3. Upserts a member record in Supabase (granting /progress access)
 * 4. Sends a Supabase magic-link email so the customer can set their password
 * 5. Sends a purchase-confirmation email via Resend
 * 6. Returns { ok, status, alreadySent }
 *
 * Body: { paymentIntentId: string }
 */

import { Resend } from 'resend';
import { sessionStore } from './payment-store.js';
import { PACKAGES, sbSelect, sbPatch, sbInsertTolerant, supabaseConfigured, likeSafe } from './_admin-lib.js';
import { recordCommission } from './_affiliate-lib.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Upsert a row in the `members` table using the Supabase REST API.
 * Gives the email 31 days of active access.
 */
async function upsertMember(email, { fullName, pkg } = {}) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn('[Supabase] upsertMember: missing env vars, skipping');
    return;
  }

  const code = pkg?.code || 'aaa-accelerator';
  // One-time courses do not lapse; the monthly RoadMap gets a 31-day window
  // that each renewal payment extends.
  const expiresAt = pkg && pkg.recurring === false
    ? null
    : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // grant_member_product() upserts on (email, product) atomically. Posting
    // straight to /members cannot: the uniqueness lives on an expression index,
    // which PostgREST has no way to name as a conflict target — that is what
    // made a second purchase 409 and silently drop the entitlement.
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/grant_member_product`, {
      method: 'POST',
      headers: {
        apikey:         SERVICE_KEY,
        Authorization:  `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_email:         email.toLowerCase(),
        p_product_code:  code,
        p_product_label: pkg?.label ?? null,
        p_status:        'active',
        p_expires_at:    expiresAt,
        p_full_name:     fullName ?? null,
        p_source:        'checkout',
      }),
    });

    if (res.ok) {
      console.log('[Supabase] Entitlement granted:', email, '→', code);
      return;
    }

    const err = await res.text();
    console.error('[Supabase] grant_member_product failed:', res.status, err);
    // Migration 0005 not applied yet — fall back so a sale still grants access.
    await legacyUpsertMember(email, { fullName, pkg, expiresAt });
  } catch (err) {
    console.error('[Supabase] upsertMember error:', err);
  }
}

/**
 * Pre-0005 path: read-then-write against (email, product). Not atomic, but it
 * keeps checkout working on a database that has not run the migration yet.
 */
async function legacyUpsertMember(email, { fullName, pkg, expiresAt }) {
  const code = pkg?.code || 'aaa-accelerator';
  const headers = {
    apikey:         SERVICE_KEY,
    Authorization:  `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
  const body = {
    email: email.toLowerCase(),
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expiresAt,
    ...(fullName ? { full_name: fullName } : {}),
    ...(pkg ? { product_code: pkg.code, product_label: pkg.label, source: 'checkout' } : {}),
  };

  try {
    const existing = await sbSelect(
      'members',
      `select=id&email=ilike.${encodeURIComponent(likeSafe(email.toLowerCase()))}&product_code=eq.${encodeURIComponent(code)}&limit=1`,
    );
    const result = existing.length
      ? await sbPatch('members', `id=eq.${existing[0].id}`, body)
      : await sbInsertTolerant('members', body, { email: body.email, status: 'active', expires_at: expiresAt });
    if (!result.ok) console.error('[Supabase] legacyUpsertMember failed:', result.status, result.raw?.slice(0, 200));
  } catch (err) {
    console.error('[Supabase] legacyUpsertMember error:', err?.message);
  }
}

/**
 * Send a Supabase magic-link invite so the customer can set their password
 * and access /progress without needing to remember anything.
 */
async function inviteSupabaseUser(email, fullName) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        apikey:         SERVICE_KEY,
        Authorization:  `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        data: { full_name: fullName },
        redirect_to: `${process.env.APP_URL || 'https://aifounderhub.com'}/progress`,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok && body?.msg !== 'A user with this email address has already been registered') {
      console.warn('[Supabase] inviteSupabaseUser failed:', res.status, body);
    } else {
      console.log('[Supabase] Invite sent (or user already exists) for:', email);
    }
  } catch (err) {
    console.error('[Supabase] inviteSupabaseUser error:', err);
  }
}

const ZIINA_API = 'https://api-v2.ziina.com/api';

// Track IDs we've already confirmed so double-hits don't send duplicate emails.
// This only covers a single warm instance — settlePayment() below uses the
// payments row as the durable, cross-instance idempotency guard.
const confirmedIds = new Set();

/** The pending row written by create-payment, if it is still around. */
async function findPaymentRow(paymentIntentId) {
  if (!supabaseConfigured) return null;
  const rows = await sbSelect('payments', `select=*&ziina_intent_id=eq.${encodeURIComponent(paymentIntentId)}&limit=1`);
  return rows[0] ?? null;
}

/**
 * Moves the payments row to its final state. If create-payment's row is missing
 * (cold serverless instance, or a payment made before payments were persisted)
 * the row is created here instead, so revenue is never silently lost.
 */
async function settlePayment(paymentIntentId, existing, { status, amount, fullName, email, advisorName, pkg, error }) {
  if (!supabaseConfigured) return;
  const now = new Date().toISOString();
  try {
    if (existing) {
      const full = { status, ...(status === 'completed' ? { completed_at: now } : {}), ...(error ? { latest_error: error } : {}) };
      const result = await sbPatch('payments', `id=eq.${existing.id}`, full);
      if (!result.ok) await sbPatch('payments', `id=eq.${existing.id}`, { status });
      return existing.id;
    }
    const label = advisorName ? `1:1 Private Session — ${advisorName}` : pkg.label;
    const full = {
      purpose: pkg.purpose, status, amount_fils: amount, amount_cents: amount, currency: 'USD',
      customer_name: fullName, customer_email: String(email || '').toLowerCase(),
      ziina_intent_id: paymentIntentId, is_test: process.env.ZIINA_TEST_MODE !== 'false',
      product_code: pkg.code, product_label: label, provider: 'ziina',
      ...(status === 'completed' ? { completed_at: now } : {}),
    };
    const base = {
      purpose: pkg.purpose, status, amount_fils: amount, currency: 'USD',
      customer_name: fullName, customer_email: String(email || '').toLowerCase(),
      ziina_intent_id: paymentIntentId, is_test: process.env.ZIINA_TEST_MODE !== 'false',
    };
    const result = await sbInsertTolerant('payments', full, base);
    if (!result.ok) {
      console.error('[payments] settle insert failed:', result.status, result.raw?.slice(0, 200));
      return null;
    }
    return result.data?.[0]?.id ?? null;
  } catch (err) {
    console.error('[payments] settlePayment error:', err?.message);
    return null;
  }
}

let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── Email template ────────────────────────────────────────────────────────────
function buildConfirmationEmail({ fullName, email, paymentIntentId }) {
  const dateStr = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dubai',
    hour12: true,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmed — AI Founder Hub</title>
</head>
<body style="margin:0;padding:0;background:#07070b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid #1e1e2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d0d14 0%,#12121c 100%);padding:40px 40px 32px;border-bottom:1px solid #1e1e2a;text-align:center;">
              <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">⚡ AI Founder Hub</span>
              <h1 style="margin:16px 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;line-height:1.2;">Welcome to AAA Accelerator! 🎉</h1>
              <p style="margin:0;font-size:15px;color:#a1a1aa;line-height:1.6;">You are enrolled in the upcoming <strong style="color:#ccf244;">20th September Cohort</strong>.</p>
            </td>
          </tr>

          <!-- Receipt -->
          <tr>
            <td style="background:#0d0d14;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Enrolled Member</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">${fullName}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Registered Email</p>
                    <p style="margin:0;font-size:14px;font-weight:600;color:#ccf244;">${email}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Cohort Kick-off Date</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">20th September 2026</p>
                  </td>
                </tr>

                <!-- Receipt block -->
                <tr>
                  <td>
                    <div style="background:linear-gradient(135deg,#12121c,#0a0a10);border:1px solid #1e1e2a;border-radius:16px;padding:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:12px;border-bottom:1px solid #1e1e2a;">
                            <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#52525b;">Membership Summary</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:16px;padding-bottom:16px;border-bottom:1px solid #1e1e2a;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td>
                                  <p style="margin:0;font-size:13px;font-weight:600;color:#e4e4e7;">AAA Accelerator — 20th September Cohort</p>
                                  <p style="margin:4px 0 0;font-size:11px;color:#52525b;">All 6-Stage Blueprints · Private Community · Weekly Live Builds</p>
                                </td>
                                <td align="right">
                                  <p style="margin:0;font-size:15px;font-weight:800;color:#ccf244;">$159.00</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:12px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td><p style="margin:0;font-size:12px;font-weight:700;color:#71717a;">TOTAL PAID</p></td>
                                <td align="right"><p style="margin:0;font-size:18px;font-weight:900;color:#ffffff;">$159.00 USD / mo</p></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- What's inside -->
          <tr>
            <td style="background:#0d0d14;padding:0 40px 32px;">
              <p style="margin:0 0 14px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">What's Unlocked In Your Membership</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
    ['🤖', 'Production AI Lead Management System & Retell / Vapi Voice Prompts'],
    ['📦', 'Complete n8n & Make.com CRM Synchronization Workflows'],
    ['🎯', 'High-Converting Cold Outreach Campaigns & Email Templates'],
    ['📑', 'The Exact $2,000 Setup + $600/mo Retainer Contract Templates'],
    ['👥', 'Private Builders Community & Weekly Live Build Office Hours'],
    ['🏆', 'Full 6-Stage Gamified Game Map Dashboard Access (Zero to $50K/mo)'],
  ].map(([icon, text]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e1e2a;">
                    <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><span style="color:#ccf244;margin-right:10px;">${icon}</span>${text}</p>
                  </td>
                </tr>`).join('')}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#0a0a10;padding:28px 40px;border-top:1px solid #1e1e2a;text-align:center;">
              <p style="margin:0 0 20px;font-size:14px;color:#a1a1aa;line-height:1.7;">Your member dashboard is ready with all stages unlocked.<br/>Log in using your registered email address.</p>
              <a href="https://aifounderhub.com/progress" style="display:inline-block;background:#ccf244;color:#07070b;font-size:13px;font-weight:800;text-decoration:none;padding:14px 34px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">Access Member Dashboard →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#07070b;padding:20px 40px;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:11px;color:#3f3f46;text-align:center;">AI Founder Hub · Payment ID: ${paymentIntentId} · You're receiving this because you purchased at aifounderhub.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function confirmPayment(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { paymentIntentId } = req.body ?? {};
    if (!paymentIntentId) {
      return res.status(400).json({ ok: false, error: 'paymentIntentId is required' });
    }

    const apiKey = process.env.ZIINA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'Payment gateway not configured' });
    }

    // 1. Verify with Ziina
    const ziinaRes = await fetch(`${ZIINA_API}/payment_intent/${paymentIntentId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await ziinaRes.json().catch(() => ({}));
    if (!ziinaRes.ok) {
      console.error('[Ziina] confirm lookup failed', ziinaRes.status, data);
      return res.status(502).json({ ok: false, error: data?.message || 'Could not verify payment' });
    }

    const { status, amount, currency_code } = data;
    console.log('[Ziina] Payment intent status:', { paymentIntentId, status });

    const existingRow = await findPaymentRow(paymentIntentId);

    if (status !== 'completed') {
      const failedPkg = existingRow ? (PACKAGES[existingRow.product_code] || PACKAGES['aaa-accelerator']) : PACKAGES['aaa-accelerator'];
      await settlePayment(paymentIntentId, existingRow, {
        status: status === 'failed' ? 'failed' : 'pending',
        amount, fullName: existingRow?.customer_name, email: existingRow?.customer_email,
        pkg: failedPkg, error: `Ziina reported status: ${status}`,
      });
      return res.status(200).json({ ok: false, status, error: `Payment is not completed (status: ${status})` });
    }

    // 2. Idempotency — the payments row survives across serverless instances,
    //    so it is the guard that actually prevents duplicate emails.
    if (confirmedIds.has(paymentIntentId) || existingRow?.status === 'completed') {
      console.log('[Ziina] Already confirmed, skipping email:', paymentIntentId);
      return res.status(200).json({ ok: true, status, alreadySent: true });
    }
    confirmedIds.add(paymentIntentId);

    // 3. Retrieve customer details
    const session      = sessionStore.get(paymentIntentId);
    const fullName     = session?.fullName     ?? 'Valued Customer';
    const email        = session?.email;
    const advisorName  = session?.advisorName; // present for session bookings
    const isSession    = !!advisorName;
    // The pending row created at checkout carries the real product code; fall
    // back to the session/RoadMap guess only when that row is gone.
    const pkg =
      PACKAGES[existingRow?.product_code] ||
      (isSession ? PACKAGES['session-1on1'] : PACKAGES['aaa-accelerator']);
    const productLabel = isSession
      ? `Private 1:1 Session with ${advisorName}`
      : existingRow?.product_label || pkg.label;

    // 4a. Grant member access in Supabase (all purchases get /progress access)
    //     and mark the order paid so /admin can attribute the revenue.
    const settleEmail = email || existingRow?.customer_email;
    const [settled] = await Promise.allSettled([
      settlePayment(paymentIntentId, existingRow, {
        status: 'completed', amount,
        fullName: session?.fullName || existingRow?.customer_name,
        email: settleEmail, advisorName, pkg,
      }),
      ...(email ? [upsertMember(email, { fullName, pkg }), inviteSupabaseUser(email, fullName)] : []),
    ]);

    // 4b. Credit the affiliate who referred this buyer, if there is one.
    //     Idempotent on payment_id, and it never throws — a commission problem
    //     must not stop the customer's confirmation email.
    await recordCommission({
      paymentId: settled.status === 'fulfilled' ? settled.value : null,
      customerEmail: settleEmail,
      amountCents: amount,
      productCode: pkg.code,
      productLabel,
    });

    const OWNER_EMAIL = process.env.OWNER_EMAIL || 'management@devmatesolutions.com';
    const FROM_EMAIL  = process.env.FROM_EMAIL   || 'AI Founder Hub <hello@aifounderhub.com>';

    const emailPromises = [];

    // 4. Send confirmation to customer (if we have their email)
    if (email) {
      emailPromises.push(
        getResend().emails.send({
          from:    FROM_EMAIL,
          to:      [email],
          subject: isSession
            ? `🗓️ Session Booked — 1:1 with ${advisorName} · AI Founder Hub`
            : '🎉 Payment Confirmed — AI Founder Hub Course Access',
          html:    buildConfirmationEmail({ fullName, email, paymentIntentId }),
        }),
      );
    }

    // 5. Notify owner
    emailPromises.push(
      getResend().emails.send({
        from:    FROM_EMAIL,
        to:      [OWNER_EMAIL],
        subject: isSession
          ? `🗓️ Session Booked: ${fullName} — 1:1 with ${advisorName} · $${(amount / 100).toFixed(2)} ${currency_code}`
          : `💰 New Purchase: ${fullName} — ${productLabel} · $${(amount / 100).toFixed(2)} ${currency_code}`,
        html: `<div style="font-family:Inter,Arial,sans-serif;background:#07070b;color:#e4e4e7;padding:32px;border-radius:16px;max-width:520px;">
  <p style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;margin:0 0 8px;">⚡ AI Founder Hub</p>
  <h2 style="margin:0 0 20px;font-size:22px;font-weight:900;color:#ffffff;">${isSession ? '🗓️ New Session Booked!' : '💰 New Purchase!'}</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-size:11px;color:#71717a;font-family:'Courier New',monospace;text-transform:uppercase;">Product</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-weight:700;color:#ccf244;">${productLabel}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-size:11px;color:#71717a;font-family:'Courier New',monospace;text-transform:uppercase;">Amount</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-weight:800;color:#ffffff;font-size:18px;">$${(amount / 100).toFixed(2)} ${currency_code}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-size:11px;color:#71717a;font-family:'Courier New',monospace;text-transform:uppercase;">Customer</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-weight:700;color:#ffffff;">${fullName}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-size:11px;color:#71717a;font-family:'Courier New',monospace;text-transform:uppercase;">Email</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2a;"><a href="mailto:${email}" style="color:#ccf244;">${email ?? '—'}</a></td></tr>
    ${advisorName ? `<tr><td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-size:11px;color:#71717a;font-family:'Courier New',monospace;text-transform:uppercase;">Session With</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e1e2a;font-weight:700;color:#b5a1ff;">${advisorName}</td></tr>` : ''}
    <tr><td style="padding:10px 0;font-size:11px;color:#71717a;font-family:'Courier New',monospace;text-transform:uppercase;">Payment ID</td>
        <td style="padding:10px 0;font-family:'Courier New',monospace;font-size:11px;color:#52525b;">${paymentIntentId}</td></tr>
  </table>
  ${isSession ? '<p style="margin-top:20px;font-size:13px;color:#71717a;">📌 Arrange the session time with the customer via email or WhatsApp.</p>' : ''}
</div>`,
      }),
    );

    const results = await Promise.allSettled(emailPromises);
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`[Resend] Email ${i} failed:`, r.reason);
      else if (r.value?.error) console.error(`[Resend] Email ${i} error:`, r.value.error);
      else console.log(`[Resend] Email ${i} sent, id:`, r.value?.data?.id);
    });

    // Clean up session store
    sessionStore.delete(paymentIntentId);

    return res.status(200).json({ ok: true, status, alreadySent: false });
  } catch (err) {
    console.error('[Ziina] Unexpected error in confirm-payment:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export default confirmPayment;
