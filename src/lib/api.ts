// Frontend API layer for the AI Founder Hub backend (Supabase Edge Functions).
//
// Designed to degrade gracefully: if the Supabase env vars are not set, the site
// runs in "demo mode" exactly as before (no network calls, simulated success),
// so the marketing site keeps working before the backend is provisioned.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const backendEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON);

function fnUrl(name: string): string {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

async function call<T>(name: string, opts: { method?: string; body?: unknown; query?: Record<string, string> }): Promise<T> {
  const url = new URL(fnUrl(name));
  if (opts.query) Object.entries(opts.query).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method: opts.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON!,
      Authorization: `Bearer ${SUPABASE_ANON!}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

// ---- Leads (CRM) ----
export interface CaptureLeadInput {
  firstName: string; email: string; phone?: string;
  countryCode?: string; dialCode?: string; goal?: string; source?: string;
}
export async function captureLead(input: CaptureLeadInput): Promise<{ ok: boolean; leadId?: string }> {
  if (!backendEnabled) {
    await new Promise((r) => setTimeout(r, 900)); // simulate latency in demo mode
    return { ok: true };
  }
  return call("capture-lead", { body: input });
}

// ---- Payment + booking helpers (SCAFFOLDING) ----
// These are intentionally NOT used by the live site yet. Bookings and payments
// are handled manually for now. The matching Edge Functions exist in
// supabase/functions for when Zain wires the automated flow. Kept here so that
// frontend work is a small lift later.

// ---- Availability ----
export interface Slot { start: string; end: string }
export interface MentorAvailability {
  mentor: { slug: string; name: string; role: string; priceFils: number; currency: string; sessionMinutes: number };
  slots: Slot[];
}
export async function getAvailability(mentorSlug: string, days = 14): Promise<MentorAvailability> {
  return call("availability", { method: "GET", query: { mentor: mentorSlug, days: String(days) } });
}

// ---- Payments ----
export type PaymentPurpose = "booking" | "bootcamp" | "membership";
export interface CreatePaymentInput {
  purpose: PaymentPurpose;
  customer: { name: string; email: string; phone?: string };
  mentorSlug?: string;
  startsAt?: string;
  topic?: string;
  pathway?: string;
}
export async function createPayment(input: CreatePaymentInput): Promise<{ ok: boolean; paymentId: string; redirectUrl: string }> {
  return call("create-payment", { body: input });
}

export interface VerifyResult {
  ok: boolean; status: string; purpose: string; amount: string; customerName?: string;
}
export async function verifyPayment(paymentId: string): Promise<VerifyResult> {
  return call("verify-payment", { method: "GET", query: { p: paymentId } });
}
