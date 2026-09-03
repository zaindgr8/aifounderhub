/**
 * Server-side proxy for the Make.com lead webhook.
 *
 * The webhook URL used to sit in the client bundle, which meant anyone could
 * read it from view-source and post junk straight into the CRM (or burn the
 * Make operations quota). It now lives in LEAD_WEBHOOK_URL on the server and
 * the browser only ever talks to this endpoint.
 *
 * Best-effort by design: a webhook failure must never block a signup, so this
 * always responds 200 and reports what happened in the body.
 */

const WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL;

/* crude per-IP throttle so a scripted flood can't relay through us */
const HITS = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function rateLimited(ip) {
  const now = Date.now();
  const entry = HITS.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    HITS.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  if (HITS.size > 5000) HITS.clear(); // bound the map
  return entry.count > MAX_PER_WINDOW;
}

export async function leadWebhook(req, res) {
  const body = req.body || {};

  if (!body.email || !/\S+@\S+\.\S+/.test(String(body.email))) {
    return res.status(400).json({ ok: false, error: 'valid email required' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'too many requests' });
  }

  if (!WEBHOOK_URL) {
    // Not configured is a valid state — the lead is still saved by
    // /api/send-lead-email, which is the source of truth.
    return res.json({ ok: true, forwarded: false, reason: 'LEAD_WEBHOOK_URL not set' });
  }

  /* forward only the fields the automation needs — never pass the body through
     verbatim, or a caller could inject arbitrary keys into the scenario */
  const payload = {
    fullName: String(body.fullName || '').slice(0, 200),
    email: String(body.email).toLowerCase().slice(0, 320),
    phone: String(body.phone || '').slice(0, 40),
    countryCode: String(body.countryCode || '').slice(0, 8),
    dialCode: String(body.dialCode || '').slice(0, 8),
    fullPhoneNumber: String(body.fullPhoneNumber || '').slice(0, 48),
    goal: String(body.goal || 'explore').slice(0, 40),
    source: String(body.source || 'website').slice(0, 60),
    ticketNumber: String(body.ticketNumber || '').slice(0, 40),
    submittedAt: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstream = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.json({ ok: true, forwarded: upstream.ok, status: upstream.status });
  } catch (err) {
    console.error('lead-webhook forward failed:', err?.message || err);
    return res.json({ ok: true, forwarded: false, error: 'upstream unreachable' });
  }
}

export default leadWebhook;
