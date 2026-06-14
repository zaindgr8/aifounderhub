// Resend email client. Docs: https://resend.com/docs
// Requires RESEND_API_KEY and a verified sending domain.

const FROM = Deno.env.get("EMAIL_FROM") ?? "AI Founder Hub <hello@aifounderhub.com>";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string | string[];
  attachments?: { filename: string; content: string }[]; // content = base64
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("RESEND_API_KEY not set; skipping email:", input.subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: input.to,
      cc: input.cc,
      reply_to: input.replyTo,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    // Do not throw: a failed email should not roll back a paid booking.
    console.error(`Resend failed (${res.status}): ${txt}`);
  }
}

// The internal inbox that receives every booking + payment confirmation.
export function notifyInbox(): string {
  return Deno.env.get("BOOKINGS_NOTIFY_EMAIL") ?? FROM;
}
