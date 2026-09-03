import { Resend } from 'resend';
import { sbSelect, sbPatch, sbInsertTolerant, supabaseConfigured, likeSafe } from './_admin-lib.js';

// Goals the original lead_goal enum understood. Anything else (workshop,
// session) needs migration 0003, which widens the column to text; until then we
// fall back to 'explore' and keep the real value in tags so nothing is lost.
const ENUM_GOALS = ['founder', 'freelancer', 'scaleup', 'agency', 'explore'];

/**
 * Persists the lead to Supabase so /admin can report on signups by source.
 * Best-effort and never throws: the email notification is the critical path.
 */
async function persistLead(input) {
  if (!supabaseConfigured) return;
  const email = String(input.email).toLowerCase();
  const goal = input.goal || 'explore';
  const whyJoined = input.signupReason || input.reason;
  const persona = input.persona;
  const noteParts = [
    persona ? `Profile: ${persona}` : null,
    whyJoined ? `Why signed up: ${whyJoined}` : null,
  ].filter(Boolean);

  const tags = [
    `goal:${goal}`,
    `source:${input.source || 'website'}`,
    ...(input.workshopTitle ? ['workshop'] : []),
    ...(persona ? [`persona:${persona}`] : []),
  ];

  const shared = {
    first_name:   input.fullName,
    email,
    phone:        input.phone || null,
    country_code: input.countryCode || null,
    dial_code:    input.dialCode || null,
    source:       input.source || 'website',
    tags,
    notes:        noteParts.length ? noteParts.join(' | ') : null,
  };
  const full = {
    ...shared,
    goal,
    full_phone:     input.fullPhoneNumber || null,
    workshop_title: input.workshopTitle || null,
    ticket_number:  input.ticketNumber || null,
    last_seen_at:   new Date().toISOString(),
  };
  const base = { ...shared, goal: ENUM_GOALS.includes(goal) ? goal : 'explore' };

  try {
    const existing = await sbSelect('leads', `select=id,submissions&email=ilike.${encodeURIComponent(likeSafe(email))}&limit=1`);
    if (existing.length) {
      // Returning lead — refresh the record rather than colliding with the
      // unique email index, and count the extra submission.
      const patch = { ...full, submissions: (existing[0].submissions ?? 1) + 1, updated_at: new Date().toISOString() };
      const result = await sbPatch('leads', `id=eq.${existing[0].id}`, patch);
      if (!result.ok) await sbPatch('leads', `id=eq.${existing[0].id}`, base);
      return;
    }
    const result = await sbInsertTolerant('leads', full, base);
    if (!result.ok) console.error('[leads] insert failed:', result.status, result.raw?.slice(0, 200));
  } catch (err) {
    console.error('[leads] persistLead error:', err?.message);
  }
}

// lazily initialized after dotenv loads
let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// CORS headers — needed when running as a standalone Vercel serverless function
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export async function sendLeadEmail(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const {
      fullName,
      email,
      phone,
      dialCode,
      countryCode,
      fullPhoneNumber,
      goal,
      source,
      ticketNumber,
      submittedAt,
      workshopTitle,
      persona,
      signupReason,
      reason,
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ ok: false, error: 'Full name and email are required' });
    }

    const isMasterclass = goal === 'workshop' || source === 'freemasterclass-direct-page' || source === 'timed-popup-modal';
    if (isMasterclass && (!phone || !persona || (!signupReason && !reason))) {
      return res.status(400).json({ ok: false, error: 'All fields are compulsory: Name, Email, Phone Number, Persona, and Why You Signed Up.' });
    }

    // Store the lead first — an email provider outage should not lose the record.
    await persistLead({ fullName, email, phone, dialCode, countryCode, fullPhoneNumber, goal, source, ticketNumber, workshopTitle, persona, signupReason, reason });

    const OWNER_EMAIL = process.env.OWNER_EMAIL || 'management@devmatesolutions.com';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Founder Hub <onboarding@resend.dev>';

    const goalLabels = {
      founder:    'Launch a startup',
      freelancer: 'Become an AI freelancer',
      scaleup:    'Scale my existing business',
      agency:     'Start an automation agency',
      explore:    'Just exploring AI',
      workshop:   workshopTitle ? `Free MasterClass — ${workshopTitle}` : 'Free MasterClass',
    };
    const goalLabel = goalLabels[goal] || goal || '—';
    const isWorkshop = goal === 'workshop';
    const workshopLabel = workshopTitle || 'Free Master Class';
    const dateStr = submittedAt
      ? new Date(submittedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: true })
      : new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: true });

    // ─── Email 1: Internal lead notification to management ────────────────────
    const managementHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead — AI Founder Hub</title>
