/**
 * POST /api/join-community
 *
 * Community application from the /progress dashboard.
 *   1. Saves the applicant as a lead (source: community) — best-effort
 *   2. Sends them a welcome email with the WhatsApp community link,
 *      a short intro to AI Founder Hub + AAA Accelerator, and the Luma calendar
 *   3. Notifies the owner
 *
 * Body: { fullName, email, about, reason, social }
 */

import { Resend } from 'resend';
import { sbSelect, sbPatch, sbInsertTolerant, supabaseConfigured, likeSafe } from './_admin-lib.js';

export const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/FBrasZIfmvLAZxcR2Yjcho';
export const LUMA_URL = 'https://luma.com/aifounderhub';

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

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

async function persistApplicant({ fullName, email, about, reason, social }) {
  if (!supabaseConfigured) return;
  const lower = email.toLowerCase();
  const notes = [
    about ? `About: ${about}` : null,
    reason ? `Why join: ${reason}` : null,
    social ? `Social/Website: ${social}` : null,
  ].filter(Boolean).join(' | ');
  const base = {
    first_name: fullName, email: lower, source: 'community',
    goal: 'explore', tags: ['source:community', 'community-application'], notes,
  };
  try {
    const existing = await sbSelect('leads', `select=id,submissions,tags&email=ilike.${encodeURIComponent(likeSafe(lower))}&limit=1`);
    if (existing.length) {
      const tags = Array.from(new Set([...(existing[0].tags || []), ...base.tags]));
      await sbPatch('leads', `id=eq.${existing[0].id}`, {
        tags, notes, submissions: (existing[0].submissions ?? 1) + 1, updated_at: new Date().toISOString(),
      });
      return;
    }
    const result = await sbInsertTolerant('leads', base, base);
    if (!result.ok) console.error('[community] lead insert failed:', result.status, result.raw?.slice(0, 200));
  } catch (err) {
    console.error('[community] persist error:', err?.message);
  }
}

