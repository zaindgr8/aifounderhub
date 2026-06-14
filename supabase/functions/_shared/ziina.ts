// Ziina Payment Intent client.
// Docs: https://docs.ziina.com/api-reference/payment-intent
// Amounts are in fils (100 AED = 10000). Auth is a Bearer token with the
// write_payment_intents scope. Base URL is configurable; confirm yours in the
// Ziina dashboard (default is api-v2).

const BASE = Deno.env.get("ZIINA_API_BASE") ?? "https://api-v2.ziina.com/api";

function apiKey(): string {
  const key = Deno.env.get("ZIINA_API_KEY");
  if (!key) throw new Error("Missing ZIINA_API_KEY");
  return key;
}

function isTest(): boolean {
  // default to test mode unless explicitly set to "false"
  return (Deno.env.get("ZIINA_TEST_MODE") ?? "true") !== "false";
}

export interface CreateIntentInput {
  amountFils: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  message?: string;
}

export interface ZiinaIntent {
  id: string;
  status: string;          // requires_payment_instrument | pending | requires_user_action | completed | failed
  redirect_url?: string;
  latest_error?: { message?: string } | null;
  [k: string]: unknown;
}

export async function createPaymentIntent(input: CreateIntentInput): Promise<ZiinaIntent> {
  const res = await fetch(`${BASE}/payment_intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountFils,
      currency: input.currency ?? "AED",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      message: input.message,
      test: isTest(),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Ziina create intent failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data as ZiinaIntent;
}

export async function getPaymentIntent(id: string): Promise<ZiinaIntent> {
  const res = await fetch(`${BASE}/payment_intent/${id}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Ziina get intent failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data as ZiinaIntent;
}

export { isTest };
