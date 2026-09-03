/* ————————————————————————————————————————————————————————————————
   Analytics — GA4, Meta Pixel and Microsoft Clarity.

   Everything here is env-gated: with no IDs set nothing loads, nothing
   is sent, and no cookies are dropped. Add the IDs to .env to switch a
   provider on:

     VITE_GA4_ID=G-XXXXXXXXXX
     VITE_META_PIXEL_ID=1234567890
     VITE_CLARITY_ID=abcdefghij
———————————————————————————————————————————————————————————————— */

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
    clarity?: (...args: unknown[]) => void;
  }
}

let started = false;

function injectScript(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
}

/** Load whichever providers have IDs configured. Safe to call more than once. */
export function initAnalytics() {
  if (started || typeof window === "undefined") return;
  started = true;

  if (GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID, { send_page_view: true });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  }

  if (META_PIXEL_ID) {
    /* standard Meta bootstrap, minus the noscript pixel */
    const fbq: NonNullable<Window["fbq"]> = function (...args: unknown[]) {
      fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue!.push(args);
    } as NonNullable<Window["fbq"]>;
    fbq.queue = [];
    window.fbq = window.fbq || fbq;
    injectScript("https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  if (CLARITY_ID) {
    window.clarity =
      window.clarity ||
      function (...args: unknown[]) {
        (window.clarity as unknown as { q: unknown[] }).q =
          (window.clarity as unknown as { q?: unknown[] }).q || [];
        (window.clarity as unknown as { q: unknown[] }).q.push(args);
      };
    injectScript(`https://www.clarity.ms/tag/${CLARITY_ID}`);
  }
}

/** Tell GA4 a client-side route change happened. */
export function trackPageView(path: string) {
  if (GA4_ID) window.gtag?.("event", "page_view", { page_path: path });
  if (META_PIXEL_ID) window.fbq?.("track", "PageView");
}

/**
 * A lead reached the thank-you state. `value` lets you attribute revenue
 * potential per source later on.
 */
export function trackLead(params: { source: string; goal?: string; value?: number }) {
  if (GA4_ID) {
    window.gtag?.("event", "generate_lead", {
      lead_source: params.source,
      goal: params.goal,
      currency: "USD",
      value: params.value ?? 0,
    });
  }
  if (META_PIXEL_ID) {
    window.fbq?.("track", "Lead", {
      content_name: params.source,
      currency: "USD",
      value: params.value ?? 0,
    });
  }
}

/** Someone started a paid checkout. */
export function trackBeginCheckout(params: { product: string; value: number }) {
  if (GA4_ID) {
    window.gtag?.("event", "begin_checkout", {
      items: [{ item_id: params.product, item_name: params.product }],
      currency: "USD",
      value: params.value,
    });
  }
  if (META_PIXEL_ID) {
    window.fbq?.("track", "InitiateCheckout", {
      content_name: params.product,
      currency: "USD",
      value: params.value,
    });
  }
}

/** Anything else worth counting — CTA clicks, modal opens, track switches. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (GA4_ID) window.gtag?.("event", name, params);
  if (META_PIXEL_ID) window.fbq?.("trackCustom", name, params);
}
