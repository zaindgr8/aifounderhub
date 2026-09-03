/* ————————————————————————————————————————————————————————————————
   Per-route document metadata.

   The app is client-rendered from a single index.html, so without this
   every route served the homepage's <title>, description and OG tags —
   including /claude-master-in-7-days, which is a long-form content page
   that can rank on its own.
———————————————————————————————————————————————————————————————— */

const SITE = "https://aifounderhub.com";

export interface RouteMeta {
  title: string;
  description: string;
  path: string;
  /** Absolute URL. Falls back to the site-wide cover. */
  image?: string;
  /** Keep thin or duplicate pages out of the index. */
  noindex?: boolean;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  home: {
    title: "AI Automation Agency Training | Build & Sell AI Systems — AI Founder Hub",
    description:
      "Learn to build and sell AI Lead Management Systems and voice agents — no code required. Free live masterclass every Saturday, plus the 90-day AAA Accelerator to your first $2,000/month client. Dubai and global.",
    path: "/",
  },
  "claude-master": {
    title: "Master Claude in 7 Days — No-Code & Developer Tracks | AI Founder Hub",
    description:
      "A free 7-day field guide to Claude, updated for September 2026. Two tracks: run your business on the Claude app with Projects, Artifacts, Connectors, Skills and Cowork — no code — or go deep on Claude Code with subagents, hooks and headless automation.",
    path: "/claude-master-in-7-days",
  },
  "aaa-accelerator": {
    title: "AAA Accelerator — 6-Week AI Agency Cohort (8 Seats) | AI Founder Hub",
    description:
      "A 6-week live cohort: build a working AI Lead Management System, package it as a service, and run real outreach to land your first $2,000 client. Eight seats, two 1-on-1 calls, taught by an operator selling this commercially in Dubai.",
    path: "/aaa-accelerator",
  },
  freemasterclass: {
    title: "Free Live AI Masterclass — Build an AI System Live | AI Founder Hub",
    description:
      "Join the free weekly live masterclass. We build a real AI voice agent, chatbot or CRM automation end to end on screen, then show you exactly how to price and sell it.",
    path: "/freemasterclass",
  },
  progress: {
    title: "The $50K/mo AI Agency Roadmap — 6 Stages | AI Founder Hub",
    description:
      "The gamified 6-stage roadmap from $0 to a $50,000/month AI automation agency. Stage 1 is free to preview — niche selection, AI sandboxes and your first offer.",
    path: "/progress",
  },
  "thank-you": {
    title: "You're In — Masterclass Seat Confirmed | AI Founder Hub",
    description: "Your free masterclass seat is confirmed. Check your inbox for the session link and calendar invite.",
    path: "/thank-you",
    noindex: true,
  },
};

function setTag(selector: string, attr: "content", value: string, create: () => HTMLElement) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function meta(name: string, value: string) {
  setTag(`meta[name="${name}"]`, "content", value, () => {
    const el = document.createElement("meta");
    el.setAttribute("name", name);
    return el;
  });
}

function og(property: string, value: string) {
  setTag(`meta[property="${property}"]`, "content", value, () => {
    const el = document.createElement("meta");
    el.setAttribute("property", property);
    return el;
  });
}

/** Rewrite the document head for the given route. */
export function applyRouteMeta(route: string) {
  const m = ROUTE_META[route];
  if (!m || typeof document === "undefined") return;

  const url = `${SITE}${m.path}`;
  const image = m.image ?? `${SITE}/og-cover.jpg`;

  document.title = m.title;
  meta("description", m.description);
  meta("robots", m.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);

  og("og:title", m.title);
  og("og:description", m.description);
  og("og:url", url);
  og("og:image", image);

  meta("twitter:title", m.title);
  meta("twitter:description", m.description);
  meta("twitter:image", image);
}
