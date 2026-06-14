// Idempotent payment settlement. Called by both the Ziina webhook and the
// redirect-return verifier. Transitions the domain row and sends emails exactly
// once per payment.
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail, notifyInbox } from "./resend.ts";
import { buildIcs, icsToBase64 } from "./ics.ts";
import { filsToDisplay } from "./money.ts";
import {
  bookingConfirmCustomer, bookingConfirmInternal,
  paymentReceipt, internalPaymentAlert,
} from "./emails.ts";

function whenText(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "Asia/Dubai", weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

export async function settlePayment(
  db: SupabaseClient,
  paymentId: string,
  ziinaStatus: string,
  errorMsg?: string,
): Promise<{ settled: boolean; status: string }> {
  const { data: payment } = await db.from("payments").select("*").eq("id", paymentId).single();
  if (!payment) return { settled: false, status: "not_found" };
  if (payment.status === "completed") return { settled: true, status: "already_completed" };

  if (ziinaStatus === "failed") {
    await db.from("payments").update({ status: "failed", latest_error: errorMsg ?? "failed" }).eq("id", paymentId);
    // free the slot if it was a booking
    if (payment.reference_table === "bookings" && payment.reference_id) {
      await db.from("bookings").update({ status: "cancelled" }).eq("id", payment.reference_id);
    }
    return { settled: true, status: "failed" };
  }

  if (ziinaStatus !== "completed") {
    return { settled: false, status: ziinaStatus }; // still pending; do nothing
  }

  // ---- completed: mark paid, then fulfil per purpose ----
  await db.from("payments").update({ status: "completed" }).eq("id", paymentId);
  const amount = filsToDisplay(payment.amount_fils, payment.currency);

  if (payment.reference_table === "bookings" && payment.reference_id) {
    const { data: booking } = await db.from("bookings").select("*").eq("id", payment.reference_id).single();
    if (booking) {
      await db.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
      const { data: mentor } = await db.from("mentors").select("name").eq("id", booking.mentor_id).single();
      const mentorName = mentor?.name ?? "your mentor";
      const ics = buildIcs({
        uid: `booking-${booking.id}@aifounderhub.com`,
        start: new Date(booking.starts_at),
        end: new Date(booking.ends_at),
        summary: `AI Founder Hub 1:1 with ${mentorName}`,
        description: `Private 1:1 mentorship session. Topic: ${booking.topic ?? "general"}.`,
        organizerEmail: notifyInbox(),
        attendeeEmail: booking.customer_email,
        location: "Online (link to follow)",
      });
      const attach = [{ filename: "session.ics", content: icsToBase64(ics) }];
      const w = whenText(booking.starts_at);

      const cust = bookingConfirmCustomer({ name: booking.customer_name, mentor: mentorName, whenText: w });
      await sendEmail({ to: booking.customer_email, subject: cust.subject, html: cust.html, attachments: attach });

      const internal = bookingConfirmInternal({
        mentor: mentorName, name: booking.customer_name, email: booking.customer_email,
        phone: booking.customer_phone ?? undefined, whenText: w, amount,
      });
      await sendEmail({ to: notifyInbox(), subject: internal.subject, html: internal.html, attachments: attach });
    }
  } else if (payment.reference_table === "bootcamp_applications" && payment.reference_id) {
    await db.from("bootcamp_applications").update({ status: "paid" }).eq("id", payment.reference_id);
    const r = paymentReceipt({ name: payment.customer_name ?? "there", what: "AI Builder Bootcamp", amount });
    await sendEmail({ to: payment.customer_email, subject: r.subject, html: r.html });
    const a = internalPaymentAlert({ what: "AI Builder Bootcamp", name: payment.customer_name ?? "", email: payment.customer_email, amount });
    await sendEmail({ to: notifyInbox(), subject: a.subject, html: a.html });
  } else if (payment.reference_table === "members" && payment.reference_id) {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 86_400_000);
    await db.from("members").update({
      status: "active", started_at: now.toISOString(), expires_at: expires.toISOString(),
      last_payment_id: paymentId, renewal_reminders_sent: 0,
    }).eq("id", payment.reference_id);
    const r = paymentReceipt({ name: payment.customer_name ?? "there", what: "Courses Membership (1 month)", amount });
    await sendEmail({ to: payment.customer_email, subject: r.subject, html: r.html });
    const a = internalPaymentAlert({ what: "Courses Membership", name: payment.customer_name ?? "", email: payment.customer_email, amount });
    await sendEmail({ to: notifyInbox(), subject: a.subject, html: a.html });
  }

  return { settled: true, status: "completed" };
}
