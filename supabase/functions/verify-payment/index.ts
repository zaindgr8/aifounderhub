// GET /verify-payment?p=<paymentId>
// Called by the site when the customer returns from Ziina (success_url). It
// fetches the live intent status and settles if needed (covers a missed webhook),
// then returns a small summary the UI shows in the confirmation modal.
import { preflight, json } from "../_shared/cors.ts";
import { adminClient } from "../_shared/db.ts";
import { getPaymentIntent } from "../_shared/ziina.ts";
import { settlePayment } from "../_shared/settle.ts";
import { filsToDisplay } from "../_shared/money.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const paymentId = new URL(req.url).searchParams.get("p") ?? "";
    if (!paymentId) return json({ error: "missing payment id" }, 400);

    const db = adminClient();
    const { data: payment } = await db.from("payments").select("*").eq("id", paymentId).single();
    if (!payment) return json({ error: "payment not found" }, 404);

    let status = payment.status;
    if (status !== "completed" && payment.ziina_intent_id) {
      const intent = await getPaymentIntent(payment.ziina_intent_id);
      const result = await settlePayment(db, paymentId, intent.status, intent.latest_error?.message);
      status = result.status === "completed" ? "completed" : (result.status === "failed" ? "failed" : payment.status);
    }

    return json({
      ok: true,
      status,
      purpose: payment.purpose,
      amount: filsToDisplay(payment.amount_fils, payment.currency),
      customerName: payment.customer_name,
    });
  } catch (e) {
    console.error(e);
    return json({ error: "unexpected error" }, 500);
  }
});