function welcomeEmail({ fullName }) {
  const first = esc(String(fullName).trim().split(/\s+/)[0] || 'there');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to the AI Founder Hub Community</title></head>
<body style="margin:0;padding:0;background:#07070b;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07070b;padding:40px 16px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border:1px solid #1e1e2a;border-radius:18px;overflow:hidden;">

  <tr><td style="background:#0d0d14;padding:36px 36px 28px;border-bottom:1px solid #1e1e2a;">
    <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">⚡ AI Founder Hub</p>
    <h1 style="margin:14px 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">Welcome in, ${first}.</h1>
    <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;">You're now part of a community of builders learning to build and sell AI systems. Here's everything you need.</p>
  </td></tr>

  <tr><td style="background:#0d0d14;padding:28px 36px;">
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.2em;color:#52525b;text-transform:uppercase;">Step 1 · Join the conversation</p>
    <p style="margin:0 0 16px;font-size:14px;color:#e4e4e7;line-height:1.6;">Our WhatsApp community is where members share wins, ask questions and get first access to live builds.</p>
    <a href="${WHATSAPP_COMMUNITY_URL}" style="display:inline-block;background:#ccf244;color:#07070b;font-size:13px;font-weight:800;text-decoration:none;padding:13px 28px;border-radius:100px;letter-spacing:0.04em;text-transform:uppercase;">Join WhatsApp Community →</a>
  </td></tr>

  <tr><td style="background:#0d0d14;padding:4px 36px 28px;">
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.2em;color:#52525b;text-transform:uppercase;">Step 2 · Come to a live event</p>
    <p style="margin:0 0 12px;font-size:14px;color:#e4e4e7;line-height:1.6;">We run free live masterclasses and meetups — online and in Dubai.</p>
    <a href="${LUMA_URL}" style="color:#ccf244;font-size:14px;font-weight:700;text-decoration:none;">See upcoming events on Luma ↗</a>
  </td></tr>

  <tr><td style="background:#0a0a10;padding:28px 36px;border-top:1px solid #1e1e2a;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#ffffff;">What is AI Founder Hub?</p>
    <p style="margin:0 0 18px;font-size:13px;color:#a1a1aa;line-height:1.7;">A hands-on training hub for founders and freelancers who want to build and sell AI systems — lead management, voice agents and automations — no code required.</p>
    <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#ffffff;">The AAA Accelerator</p>
    <p style="margin:0 0 14px;font-size:13px;color:#a1a1aa;line-height:1.7;">Our gamified 6-stage programme to launch an AI Automation Agency and land your first $2,000/month client — blueprints, Master Claude in 7 Days, weekly live builds and a private builders group.</p>
    <a href="https://aifounderhub.com/aaa-accelerator" style="color:#ccf244;font-size:13px;font-weight:700;text-decoration:none;">Explore the Accelerator ↗</a>
  </td></tr>

  <tr><td style="background:#07070b;padding:18px 36px;border-top:1px solid #1e1e2a;">
    <p style="margin:0;font-size:11px;color:#3f3f46;text-align:center;">AI Founder Hub · You're receiving this because you applied to join the community at aifounderhub.com</p>
  </td></tr>

</table></td></tr></table></body></html>`;
}

export async function joinCommunity(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { fullName, email, about = '', reason = '', social = '' } = req.body ?? {};
    if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return res.status(400).json({ ok: false, error: 'Name and a valid email are required' });
    }
    if (!String(reason).trim()) {
      return res.status(400).json({ ok: false, error: 'Tell us briefly why you want to join' });
    }

    const clean = {
      fullName: String(fullName).slice(0, 120),
      email: String(email).trim().slice(0, 200),
      about: String(about).slice(0, 600),
      reason: String(reason).slice(0, 600),
      social: String(social).slice(0, 300),
    };

    await persistApplicant(clean);

    const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Founder Hub <hello@aifounderhub.com>';
    const owners = Array.from(new Set([
      'management@devmatesolutions.com',
      ...(process.env.OWNER_EMAIL || '').split(',').map((e) => e.trim()).filter(Boolean),
    ]));

    const [welcome] = await Promise.allSettled([
      getResend().emails.send({
        from: FROM_EMAIL,
        to: [clean.email],
        subject: 'Welcome to the AI Founder Hub Community ⚡',
        html: welcomeEmail(clean),
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: owners,
        subject: `👥 New Community Member: ${clean.fullName}`,
        html: `<div style="font-family:Inter,Arial,sans-serif;background:#07070b;color:#e4e4e7;padding:28px;border-radius:14px;max-width:520px;">
  <p style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;margin:0 0 8px;">⚡ AI Founder Hub</p>
  <h2 style="margin:0 0 18px;font-size:20px;font-weight:900;color:#fff;">👥 New community application</h2>
  <p style="margin:0 0 6px;"><strong>Name:</strong> ${esc(clean.fullName)}</p>
  <p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${esc(clean.email)}" style="color:#ccf244;">${esc(clean.email)}</a></p>
  <p style="margin:0 0 6px;"><strong>Social / Website:</strong> ${esc(clean.social) || '—'}</p>
  <p style="margin:12px 0 4px;"><strong>About:</strong></p><p style="margin:0;color:#a1a1aa;">${esc(clean.about) || '—'}</p>
  <p style="margin:12px 0 4px;"><strong>Why they want to join:</strong></p><p style="margin:0;color:#a1a1aa;">${esc(clean.reason)}</p>
</div>`,
      }),
    ]);

    const emailSent = welcome.status === 'fulfilled' && !welcome.value?.error;
    if (!emailSent) console.error('[community] welcome email failed:', welcome.status === 'rejected' ? welcome.reason : welcome.value?.error);

    // The WhatsApp link is returned too, so the applicant isn't stuck if email is slow or bounces.
    return res.status(200).json({ ok: true, emailSent, whatsappUrl: WHATSAPP_COMMUNITY_URL, lumaUrl: LUMA_URL });
  } catch (err) {
    console.error('[community] unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export default joinCommunity;
