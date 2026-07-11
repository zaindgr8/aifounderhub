/**
 * POST /api/confirm-payment
 *
 * 1. Verifies a Ziina Payment Intent is "completed"
 * 2. Looks up the customer (fullName, email) from the session store
 * 3. Sends a purchase-confirmation email via Resend
 * 4. Returns { ok, status, alreadySent }
 *
 * Body: { paymentIntentId: string }
 */

import { Resend } from 'resend';
import { sessionStore } from './payment-store.js';

const ZIINA_API = 'https://api-v2.ziina.com/api';

// Track IDs we've already confirmed so double-hits don't send duplicate emails
const confirmedIds = new Set();

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
              <h1 style="margin:16px 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;line-height:1.2;">Payment Confirmed! 🎉</h1>
              <p style="margin:0;font-size:15px;color:#71717a;line-height:1.6;">You now have full access to the <strong style="color:#ccf244;">Idea to Live Product</strong> course.</p>
            </td>
          </tr>

          <!-- Receipt -->
          <tr>
            <td style="background:#0d0d14;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Purchased By</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">${fullName}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Confirmation Email</p>
                    <p style="margin:0;font-size:14px;font-weight:600;color:#ccf244;">${email}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Transaction Date</p>
                    <p style="margin:0;font-size:13px;font-weight:500;color:#a1a1aa;">${dateStr} (Dubai time)</p>
                  </td>
                </tr>

                <!-- Receipt block -->
                <tr>
                  <td>
                    <div style="background:linear-gradient(135deg,#12121c,#0a0a10);border:1px solid #1e1e2a;border-radius:16px;padding:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:12px;border-bottom:1px solid #1e1e2a;">
                            <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#52525b;">Order Summary</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:16px;padding-bottom:16px;border-bottom:1px solid #1e1e2a;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td>
                                  <p style="margin:0;font-size:13px;font-weight:600;color:#e4e4e7;">AI Founder Hub — Idea to Live Product Course</p>
                                  <p style="margin:4px 0 0;font-size:11px;color:#52525b;">Lifetime access · Private community · All modules</p>
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
                                <td align="right"><p style="margin:0;font-size:18px;font-weight:900;color:#ffffff;">$159.00 USD</p></td>
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
              <p style="margin:0 0 14px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">What's Included</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
    ['⚡', 'Private Community Access — Online & In-Person Dubai Meetups with AI Builders'],
    ['🤖', 'Claude, Codex & Latest AI Models — What Top Builders Actually Ship With'],
    ['🏗️', 'Full-Stack Live Builds — Frontend, Backend, Database from Scratch'],
    ['🚀', 'From Code to Live — GitHub, Vercel, App Store & Play Store'],
    ['📈', 'Growth & Marketing Roadmap — Step-by-Step to Your First 50 Paying Users'],
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
              <p style="margin:0 0 20px;font-size:14px;color:#a1a1aa;line-height:1.7;">We'll send your access link within 24 hours.<br/>In the meantime, explore at AI Founder Hub.</p>
              <a href="https://aifounderhub.com" style="display:inline-block;background:#ccf244;color:#07070b;font-size:13px;font-weight:800;text-decoration:none;padding:13px 32px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">Visit AI Founder Hub →</a>
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

    if (status !== 'completed') {
      return res.status(200).json({ ok: false, status, error: `Payment is not completed (status: ${status})` });
    }

    // 2. Idempotency — don't send email twice
    if (confirmedIds.has(paymentIntentId)) {
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
    const productLabel = isSession
      ? `Private 1:1 Session with ${advisorName}`
      : 'Idea to Live Product Course';

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
