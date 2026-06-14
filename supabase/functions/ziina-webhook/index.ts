// POST /ziina-webhook
// Ziina calls this when a payment intent changes state. We dedupe, look up our
// payment row by the Ziina intent id, and settle it. This is the source of truth
// for confirmations (the redirect fallback covers the rare missed webhook).
//
// Security: set ZIINA_WEBHOOK_SECRET and configure the same value in Ziina, then
// it is checked against the `x-ziina-secret` header (or `?secret=` query). Ziina's
// exact signature scheme should be confirmed in your dashboard; this shared-secret
// check is a safe baseline.
import { preflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/db.ts";
import { getPaymentIntent } from "../_shared/ziina.ts";
import { settlePayment } from "../_shared/settle.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("ZIINA_WEBHOOK_SECRET");
  if (secret) {
    const provided = req.headers.get("x-ziina-secret") ?? new URL(req.url).searchParams.get("secret");
    if (provided !== secret) return json({ error: "unauthorized" }, 401);
  }

  try {
    const payload = await req.json().catch(() => ({}));
    // Ziina payloads vary; pull the intent id defensively.
    const intentId: string | undefined =
      payload?.data?.id ?? payload?.payment_intent?.id ?? payload?.id ?? payload?.object?.id;
    if (!intentId) return json({ error: "no intent id in payload" }, 400);

    const db = adminClient();

    // Always re-fetch the authoritative status from Ziina rather than trusting
    // the payload, then dedupe on intent id + status.
    const intent = await getPaymentIntent(intentId);
    const eventKey = `${intentId}:${intent.status}`;

    const { error: dupErr } = await db.from("webhook_events").insert({
      provider: "ziina", event_key: eventKey, payload, processed: false,
    });
    if (dupErr && dupErr.code === "23505") {
      return json({ ok: true, deduped: true });
    }

    const { data: payment } = await db.from("payments").select("id").eq("ziina_intent_id", intentId).single();
    if (!payment) return json({ ok: true, note: "no matching payment" });

    const result = await settlePayment(
      db, payment.id, intent.status, intent.latest_error?.message,
    );
    await db.from("webhook_events").update({ processed: true }).eq("event_key", eventKey).eq("provider", "ziina");

    return json({ ok: true, ...result });
  } catch (e) {
    console.error("webhook error", e);
    return json({ error: "unexpected error" }, 500);
  }
});
