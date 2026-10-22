import { Resend } from 'resend';
import { sbSelect, sbPatch, sbInsertTolerant, supabaseConfigured, likeSafe } from './_admin-lib.js';

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

/**
 * Persists build request to Supabase leads table.
 */
async function persistBuildLead(input) {
  if (!supabaseConfigured) return;
  const email = String(input.email || '').toLowerCase().trim();
  const resourceTitle = input.resourceTitle || 'Custom Project';
  const notes = [
    `SERVICE: Help Me Build / Hire Developer`,
    `RESOURCE: ${resourceTitle}`,
    input.timeline ? `TIMELINE: ${input.timeline}` : null,
    input.budget ? `BUDGET: ${input.budget}` : null,
    input.projectDetails ? `DETAILS: ${input.projectDetails}` : null,
  ].filter(Boolean).join(' | ');

  const tags = [
    'hire-developer',
    'help-me-build',
    `resource:${resourceTitle.slice(0, 36)}`,
    input.budget ? `budget:${input.budget}` : null,
  ].filter(Boolean);

  const shared = {
    first_name:   input.fullName,
    email,
    phone:        input.phone || null,
    country_code: input.countryCode || null,
    dial_code:    input.dialCode || null,
    source:       input.source || 'resources-help-build',
    tags,
    notes,
  };

  const full = {
    ...shared,
    goal:           'explore',
    full_phone:     input.fullPhoneNumber || null,
    workshop_title: `Build Request: ${resourceTitle}`,
    ticket_number:  input.ticketNumber || null,
    last_seen_at:   new Date().toISOString(),
  };

  try {
    const existing = await sbSelect('leads', `select=id,submissions&email=ilike.${encodeURIComponent(likeSafe(email))}&limit=1`);
    if (existing.length) {
      const patch = { ...full, submissions: (existing[0].submissions ?? 1) + 1, updated_at: new Date().toISOString() };
      const res = await sbPatch('leads', `id=eq.${existing[0].id}`, patch);
      if (!res.ok) await sbPatch('leads', `id=eq.${existing[0].id}`, shared);
      return;
    }
    const res = await sbInsertTolerant('leads', full, shared);
    if (!res.ok) console.error('[help-build-request] lead insert failed:', res.status, res.raw?.slice(0, 200));
  } catch (err) {
    console.error('[help-build-request] persistBuildLead error:', err?.message);
  }
}

/**
 * Optional Make.com webhook forward
 */
async function forwardWebhook(payload) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    console.warn('[help-build-request] webhook forward failed:', e?.message);
  }
}

