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
    label: "AAA Accelerator — Founding Cohort",
    priceCents: 150_000, // $1,500 one-time
    checkoutMessage: "AI Founder Hub — AAA Accelerator (Founding Cohort)",
    cancelPath: "/aaa-accelerator",
  },
  "claude-master": {
    code: "claude-master",
    label: "Master Claude in 7 Days",
    priceCents: 4_500, // $45 one-time
    checkoutMessage: "AI Founder Hub — Master Claude in 7 Days",
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

/** "$1,500" — for display. Never derive the charged amount from this. */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/* ——— AAA Accelerator cohort details, referenced across the page ——— */
export const AAA_COHORT = {
  /** Update these two together when a cohort closes. */
  startDate: "20 September 2026",
  startShort: "Sep 20",
  seatsTotal: 8,
  /** Bump as seats sell — it is the most persuasive honest number on the page. */
  seatsTaken: 0,
  nextCohortPrice: "$2,500",
  monthlyAfter: "$159",
  /** Weeks of live programme, then community continues. */
  weeks: 6,
  freeCommunityMonths: 3,
} as const;

export const AAA_SEATS_LEFT = AAA_COHORT.seatsTotal - AAA_COHORT.seatsTaken;
