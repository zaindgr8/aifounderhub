/**
 * POST /api/create-payment
 *
 * Creates a Ziina Payment Intent — supports multiple products:
 *   • $159 AI Founder Hub Course (default)
 *   • $299 Private 1:1 Session (pass amount + message in body)
 *
 * Body: { fullName, email, amount?, message?, cancelPath?, advisorName?, productCode? }
 *
 * Also records a `pending` row in the `payments` table so /admin can report on
 * checkouts that were started, not just the ones that completed.
 */

import { sessionStore } from './payment-store.js';
import { PACKAGES, sbInsertTolerant, supabaseConfigured } from './_admin-lib.js';

const ZIINA_API = 'https://api-v2.ziina.com/api';

// CORS helper (mirrors send-lead-email.js)
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export async function createPayment(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const {
      fullName, email,
      amount     = 15900,            // cents — default $159
      message    = 'AI Founder Hub — Idea to Live Product Course',
      cancelPath = '/#membership',
      advisorName,
      productCode,
    } = req.body ?? {};
    if (!fullName || !email) {
      return res.status(400).json({ ok: false, error: 'fullName and email are required' });
    }

    const apiKey  = process.env.ZIINA_API_KEY;
    const testMode = process.env.ZIINA_TEST_MODE !== 'false'; // defaults to test mode
    const appUrl  = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

    if (!apiKey) {
      console.error('[Ziina] ZIINA_API_KEY is not set');
      return res.status(500).json({ ok: false, error: 'Payment gateway not configured' });
    }

    // Build the Payment Intent request
    const payload = {
      amount,
      currency_code: 'USD',
      message,
      success_url: `${appUrl}/payment-success`,
      cancel_url:  `${appUrl}${cancelPath}`,
      failure_url: `${appUrl}/payment-failed`,
      allow_tips:  false,
      test: testMode,
    };

    console.log('[Ziina] Creating payment intent', { email, testMode, amount });

    const ziinaRes = await fetch(`${ZIINA_API}/payment_intent`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await ziinaRes.json().catch(() => ({}));

    if (!ziinaRes.ok) {
      console.error('[Ziina] API error', ziinaRes.status, data);
      return res.status(502).json({ ok: false, error: data?.message || 'Payment creation failed' });
    }

    const { id: paymentIntentId, redirect_url } = data;
    console.log('[Ziina] Payment intent created', { paymentIntentId, redirect_url });

    // Persist user details so confirm-payment can send the email
    sessionStore.set(paymentIntentId, { fullName, email, advisorName, amount, message, createdAt: Date.now() });

    // Record the attempt. Best-effort: a reporting write must never cost a sale.
    await recordPendingPayment({ paymentIntentId, redirect_url, fullName, email, amount, advisorName, productCode, testMode });

    return res.status(200).json({ ok: true, redirect_url, paymentIntentId });
  } catch (err) {
    console.error('[Ziina] Unexpected error in create-payment:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

/**
 * Writes the `pending` payments row. A 1:1 session is identified by the advisor
 * name the booking modal sends; everything else is the accelerator membership.
 */
async function recordPendingPayment({ paymentIntentId, redirect_url, fullName, email, amount, advisorName, productCode, testMode }) {
  if (!supabaseConfigured) return;
  const pkg = PACKAGES[productCode] || (advisorName ? PACKAGES['session-1on1'] : PACKAGES['aaa-accelerator']);
  const full = {
    purpose: pkg.purpose, status: 'pending', amount_fils: amount, amount_cents: amount, currency: 'USD',
    customer_name: fullName, customer_email: String(email).toLowerCase(),
    ziina_intent_id: paymentIntentId, ziina_redirect_url: redirect_url, is_test: testMode,
    product_code: pkg.code, product_label: advisorName ? `1:1 Private Session — ${advisorName}` : pkg.label,
    provider: 'ziina', metadata: advisorName ? { advisorName } : {},
  };
  const base = {
    purpose: pkg.purpose, status: 'pending', amount_fils: amount, currency: 'USD',
    customer_name: fullName, customer_email: String(email).toLowerCase(),
    ziina_intent_id: paymentIntentId, ziina_redirect_url: redirect_url, is_test: testMode,
  };
  try {
    const result = await sbInsertTolerant('payments', full, base);
    if (!result.ok) console.error('[payments] could not record pending row:', result.status, result.raw?.slice(0, 200));
  } catch (err) {
    console.error('[payments] recordPendingPayment error:', err?.message);
  }
}

export default createPayment;