export async function helpBuildRequest(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const {
      fullName,
      email,
      phone,
      countryCode,
      dialCode,
      fullPhoneNumber,
      resourceTitle,
      projectDetails,
      timeline,
      budget,
      source = 'resources-help-build',
    } = req.body || {};

    if (!fullName || !email || !projectDetails) {
      return res.status(400).json({
        ok: false,
        error: 'Full name, email address, and project details are required.',
      });
    }

    if (!/\S+@\S+\.\S+/.test(String(email))) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }

    const ticketNumber = `AFH-DEV-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const targetResource = resourceTitle || 'Custom AI System / Developer Request';
    const cleanPhone = fullPhoneNumber || (dialCode ? `${dialCode} ${phone || ''}`.trim() : phone) || '—';
    const waNumber = cleanPhone.replace(/[^0-9]/g, '');

    const dateStr = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Dubai',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Persist lead in DB (best-effort)
    await persistBuildLead({
      fullName,
      email,
      phone,
      countryCode,
      dialCode,
      fullPhoneNumber: cleanPhone,
      resourceTitle: targetResource,
      projectDetails,
      timeline,
      budget,
      ticketNumber,
      source,
    });

    // 2. Forward to Make webhook if set
    forwardWebhook({
      service: 'hire-developer',
      fullName,
      email,
      phone: cleanPhone,
      resourceTitle: targetResource,
      projectDetails,
      timeline,
      budget,
      ticketNumber,
      submittedAt: new Date().toISOString(),
    });

    // 3. Email Recipients Setup
    const defaultRecipient = 'management@devmatesolutions.com';
    const envRecipients = (process.env.OWNER_EMAIL || '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    const ownerRecipients = Array.from(new Set([defaultRecipient, ...envRecipients]));
    const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Founder Hub <hello@aifounderhub.com>';

    // ── Email 1: Internal Alert to AFH Management ─────────────────────────────
    const managementHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Build Request — AI Founder Hub</title>
</head>
<body style="margin:0;padding:0;background:#07070b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070b;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid #1e1e2a;background:#0d0d14;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#121808 0%,#151222 100%);padding:32px 36px;border-bottom:1px solid #232a15;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">⚡ AFH Engineering Squad</span>
                    <h1 style="margin:8px 0 4px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">New Build / Hire Developer Request 🛠️</h1>
                    <p style="margin:0;font-size:13px;color:#a1a1aa;">Submitted ${dateStr} (Dubai time)</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;background:#ccf244;color:#07070b;font-family:'Courier New',monospace;font-size:11px;font-weight:900;letter-spacing:0.15em;padding:6px 14px;border-radius:100px;text-transform:uppercase;">${ticketNumber}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Resource Tag -->
          <tr>
            <td style="background:#131520;padding:16px 36px;border-bottom:1px solid #1e1e2a;">
              <span style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#818cf8;">TARGET RESOURCE / SYSTEM:</span>
              <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#ffffff;">${targetResource}</p>
            </td>
          </tr>

          <!-- Client Details -->
          <tr>
            <td style="padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Client Name</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">${fullName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Email Address</p>
                    <a href="mailto:${email}" style="margin:0;font-size:15px;font-weight:600;color:#ccf244;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">WhatsApp / Phone</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#e4e4e7;">${cleanPhone}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right:10px;">
                          <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Desired Timeline</p>
                          <p style="margin:0;font-size:14px;font-weight:700;color:#b5a1ff;">${timeline || 'Not specified'}</p>
                        </td>
                        <td width="50%">
                          <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Budget Expectation</p>
                          <p style="margin:0;font-size:14px;font-weight:700;color:#34d399;">${budget || 'Discuss on Call'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #1e1e2a;padding-top:20px;">
                    <p style="margin:0 0 8px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Project Requirements &amp; Details</p>
                    <div style="background:#141422;border-left:3px solid #ccf244;padding:14px 16px;border-radius:0 10px 10px 0;">
                      <p style="margin:0;font-size:14px;font-weight:500;color:#e4e4e7;line-height:1.6;white-space:pre-wrap;">${projectDetails}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Actions -->
          <tr>
            <td style="background:#0a0a10;padding:22px 36px;border-top:1px solid #1e1e2a;">
              <p style="margin:0 0 12px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Quick Actions</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="mailto:${email}?subject=Your Build Request with AI Founder Hub (${ticketNumber})&body=Hi ${encodeURIComponent(fullName)}," style="display:inline-block;background:#ccf244;color:#07070b;font-size:12px;font-weight:800;text-decoration:none;padding:10px 20px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">Reply via Email →</a>
                  </td>
                  ${waNumber ? `
                  <td>
                    <a href="https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(fullName)},%20this%20is%20Zain%20from%20AI%20Founder%20Hub%20regarding%20your%20build%20request%20(${ticketNumber})" style="display:inline-block;background:#25D366;color:#041a0d;font-size:12px;font-weight:800;text-decoration:none;padding:10px 20px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">Open WhatsApp →</a>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // ── Email 2: Confirmation to User ─────────────────────────────────────────
    const clientHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Build Request Received — AI Founder Hub</title>
