// POST /create-payment
// Body: { purpose: 'booking'|'bootcamp'|'membership', customer:{name,email,phone?}, ... }
//  - booking:    { mentorSlug, startsAt }
//  - bootcamp:   { pathway }
//  - membership: {}
// Creates the domain row (pending) + a payment row, opens a Ziina payment intent,
// and returns the redirect_url for the browser. Confirmation happens in the webhook.
import { preflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/db.ts";
import { createPaymentIntent, isTest } from "../_shared/ziina.ts";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://aifounderhub.com";
const BOOTCAMP_FILS = parseInt(Deno.env.get("BOOTCAMP_PRICE_FILS") ?? "91500", 10);   // ~249 USD
const MEMBERSHIP_FILS = parseInt(Deno.env.get("MEMBERSHIP_PRICE_FILS") ?? "18350", 10); // ~49.99 USD

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const purpose: string = body.purpose;
    const name = (body.customer?.name ?? "").toString().trim();
    const email = (body.customer?.email ?? "").toString().trim().toLowerCase();
    const phone = body.customer?.phone ?? null;
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: "name and valid email required" }, 400);

    const db = adminClient();

    // link or create a lead so every buyer is in the CRM
    const { data: lead } = await db
      .from("leads")
      .upsert({ first_name: name.split(" ")[0], email, phone, source: `purchase:${purpose}` }, { onConflict: "email" })
      .select().single();

    let amountFils = 0;
    let currency = "AED";
    let referenceTable = "";
    let referenceId = "";
    let label = "";

    if (purpose === "booking") {
      const { data: mentor } = await db
        .from("mentors").select("*").eq("slug", body.mentorSlug).eq("active", true).single();
      if (!mentor) return json({ error: "mentor not found" }, 404);
      const startsAt = new Date(body.startsAt);
      if (isNaN(startsAt.getTime()) || startsAt <= new Date()) return json({ error: "invalid slot" }, 400);
      const endsAt = new Date(startsAt.getTime() + mentor.session_minutes * 60_000);

      const { data: booking, error: bErr } = await db
        .from("bookings")
        .insert({
          mentor_id: mentor.id, customer_name: name, customer_email: email, customer_phone: phone,
          starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(),
          status: "pending_payment", topic: body.topic ?? null, lead_id: lead?.id ?? null,
        })
        .select().single();
      if (bErr) {
        if (bErr.code === "23505") return json({ error: "That slot was just taken. Please pick another." }, 409);
        throw bErr;
      }
      amountFils = mentor.price_fils; currency = mentor.currency;
      referenceTable = "bookings"; referenceId = booking.id;
      label = `1:1 with ${mentor.name}`;
    } else if (purpose === "bootcamp") {
      const pathway = (body.pathway ?? "").toString();
      const { data: app, error: aErr } = await db
        .from("bootcamp_applications")
        .insert({ name, email, pathway, status: "applied", lead_id: lead?.id ?? null })
        .select().single();
      if (aErr) throw aErr;
      amountFils = BOOTCAMP_FILS;
      referenceTable = "bootcamp_applications"; referenceId = app.id;
      label = `AI Builder Bootcamp (${pathway})`;
    } else if (purpose === "membership") {
      const { data: member, error: mErr } = await db
        .from("members")
        .upsert({ email, lead_id: lead?.id ?? null, status: "lapsed" }, { onConflict: "email" })
        .select().single();
      if (mErr) throw mErr;
      amountFils = MEMBERSHIP_FILS;
      referenceTable = "members"; referenceId = member.id;
      label = "Courses Membership (1 month)";
    } else {
      return json({ error: "unknown purpose" }, 400);
    }

    // create the payment row first (pending)
    const { data: payment, error: pErr } = await db
      .from("payments")
      .insert({
        purpose, status: "pending", amount_fils: amountFils, currency,
        customer_name: name, customer_email: email, lead_id: lead?.id ?? null,
        is_test: isTest(), reference_table: referenceTable, reference_id: referenceId,
      })
      .select().single();
    if (pErr) throw pErr;

    // open the Ziina intent; success_url carries our payment id + Ziina's intent id
    const successUrl = `${SITE_URL}/?pay=success&p=${payment.id}&pi={PAYMENT_INTENT_ID}`;
    const cancelUrl = `${SITE_URL}/?pay=cancel&p=${payment.id}`;
    const intent = await createPaymentIntent({
      amountFils, currency, successUrl, cancelUrl, message: label,
    });

    await db.from("payments")
      .update({ ziina_intent_id: intent.id, ziina_redirect_url: intent.redirect_url ?? null })
      .eq("id", payment.id);

    // link the payment back onto the domain row
    await db.from(referenceTable).update({ payment_id: payment.id }).eq("id", referenceId);

    if (!intent.redirect_url) return json({ error: "payment provider did not return a redirect url" }, 502);
    return json({ ok: true, paymentId: payment.id, redirectUrl: intent.redirect_url });
  } catch (e) {
    console.error(e);
    return json({ error: "unexpected error", detail: String(e) }, 500);
  }
});