</head>
<body style="margin:0;padding:0;background:#07070b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid #1e1e2a;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d0d14 0%,#12121c 100%);padding:32px 40px;border-bottom:1px solid #1e1e2a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">⚡ AI Founder Hub</span>
                    <h1 style="margin:10px 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">New Lead Captured 🎯</h1>
                    <p style="margin:0 0 2px;font-size:13px;color:#71717a;">Submitted ${dateStr} (Dubai time)</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;background:#ccf244;color:#07070b;font-family:'Courier New',monospace;font-size:11px;font-weight:900;letter-spacing:0.15em;padding:6px 14px;border-radius:100px;text-transform:uppercase;">${ticketNumber || 'AFH-XXXXXX'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Banner -->
          <tr>
            <td style="background:linear-gradient(90deg,#1a2600 0%,#1e2e00 100%);padding:16px 40px;border-bottom:1px solid #2d4400;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#7a9c00;">📋 Lead Source</span>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:#ccf244;letter-spacing:0.05em;text-transform:uppercase;">🎓 FREE MASTER CLASS — ${workshopLabel}</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:#ccf244;color:#07070b;font-size:11px;font-weight:800;padding:5px 14px;border-radius:100px;text-transform:uppercase;letter-spacing:0.1em;">Free Seat</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Details -->
          <tr>
            <td style="background:#0d0d14;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Full Name</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">${fullName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Email Address</p>
                    <a href="mailto:${email}" style="margin:0;font-size:15px;font-weight:600;color:#ccf244;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Phone Number</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#e4e4e7;">${fullPhoneNumber || phone || '—'}</p>
                  </td>
                </tr>
                <tr><td style="border-top:1px solid #1e1e2a;padding-bottom:20px;"></td></tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 6px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Enrolled For</p>
                    <span style="display:inline-block;background:linear-gradient(90deg,#1a2600,#1e2e00);border:1px solid #2d4400;color:#ccf244;font-size:13px;font-weight:800;padding:6px 16px;border-radius:100px;text-transform:uppercase;letter-spacing:0.1em;">🎓 FREE SEAT — ${workshopLabel}</span>
                  </td>
                </tr>
                ${persona ? `
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">What Best Describes Them</p>
                    <p style="margin:0;font-size:14px;font-weight:700;color:#ccf244;">${persona}</p>
                  </td>
                </tr>
                ` : ''}
                ${(signupReason || reason) ? `
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Why They Signed Up</p>
                    <div style="background:#141420;border-left:3px solid #ccf244;padding:10px 14px;border-radius:0 8px 8px 0;">
                      <p style="margin:0;font-size:13px;font-weight:500;color:#e4e4e7;line-height:1.5;">${signupReason || reason}</p>
                    </div>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right:10px;">
                          <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Personal Goal</p>
                          <p style="margin:0;font-size:13px;font-weight:600;color:#b5a1ff;">${goalLabel}</p>
                        </td>
                        <td width="50%">
                          <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Country</p>
                          <p style="margin:0;font-size:13px;font-weight:600;color:#e4e4e7;">${countryCode || '—'} ${dialCode ? `(${dialCode})` : ''}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Actions -->
          <tr>
            <td style="background:#0a0a10;padding:24px 40px;border-top:1px solid #1e1e2a;">
              <p style="margin:0 0 14px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Quick Actions</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="mailto:${email}?subject=Your AI Founder Hub Access is Ready!&body=Hi ${encodeURIComponent(fullName)}," style="display:inline-block;background:#ccf244;color:#07070b;font-size:12px;font-weight:800;text-decoration:none;padding:10px 20px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">Reply to Lead →</a>
                  </td>
                  <td>
                    <a href="https://wa.me/${(fullPhoneNumber || '').replace(/[^0-9]/g, '')}" style="display:inline-block;background:#1e1e2a;color:#e4e4e7;font-size:12px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;border:1px solid #2a2a3a;">WhatsApp →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#07070b;padding:20px 40px;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:11px;color:#3f3f46;text-align:center;">AI Founder Hub · ${workshopLabel} Lead · Source: ${source || 'website-hero'}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // ─── Email 2: Confirmation email to the lead ──────────────────────────────
    const confirmationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're In! Free Master Class — AI Founder Hub</title>
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
              <h1 style="margin:16px 0 8px;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;line-height:1.2;">You're Registered! 🎉</h1>
              <p style="margin:0;font-size:15px;color:#71717a;line-height:1.6;">Your seat for the <strong style="color:#ccf244;">${workshopLabel}</strong> has been confirmed.</p>
            </td>
          </tr>

          <!-- Ticket + Details -->
          <tr>
            <td style="background:#0d0d14;padding:32px 40px;text-align:center;">

              <!-- Ticket badge -->
              <div style="background:linear-gradient(135deg,#12121c,#0a0a10);border:1px solid #1e1e2a;border-radius:16px;padding:28px 24px;margin-bottom:28px;">
                <p style="margin:0 0 10px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#52525b;">Your Access Ticket</p>
                <span style="display:inline-block;background:#ccf244;color:#07070b;font-family:'Courier New',monospace;font-size:20px;font-weight:900;letter-spacing:0.2em;padding:10px 28px;border-radius:100px;text-transform:uppercase;">${ticketNumber || 'AFH-XXXXXX'}</span>
              </div>

              <!-- Workshop label -->
              <div style="margin-bottom:24px;">
                <span style="display:inline-block;background:linear-gradient(90deg,#1a2600,#1e2e00);border:1px solid #2d4400;color:#ccf244;font-size:12px;font-weight:800;padding:5px 16px;border-radius:100px;text-transform:uppercase;letter-spacing:0.1em;">🎓 ${workshopLabel}</span>
              </div>

              <!-- Registration info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="text-align:left;">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Registered As</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">${fullName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Confirmation Email Sent To</p>
                    <p style="margin:0;font-size:14px;font-weight:600;color:#ccf244;">${email}</p>
                  </td>
                </tr>
                <tr><td style="border-top:1px solid #1e1e2a;padding-bottom:20px;"></td></tr>

                <!-- VIP WhatsApp Community Invite -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <div style="background:linear-gradient(135deg,#061a0e 0%,#0d2e1b 100%);border:1px solid #1f7a43;border-radius:16px;padding:24px 20px;text-align:center;">
                      <span style="display:inline-block;background:#25D366;color:#041a0d;font-family:'Courier New',monospace;font-size:10px;font-weight:900;letter-spacing:0.2em;padding:5px 14px;border-radius:100px;text-transform:uppercase;margin-bottom:12px;">
                        💬 VIP Community Access
                      </span>
                      <h3 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#ffffff;line-height:1.3;">
                        You Qualify to Join the AI Founder Hub Community! 🚀
                      </h3>
                      <p style="margin:0 0 18px;font-size:13px;color:#a7f3d0;line-height:1.6;">
                        You are officially invited to join our private WhatsApp group for masterclass attendees, founders, and AI builders. Join below to get live class updates, ask questions, and network:
                      </p>
                      <a href="https://chat.whatsapp.com/FBrasZIfmvLAZxcR2Yjcho" style="display:inline-block;background:#25D366;color:#041a0d;font-size:13px;font-weight:900;text-decoration:none;padding:13px 30px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;box-shadow:0 6px 20px rgba(37,211,102,0.35);">
                        👉 Join WhatsApp Community Now
                      </a>
                    </div>
                  </td>
                </tr>

                <tr><td style="border-top:1px solid #1e1e2a;padding-bottom:20px;"></td></tr>

                <!-- What's inside -->
                <tr>
                  <td>
                    <p style="margin:0 0 14px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">What You'll Learn in the Master Class</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #1e1e2a;">
                          <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><span style="color:#ccf244;margin-right:10px;">⚡</span>Build real AI-powered apps — no coding required</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #1e1e2a;">
                          <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><span style="color:#ccf244;margin-right:10px;">🚀</span>Go from idea to live product in days, not months</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #1e1e2a;">
                          <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><span style="color:#ccf244;margin-right:10px;">💰</span>How to land your first AI client or launch your SaaS</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><span style="color:#b5a1ff;margin-right:10px;">🎯</span>Live Q&amp;A — get your exact questions answered</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#0a0a10;padding:28px 40px;border-top:1px solid #1e1e2a;text-align:center;">
              <p style="margin:0 0 20px;font-size:14px;color:#a1a1aa;line-height:1.7;">We'll send you the class link &amp; schedule details shortly.<br/>In the meantime, explore more at AI Founder Hub.</p>
              <a href="https://aifounderhub.com" style="display:inline-block;background:#ccf244;color:#07070b;font-size:13px;font-weight:800;text-decoration:none;padding:13px 32px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">Visit AI Founder Hub →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#07070b;padding:20px 40px;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:11px;color:#3f3f46;text-align:center;">AI Founder Hub · Free Master Class Registration · You're receiving this because you signed up at aifounderhub.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // ─── Send both emails concurrently ────────────────────────────────────────
    const [managementResult, confirmationResult] = await Promise.allSettled([
      getResend().emails.send({
        from: FROM_EMAIL,
        to: [OWNER_EMAIL],
        reply_to: email,
        subject: `🎯 New Lead: ${fullName} — ${isWorkshop ? workshopLabel : goalLabel}`,
        html: managementHtml,
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: `🎉 You're registered for ${workshopLabel} — AI Founder Hub`,
        html: confirmationHtml,
      }),
    ]);

    // Log results
    if (managementResult.status === 'fulfilled' && !managementResult.value?.error) {
      console.log('[Resend] Management email sent, id:', managementResult.value?.data?.id);
    } else {
      const err = managementResult.value?.error || managementResult.reason;
      console.error('[Resend] Error sending management email:', err);
    }

    if (confirmationResult.status === 'fulfilled' && !confirmationResult.value?.error) {
      console.log('[Resend] Confirmation email sent, id:', confirmationResult.value?.data?.id);
    } else {
      const err = confirmationResult.value?.error || confirmationResult.reason;
      console.error('[Resend] Error sending confirmation email to lead:', err);
    }

    // Fail only if the management email failed (confirmation is best-effort)
    if (managementResult.status === 'rejected' || managementResult.value?.error) {
      const err = managementResult.value?.error || managementResult.reason;
      return res.status(500).json({ ok: false, error: err?.message || 'Failed to send management email' });
    }

    return res.status(200).json({
      ok: true,
      managementEmailId: managementResult.value?.data?.id,
      confirmationEmailId: confirmationResult.value?.data?.id ?? null,
    });
  } catch (err) {
    console.error('[Resend] Unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

// Default export so Vercel's serverless runtime picks this up automatically.
// (Express uses the named export above; Vercel uses this default.)
export default sendLeadEmail;
