/* ————————————————————————————————————————————————————————————————
   Product catalogue — the single source of truth for what we charge.

   This exists because the AAA Accelerator pivoted from $159/mo to a
   $1,500 founding cohort and the displayed price was updated in three
   components while the amount actually sent to Ziina was not — so the
   checkout kept charging $159. Every surface now reads from here, and
   the price is passed explicitly rather than relying on a server default.

   Keep priceCents in sync with PACKAGES in api/_admin-lib.js.
———————————————————————————————————————————————————————————————— */

export interface Product {
  code: string;
  label: string;
  /** Amount charged, in cents. This is what goes to Ziina. */
  priceCents: number;
  /** What the buyer sees on the checkout page. */
  checkoutMessage: string;
  /** Where to send them if they abandon checkout. */
  cancelPath: string;
}

export const PRODUCTS = {
  "aaa-accelerator": {
    code: "aaa-accelerator",
    label: "AAA Accelerator — Monthly Membership",
    priceCents: 15_900, // $159/month
    checkoutMessage: "AI Founder Hub — AAA Accelerator ($159/month)",
    cancelPath: "/aaa-accelerator",
  },
  "claude-master": {
    code: "claude-master",
    label: "Master Claude in 7 Days (Included in Accelerator)",
    priceCents: 15_900, // Included inside the single $159/mo package
    checkoutMessage: "AI Founder Hub — AAA Accelerator ($159/month)",
    cancelPath: "/claude-master-in-7-days",
  },
  "session-1on1": {
    code: "session-1on1",
    label: "1:1 Private Session",
    priceCents: 59_900, // $599
    checkoutMessage: "AI Founder Hub — 1:1 Private Session",
    cancelPath: "/#mentors",
  },
} as const satisfies Record<string, Product>;

export type ProductCode = keyof typeof PRODUCTS;

/** "$159" — for display. Never derive the charged amount from this. */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/* ——— AAA Accelerator subscription details, referenced across the page ——— */
export const AAA_COHORT = {
  startDate: "Instant Access",
  startShort: "Instant",
  seatsTotal: 50,
  seatsTaken: 14,
  nextCohortPrice: "$159/mo",
  monthlyAfter: "$159",
  /** Weeks of live programme, then community continues. */
  weeks: 6,
  freeCommunityMonths: 1,
} as const;

export const AAA_SEATS_LEFT = AAA_COHORT.seatsTotal - AAA_COHORT.seatsTaken;