</head>
<body style="margin:0;padding:0;background:#07070b;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070b;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;border:1px solid #1e1e2a;background:#0d0d14;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d0d14 0%,#151322 100%);padding:36px 36px 28px;border-bottom:1px solid #1e1e2a;text-align:center;">
              <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">⚡ AI Founder Hub Engineering</span>
              <h1 style="margin:14px 0 6px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">We Received Your Build Request! 🚀</h1>
              <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;">Our developer squad has received your request and is reviewing your specifications.</p>
            </td>
          </tr>

          <!-- Ticket Box -->
          <tr>
            <td style="padding:28px 36px;text-align:center;">
              <div style="background:#12121c;border:1px solid #1e1e2a;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#71717a;">Reference Ticket</p>
                <span style="display:inline-block;background:#ccf244;color:#07070b;font-family:'Courier New',monospace;font-size:18px;font-weight:900;letter-spacing:0.2em;padding:8px 24px;border-radius:100px;text-transform:uppercase;">${ticketNumber}</span>
              </div>

              <!-- Next Steps Cards -->
              <div style="text-align:left;background:#09090f;border:1px solid #1a1a26;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;font-size:11px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#ccf244;">What Happens Next</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #1e1e2a;">
                      <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><strong style="color:#ffffff;">1. Technical Review:</strong> Our AI architects review your scope, tools, and technical requirements.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #1e1e2a;">
                      <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><strong style="color:#ffffff;">2. Direct Contact (24 Hours):</strong> We'll message you on WhatsApp (${cleanPhone}) and email to align on details and schedule a scoping call.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;"><strong style="color:#ffffff;">3. Build &amp; Deploy:</strong> Handled end-to-end by experienced builders so you get a production-ready solution.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Request Summary -->
              <div style="text-align:left;background:#101018;border-radius:12px;padding:18px 20px;border-left:3px solid #ccf244;">
                <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Target System</p>
                <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#ffffff;">${targetResource}</p>

                <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#71717a;">Your Submitted Details</p>
                <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.5;white-space:pre-wrap;">${projectDetails}</p>
              </div>
            </td>
          </tr>

          <!-- Direct Chat CTA -->
          <tr>
            <td style="background:#0a0a10;padding:26px 36px;border-top:1px solid #1e1e2a;text-align:center;">
              <p style="margin:0 0 16px;font-size:13px;color:#a1a1aa;">Need urgent assistance or have questions right now?</p>
              <a href="https://chat.whatsapp.com/FBrasZIfmvLAZxcR2Yjcho" style="display:inline-block;background:#25D366;color:#041a0d;font-size:12px;font-weight:900;text-decoration:none;padding:12px 28px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">
                Chat on WhatsApp Community →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#07070b;padding:18px 36px;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:11px;color:#3f3f46;text-align:center;">AI Founder Hub Engineering · Build &amp; Scale AI Systems · aifounderhub.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // 4. Send both emails concurrently via Resend
    const [teamResult, clientResult] = await Promise.allSettled([
      getResend().emails.send({
        from: FROM_EMAIL,
        to: ownerRecipients,
        reply_to: email,
        subject: `🛠️ New Build Request: ${fullName} — ${targetResource}`,
        html: managementHtml,
      }),
      getResend().emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: `🛠️ We received your build request! — AI Founder Hub (${ticketNumber})`,
        html: clientHtml,
      }),
    ]);

    if (teamResult.status === 'fulfilled' && !teamResult.value?.error) {
      console.log('[Resend] Team build alert sent, id:', teamResult.value?.data?.id);
    } else {
      console.error('[Resend] Team build alert error:', teamResult.value?.error || teamResult.reason);
    }

    if (clientResult.status === 'fulfilled' && !clientResult.value?.error) {
      console.log('[Resend] Client build confirmation sent, id:', clientResult.value?.data?.id);
    } else {
      console.error('[Resend] Client build confirmation error:', clientResult.value?.error || clientResult.reason);
    }

    return res.status(200).json({
      ok: true,
      ticketNumber,
      message: 'Build request submitted successfully',
    });
  } catch (err) {
    console.error('[helpBuildRequest] Unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}

export default helpBuildRequest;
