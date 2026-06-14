// Branded HTML email templates. Dark, on-brand, inline styles for email clients.

const VOID = "#07070b";
const PANEL = "#0d0d14";
const VOLT = "#ccf244";
const ZINC = "#a1a1aa";

function shell(title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  return `<!doctype html><html><body style="margin:0;background:${VOID};font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${VOID};padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid #20202c;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px;">
          <span style="display:inline-block;width:34px;height:34px;background:${VOLT};border-radius:9px;text-align:center;line-height:34px;font-weight:800;color:${VOID};">⚡</span>
          <span style="color:#fff;font-weight:800;font-size:16px;vertical-align:middle;margin-left:10px;">AI Founder Hub</span>
        </td></tr>
        <tr><td style="padding:16px 32px 0;">
          <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 12px;letter-spacing:-0.5px;">${title}</h1>
          <div style="color:${ZINC};font-size:15px;line-height:1.6;">${bodyHtml}</div>
        </td></tr>
        ${cta ? `<tr><td style="padding:24px 32px 8px;">
          <a href="${cta.url}" style="display:inline-block;background:${VOLT};color:${VOID};font-weight:800;text-decoration:none;padding:14px 26px;border-radius:10px;font-size:15px;">${cta.label}</a>
        </td></tr>` : ""}
        <tr><td style="padding:24px 32px 28px;border-top:1px solid #20202c;margin-top:16px;">
          <span style="color:#52525b;font-size:12px;">AI Founder Hub · Dubai · aifounderhub.com</span>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

export function welcomeEmail(firstName: string, workshopUrl: string) {
  return {
    subject: "You're in. Your first free masterclass invite is inside",
    html: shell(
      `Welcome, ${firstName} ⚡`,
      `<p>You're now part of the AI Founder Hub community.</p>
       <p>Your seat for the next free live masterclass is reserved. Tap below to add it to your calendar, and watch your inbox for the join link.</p>
       <p style="color:#fff;font-weight:600;">Next up: Claude MasterClass</p>`,
      { label: "Reserve my free seat", url: workshopUrl },
    ),
  };
}

export function bookingConfirmCustomer(opts: {
  name: string; mentor: string; whenText: string;
}) {
  return {
    subject: `Confirmed: your 1:1 with ${opts.mentor}`,
    html: shell(
      `Your session is booked ✓`,
      `<p>Hi ${opts.name}, your private 1:1 session is confirmed.</p>
       <p style="color:#fff;"><strong>With:</strong> ${opts.mentor}<br/>
       <strong>When:</strong> ${opts.whenText}</p>
       <p>The calendar invite is attached. We'll send the meeting link before the call. Come with your project and your hardest question.</p>`,
    ),
  };
}

export function bookingConfirmInternal(opts: {
  mentor: string; name: string; email: string; phone?: string; whenText: string; amount: string;
}) {
  return {
    subject: `New paid booking: ${opts.name} with ${opts.mentor}`,
    html: shell(
      `New 1:1 booking 💰`,
      `<p style="color:#fff;">
        <strong>Mentor:</strong> ${opts.mentor}<br/>
        <strong>Client:</strong> ${opts.name} (${opts.email})<br/>
        ${opts.phone ? `<strong>Phone:</strong> ${opts.phone}<br/>` : ""}
        <strong>When:</strong> ${opts.whenText}<br/>
        <strong>Paid:</strong> ${opts.amount}
       </p>
       <p>Calendar invite attached. Add the meeting link and send it to the client.</p>`,
    ),
  };
}

export function paymentReceipt(opts: {
  name: string; what: string; amount: string;
}) {
  return {
    subject: `Payment received: ${opts.what}`,
    html: shell(
      `Payment confirmed ✓`,
      `<p>Hi ${opts.name}, we've received your payment.</p>
       <p style="color:#fff;"><strong>For:</strong> ${opts.what}<br/>
       <strong>Amount:</strong> ${opts.amount}</p>
       <p>Thank you. Next steps are on the way to this inbox.</p>`,
    ),
  };
}

export function internalPaymentAlert(opts: {
  what: string; name: string; email: string; amount: string;
}) {
  return {
    subject: `New payment: ${opts.what} (${opts.amount})`,
    html: shell(
      `Payment received 💰`,
      `<p style="color:#fff;">
        <strong>For:</strong> ${opts.what}<br/>
        <strong>From:</strong> ${opts.name} (${opts.email})<br/>
        <strong>Amount:</strong> ${opts.amount}
       </p>`,
    ),
  };
}
