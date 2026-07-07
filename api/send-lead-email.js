import { Resend } from 'resend';

// lazily initialized after dotenv loads
let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendLeadEmail(req, res) {
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
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ ok: false, error: 'fullName and email are required' });
    }

    const OWNER_EMAIL = process.env.OWNER_EMAIL || 'zangbang360@gmail.com';
    const FROM_EMAIL = process.env.FROM_EMAIL || 'AI Founder Hub <onboarding@resend.dev>';

    const goalLabels = {
      founder:    'Launch a startup',
      freelancer: 'Become an AI freelancer',
      scaleup:    'Scale my existing business',
      agency:     'Start an automation agency',
      explore:    'Just exploring AI',
    };
    const goalLabel = goalLabels[goal] || goal || '—';
    const dateStr = submittedAt
      ? new Date(submittedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: true })
      : new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dubai', hour12: true });

    const html = `
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
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.25em;color:#ccf244;text-transform:uppercase;">⚡ AI Founder Hub</span>
                    </div>
                    <h1 style="margin:10px 0 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">New Lead Captured 🎯</h1>
                    <p style="margin:6px 0 0;font-size:13px;color:#71717a;">Submitted ${dateStr} (Dubai time)</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;background:#ccf244;color:#07070b;font-family:'Courier New',monospace;font-size:11px;font-weight:900;letter-spacing:0.15em;padding:6px 14px;border-radius:100px;text-transform:uppercase;">${ticketNumber || 'AFH-XXXXXX'}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Details -->
          <tr>
            <td style="background:#0d0d14;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <!-- Name -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Full Name</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">${fullName}</p>
                  </td>
                </tr>
                <!-- Email -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Email Address</p>
                    <a href="mailto:${email}" style="margin:0;font-size:15px;font-weight:600;color:#ccf244;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <!-- Phone -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Phone Number</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#e4e4e7;">${fullPhoneNumber || phone || '—'}</p>
                  </td>
                </tr>
                <!-- Divider -->
                <tr><td style="border-top:1px solid #1e1e2a;padding-bottom:20px;"></td></tr>
                <!-- Goal & Country -->
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right:10px;">
                          <p style="margin:0 0 4px;font-size:10px;font-family:'Courier New',monospace;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#52525b;">Goal</p>
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
                    <a href="https://wa.me/${(fullPhoneNumber || '').replace(/[^0-9]/g,'')}" style="display:inline-block;background:#1e1e2a;color:#e4e4e7;font-size:12px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;border:1px solid #2a2a3a;">WhatsApp →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#07070b;padding:20px 40px;border-top:1px solid #1e1e2a;">
              <p style="margin:0;font-size:11px;color:#3f3f46;text-align:center;">AI Founder Hub · Lead notification · Source: ${source || 'website-hero'}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: [OWNER_EMAIL],
      reply_to: email,
      subject: `🎯 New Lead: ${fullName} — ${goalLabel}`,
      html,
    });

    if (error) {
      console.error('[Resend] Error sending email:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    console.log('[Resend] Email sent successfully, id:', data?.id);
    return res.status(200).json({ ok: true, emailId: data?.id });
  } catch (err) {
    console.error('[Resend] Unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
