import { Resend } from 'resend';
import { sbSelect, sbPatch, sbInsertTolerant, likeSafe } from './_admin-lib.js';

/**
 * POST /api/course-enquiry
 * "Talk to our team" form on /how-to-build-your-ai-agency.
 * Emails the lead to management via Resend and saves it to the leads table (best-effort).
 */

let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

async function persistLead({ fullName, email, whatsapp, message, source }) {
  const shared = {
    first_name: fullName,
    email,
    phone: whatsapp || null,
    source,
    tags: ['course-enquiry', 'ai-agency-mastercourse'],
    notes: ['ENQUIRY: AI Agency Master Course', message ? `MESSAGE: ${message}` : null].filter(Boolean).join(' | '),
  };
  const full = { ...shared, goal: 'explore', full_phone: whatsapp || null, last_seen_at: new Date().toISOString() };
  try {
    const existing = await sbSelect('leads', `select=id,submissions&email=ilike.${encodeURIComponent(likeSafe(email))}&limit=1`);
    if (existing.length) {
      const patch = { ...full, submissions: (existing[0].submissions ?? 1) + 1, updated_at: new Date().toISOString() };
      const r = await sbPatch('leads', `id=eq.${existing[0].id}`, patch);
      if (!r.ok) await sbPatch('leads', `id=eq.${existing[0].id}`, shared);
      return;
    }
    const r = await sbInsertTolerant('leads', full, shared);
    if (!r.ok) console.error('[course-enquiry] lead insert failed:', r.status, r.raw?.slice(0, 200));
  } catch (err) {
    console.error('[course-enquiry] persistLead error:', err?.message);
  }
}

export async function courseEnquiry(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const fullName = String(body.fullName || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 200);
    const whatsapp = String(body.whatsapp || '').trim().slice(0, 40);
    const message = String(body.message || '').trim().slice(0, 1000);
    const placement = String(body.placement || 'page').trim().slice(0, 40);
    const source = `course-enquiry:${placement}`;

    if (!fullName || !email || !whatsapp) {
      return res.status(400).json({ ok: false, error: 'Name, email and WhatsApp number are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }

    await persistLead({ fullName, email, whatsapp, message, source });

    const recipients = Array.from(
      new Set([
        'management@devmatesolutions.com',
        ...(process.env.OWNER_EMAIL || '').split(',').map((e) => e.trim()).filter(Boolean),
      ]),
    );
    const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Founder Hub <hello@aifounderhub.com>';
    const waNumber = whatsapp.replace(/[^0-9]/g, '');
    const when = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Dubai', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
    });

    const row = (label, value) => `
      <tr><td style="padding:0 0 14px;">
        <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">${label}</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">${value}</p>
      </td></tr>`;

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#07070b;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070b;padding:32px 16px;"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:18px;overflow:hidden;border:1px solid #1e1e2a;background:#0d0d14;">
      <tr><td style="padding:28px 32px;border-bottom:1px solid #1e1e2a;">
        <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">AI Agency Master Course</span>
        <h1 style="margin:8px 0 4px;font-size:21px;font-weight:900;color:#ffffff;">New enquiry: contact this lead</h1>
        <p style="margin:0;font-size:13px;color:#a1a1aa;">${esc(when)} (Dubai) · from ${esc(placement)}</p>
      </td></tr>
      <tr><td style="padding:24px 32px 10px;"><table width="100%" cellpadding="0" cellspacing="0">
        ${row('Name', esc(fullName))}
        ${row('Email', `<a href="mailto:${esc(email)}" style="color:#ccf244;text-decoration:none;">${esc(email)}</a>`)}
        ${row('WhatsApp', esc(whatsapp))}
        ${message ? row('Message', esc(message).replace(/\n/g, '<br>')) : ''}
      </table></td></tr>
      <tr><td style="padding:18px 32px 26px;border-top:1px solid #1e1e2a;">
        <a href="mailto:${esc(email)}?subject=${encodeURIComponent('Your AI Agency Master Course enquiry')}" style="display:inline-block;background:#ccf244;color:#07070b;font-size:12px;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:100px;text-transform:uppercase;margin-right:8px;">Reply by email</a>
        ${waNumber ? `<a href="https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${fullName}, this is the AI Founder Hub team about the AI Agency Master Course.`)}" style="display:inline-block;background:#25D366;color:#041a0d;font-size:12px;font-weight:800;text-decoration:none;padding:10px 18px;border-radius:100px;text-transform:uppercase;">Open WhatsApp</a>` : ''}
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: recipients,
      reply_to: email,
      subject: `New course enquiry: ${fullName} (${placement})`,
      html,
    });
    if (error) {
      console.error('[course-enquiry] Resend error:', error);
      return res.status(502).json({ ok: false, error: 'Could not send your details. Please try again or message us on WhatsApp.' });
    }
    console.log('[course-enquiry] management email sent, id:', data?.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[course-enquiry] unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export default courseEnquiry;
