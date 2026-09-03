import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Globe2,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { Reveal, SectionTag, Wordmark, BackToTop, Magnetic } from "../components/shared";
import { AAAApplicationModal } from "../components/AAAApplicationModal";
import { AAA_COHORT, AAA_SEATS_LEFT, PRODUCTS, formatPrice } from "../lib/products";

const PRICE = formatPrice(PRODUCTS["aaa-accelerator"].priceCents);

/* ────── Data ────── */

const PILLARS = [
  {
    icon: Phone,
    title: "AI Lead Management System",
    desc: "Handles calls, qualifies leads and books appointments — built by you, end to end",
  },
  {
    icon: Target,
    title: "AAA Agency Setup",
    desc: "Niche, offer, positioning, outreach engine and first-client playbook",
  },
  {
    icon: Users,
    title: "Private Builders Community",
    desc: "Online group plus in-person Dubai meetups with active builders",
  },
  {
    icon: DollarSign,
    title: "Sales Playbook",
    desc: "Scripts, proposals, objection handling and closing your first $2K client",
  },
];

const WEEKS = [
  { week: "01", focus: "Foundations & your first agent", outcome: "A working AI voice agent taking live calls" },
  { week: "02", focus: "Knowledge base, Cal.com, Twilio", outcome: "An agent booking real appointments on a real number" },
  { week: "03", focus: "Niche selection & prompt tuning", outcome: "A chosen vertical, tuned prompts, a demo you can show" },
  { week: "04", focus: "Finding clients with Claude & Clay", outcome: "A list of 200+ qualified, researched prospects" },
  { week: "05", focus: "Packaging, pricing & your offer", outcome: "A service menu, pricing sheet and proposal template" },
  { week: "06", focus: "Outreach, sales calls & closing", outcome: "20+ live conversations started, first proposals sent" },
];

const IS_FOR = [
  "You can follow technical instructions but have not shipped a working agent yet",
  "You have built something that half-works and cannot tell why it breaks",
  "You have the technical skills but no idea how to find or close a client",
  "You want direct feedback on your specific build, not another video course",
  "You want to launch an AI automation agency and need the full path in one place",
];

const NOT_FOR_TEXT =
  "I would rather you skip this than waste $1,500. Do not enroll if you are looking for passive income without doing the work, if you want a guaranteed income promise, or if you cannot commit 8 to 10 hours a week for six weeks. This program only works if you do the outreach.";

const INCLUSIONS = {
  liveSessions: [
    "12 live calls across 6 weeks — two per week, 75 to 90 minutes each",
    "Session one each week is build. Session two is review, feedback and sales practice",
    "Every session recorded and yours to keep",
  ],
  directAccess: [
    "Private builders group with Zain in it, weekday responses",
    "Two private 1-on-1 calls — Week 2 for your build, Week 5 for your pipeline",
    "Personal review of your agent configuration and prompts before you go live",
  ],
  toolkit: [
    "Six vertical prompt libraries — real estate, clinics, hotels and more",
    "Full Retell AI, Cal.com and Twilio setup templates",
    "Claude prompts for lead research and personalised outreach",
    "Clay workflows for building qualified prospect lists",
    "Client proposal template, pricing sheet and service contract",
    "Objection-handling scripts taken from real sales calls",
  ],
  community: [
    "3 months of AI Founder Hub included, worth $477",
    "In-person Dubai meetups with active AAA builders",
    "Continues at $159/month from month 4 — cancel anytime, no lock-in",
  ],
};

const VALUE_TABLE = [
  { item: "12 live sessions over 6 weeks (2 per week, 75–90 min)", value: "$1,200" },
  { item: "Two private 1-on-1 calls with Zain (Week 2 and Week 5)", value: "$600" },
  { item: "Personal review of your agent build and prompts", value: "$400" },
  { item: "Six vertical prompt libraries used commercially by DevMate", value: "$500" },
  { item: "Retell AI + Cal.com + Twilio setup templates", value: "$300" },
  { item: "Claude and Clay lead-research workflows", value: "$300" },
  { item: "Proposal template, pricing sheet and client contract", value: "$250" },
  { item: "Objection-handling scripts from real sales calls", value: "$250" },
  { item: "3 months AI Founder Hub community access", value: "$477" },
];

const PROMISES = [
  "A working AI Lead Management System you built yourself",
  "A defined niche and a packaged, priced offer",
  "A qualified prospect list of 200 or more",
  "A live outreach pipeline with real conversations in it",
  "Personal feedback from Zain until your build is ready to sell",
];

const NOT_PROMISED = [
  "No specific income figure",
  "No guaranteed client",
  "No result by a fixed date",
];

const PROGRAM_INFO = [
  { label: "Program", value: "AAA Accelerator — AI Automation Agency Accelerator" },
  { label: "Next Cohort", value: `Starts ${AAA_COHORT.startDate}` },
  { label: "Duration", value: "6 weeks live, plus 3 months community access" },
  { label: "Seats", value: `${AAA_COHORT.seatsTotal} maximum — ${AAA_SEATS_LEFT} still open` },
  { label: "Investment", value: `${formatPrice(PRODUCTS["aaa-accelerator"].priceCents)} one-time (founding cohort price)` },
  { label: "Continuation", value: `${AAA_COHORT.monthlyAfter}/month from month ${AAA_COHORT.freeCommunityMonths + 1} — cancel anytime` },
  { label: "Commitment", value: "8–10 hours per week" },
  { label: "Format", value: "Live on Zoom, all sessions recorded" },
];

const FAQS = [
  {
    q: "What does it cost to run the tools?",
    a: "The tools bill you directly, not us — budget roughly $50–$120 a month while you build and demo. Retell AI charges per minute of call time, Twilio charges for the phone number and minutes, Cal.com has a free tier that is enough to start, and Clay has a free tier with paid credits for bulk enrichment. You will not need all of them at full spend during the six weeks, and week one covers how to keep the bill low while testing.",
  },
  {
    q: "What is your refund policy?",
    a: "Seven days from purchase, or until the first live session — whichever comes first. After the cohort has started the seat is yours and is not refundable, because it is capped at eight and holding it means turning someone else away. If you are unsure, come to a free masterclass first and decide there.",
  },
  {
    q: "What if I miss a live session?",
    a: "Every session is recorded and yours to keep. The build sessions matter most to attend live because that is where your specific configuration gets debugged, but the recording plus the builders group covers you if work or travel gets in the way one week.",
  },
  {
    q: "What time are the sessions, and what time zone?",
    a: "Two sessions a week, 75 to 90 minutes each, run on Gulf Standard Time (GST, UTC+4) in the evening so they work across the GCC, Europe, Africa and South Asia. Exact times are confirmed with the cohort before week one so we can fit the eight people who are actually in it.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. Everything is built through configuration and prompting on Retell AI, Cal.com, n8n, Claude and Clay. You do need to be comfortable following technical instructions carefully and debugging when something does not work — that is a different skill from programming, and it is the one the program builds.",
  },
  {
    q: "What happens after the six weeks?",
    a: "Community access is included for the first three months. From month four it continues at $159 a month and you can cancel any time from inside your account. Your recordings, templates, prompt libraries and contracts stay yours permanently whether you continue or not.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Not on the founding cohort price. If the one-time payment is the only thing in the way, message us on WhatsApp before the cohort closes and we will talk it through.",
  },
];

/* ────── Helper Components ────── */

function InclusionGroup({
  icon: Icon,
  title,
  items,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-2xl border border-edge bg-panel/40 p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-volt/10 text-volt">
            <Icon className="h-4 w-4" />
          </div>
          <h4 className="font-display text-[14px] font-bold uppercase tracking-wide text-white">
            {title}
          </h4>
        </div>
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-zinc-300 leading-relaxed">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/* ────── Page ────── */

export function AAAAcceleratorPage() {
  const [applyOpen, setApplyOpen] = useState(false);
  const openApply = () => setApplyOpen(true);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-void font-sans text-zinc-100">
      <div className="grain" aria-hidden="true" />

      {/* Nav back */}
      <nav className="sticky top-0 z-50 border-b border-edge/60 bg-void/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-10">
          <a href="/" className="flex items-center gap-2 text-white hover:text-volt transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <Wordmark />
          </a>
          <button
            onClick={openApply}
            className="group flex items-center gap-2 rounded-full bg-volt px-5 py-2.5 font-display text-[12px] font-extrabold uppercase tracking-wide text-void transition-shadow hover:shadow-[0_0_40px_rgba(204,242,68,0.4)] cursor-pointer"
          >
            APPLY NOW
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      <main>
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="relative overflow-hidden border-b border-edge/40 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-volt/[0.06] via-void to-void" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-volt/[0.06] blur-[160px]" />

          <div className="relative z-10 mx-auto max-w-4xl px-5 text-center md:px-10">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
                </span>
                Founding cohort · {AAA_SEATS_LEFT} of {AAA_COHORT.seatsTotal} seats left
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                AAA ACCELERATOR
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 font-serif text-2xl italic text-volt sm:text-3xl">
                Zero to Your First $2,000 AI Client
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-zinc-300">
                A 6-week guided program where you build a working AI Lead Management System, package it as a service,
                and run real outreach to land your first paying client. Small cohort. Direct access. Built and taught
                by an operator who sells this commercially in Dubai every week.
              </p>
            </Reveal>

            {/* Program info strip */}
            <Reveal delay={0.22}>
              <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-edge bg-panel/60 backdrop-blur-md overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-y divide-edge/50 sm:grid-cols-4 sm:divide-y-0">
                  {[
                    { label: "Next Cohort", value: AAA_COHORT.startShort, icon: Calendar },
                    { label: "Duration", value: `${AAA_COHORT.weeks} Weeks`, icon: Clock },
                    { label: "Seats", value: `${AAA_SEATS_LEFT} of ${AAA_COHORT.seatsTotal} left`, icon: Users },
                    { label: "Investment", value: PRICE, icon: DollarSign },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-4">
                      <s.icon className="h-4 w-4 text-volt mb-1" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        {s.label}
                      </span>
                      <span className="font-display text-[15px] font-extrabold text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* CTA */}
            <Reveal delay={0.28}>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Magnetic strength={0.15}>
                  <button
                    onClick={openApply}
                    className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-volt px-10 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_50px_rgba(204,242,68,0.3)] transition-shadow hover:shadow-[0_0_80px_rgba(204,242,68,0.5)] cursor-pointer"
                  >
                    <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                    <span className="relative">APPLY — {PRICE} FOUNDING PRICE</span>
                    <ArrowRight className="relative h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Magnetic>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {AAA_SEATS_LEFT} of {AAA_COHORT.seatsTotal} seats left · Next cohort {AAA_COHORT.nextCohortPrice}
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════ PROGRAM DETAILS TABLE ═══════════════════ */}
        <section id="overview" className="scroll-mt-20 py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="01" label="Overview" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                Program Details
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 rounded-2xl border border-edge bg-panel/40 overflow-hidden backdrop-blur-sm">
                {PROGRAM_INFO.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 px-5 py-3.5 ${
                      i < PROGRAM_INFO.length - 1 ? "border-b border-edge/40" : ""
                    }`}
                  >
                    <span className="w-40 flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {row.label}
                    </span>
                    <span className="text-[14px] font-semibold text-zinc-200">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════ WHO THIS IS FOR ═══════════════════ */}
        <section className="py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Is This You? */}
              <Reveal>
                <div className="rounded-2xl border border-volt/20 bg-void/80 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-volt" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                      Who This Is For
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-extrabold uppercase text-white mb-5">
                    Is this you?
                  </h3>
                  <p className="text-[13.5px] text-zinc-400 leading-relaxed mb-5">
                    You have watched the free masterclass. You understand what is possible. But there is still a gap
                    between knowing and having a client who pays you. This program is built for that gap.
                  </p>
                  <ul className="space-y-3">
                    {IS_FOR.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-zinc-200 leading-relaxed">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Who this is NOT for */}
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-red-500/20 bg-void/80 p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="h-5 w-5 text-red-400" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
                      Who This Is Not For
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-extrabold uppercase text-white mb-5">
                    Straight talk
                  </h3>
                  <p className="text-[13.5px] text-zinc-300 leading-relaxed">
                    {NOT_FOR_TEXT}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════ THE FOUR PILLARS ═══════════════════ */}
        <section id="pillars" className="relative scroll-mt-20 py-14 sm:py-20 border-b border-edge/40 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-volt/[0.03] to-transparent" />
          <div className="relative z-10 mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="02" label="Pillars" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                What The Program Covers
              </h2>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={0.08 + i * 0.06}>
                  <div className="group rounded-2xl border border-edge bg-panel/50 p-5 sm:p-6 transition-all duration-200 hover:border-volt/30 hover:bg-panel/80 h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt/10 text-volt mb-4 transition-colors group-hover:bg-volt/20">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-display text-[15px] font-bold uppercase text-white mb-2">{p.title}</h4>
                    <p className="text-[13px] text-zinc-400 leading-relaxed">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ CURRICULUM ═══════════════════ */}
        <section id="curriculum" className="scroll-mt-20 py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="03" label="Curriculum" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                Week by Week
              </h2>
            </Reveal>

            <div className="mt-10 space-y-3">
              {WEEKS.map((w, i) => (
                <Reveal key={w.week} delay={0.06 + i * 0.05}>
                  <div className="group rounded-2xl border border-edge bg-panel/40 p-5 sm:p-6 transition-all duration-200 hover:border-volt/25 hover:bg-panel/70">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-volt/10 font-display text-sm font-extrabold text-volt">
                        {w.week}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-[14px] font-bold uppercase text-white leading-tight">
                          {w.focus}
                        </h4>
                        <p className="mt-1 text-[13px] text-zinc-400 leading-relaxed">{w.outcome}</p>
                      </div>
                      <ChevronRight className="hidden sm:block h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-volt" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.4}>
              <div className="mt-6 rounded-xl border border-volt/15 bg-volt/5 px-5 py-3.5">
                <p className="text-[13px] text-zinc-300 leading-relaxed">
                  <span className="font-bold text-volt">Weeks 4–6</span> are where most people find the real value. Building the system is the easy part. Selling it is what separates people who earn from people who keep learning.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════ INCLUSIONS ═══════════════════ */}
        <section id="inclusions" className="relative scroll-mt-20 py-14 sm:py-20 border-b border-edge/40 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-volt/[0.04] via-void to-void" />
          <div className="relative z-10 mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="04" label="Inclusions" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                Everything You Get
              </h2>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <InclusionGroup icon={Video} title="Live Sessions" items={INCLUSIONS.liveSessions} delay={0.08} />
              <InclusionGroup icon={MessageSquare} title="Direct Access" items={INCLUSIONS.directAccess} delay={0.14} />
              <InclusionGroup icon={Zap} title="The Commercial Toolkit" items={INCLUSIONS.toolkit} delay={0.20} />
              <InclusionGroup icon={Users} title="Community" items={INCLUSIONS.community} delay={0.26} />
            </div>
          </div>
        </section>

        {/* ═══════════════════ INVESTMENT ═══════════════════ */}
        <section id="investment" className="scroll-mt-20 py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="05" label="Investment" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                What It Costs
              </h2>
            </Reveal>

            {/* Value table */}
            <Reveal delay={0.1}>
              <div className="mt-8 rounded-2xl border border-edge bg-panel/40 overflow-hidden backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-edge/60 bg-panel/60">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Included</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Standalone Value</span>
                </div>
                {VALUE_TABLE.map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-4 px-5 py-3 ${
                      i < VALUE_TABLE.length - 1 ? "border-b border-edge/30" : ""
                    }`}
                  >
                    <span className="text-[13px] text-zinc-300 leading-relaxed">{row.item}</span>
                    <span className="flex-shrink-0 font-mono text-[13px] font-bold text-zinc-400">{row.value}</span>
                  </div>
                ))}
                {/* Totals */}
                <div className="border-t border-volt/30 bg-volt/5">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-volt/15">
                    <span className="font-display text-[14px] font-bold uppercase text-zinc-300">
                      Total standalone value
                    </span>
                    <span className="font-display text-[16px] font-extrabold text-zinc-300 line-through decoration-zinc-500">
                      $4,277
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="font-display text-[16px] font-extrabold uppercase text-volt">
                      Founding cohort price
                    </span>
                    <span className="font-display text-2xl font-black text-volt">
                      $1,500
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Billing notes */}
            <Reveal delay={0.18}>
              <div className="mt-5 space-y-2">
                {[
                  `Billing: ${PRICE} today. Community access is included for the first ${AAA_COHORT.freeCommunityMonths} months, then ${AAA_COHORT.monthlyAfter} per month from month ${AAA_COHORT.freeCommunityMonths + 1}. You can cancel at any time from inside your account.`,
                  `Founding price: This is the price for the first cohort only. The next cohort is ${AAA_COHORT.nextCohortPrice}.`,
                  "Tool costs are separate: budget roughly $50–$120 a month for Retell AI, Twilio, Cal.com and Clay while you build and demo. Those providers bill you directly, not us.",
                  "Refunds: seven days from purchase, or until the first live session — whichever comes first. After the cohort starts the seat is yours, because it is capped at eight and holding it turns someone else away.",
                  "One client at $2,000 setup covers the program. That is the arithmetic — but it depends on you doing the outreach in Weeks 4 to 6.",
                ].map((note, i) => (
                  <p key={i} className="text-[12.5px] text-zinc-500 leading-relaxed">
                    {note}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════ STRAIGHT TALK ═══════════════════ */}
        <section className="py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="06" label="Straight Talk" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                What Is Promised, and What Is Not
              </h2>
            </Reveal>

            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <Reveal delay={0.08}>
                <div className="rounded-2xl border border-volt/20 bg-void/80 p-6">
                  <h4 className="font-display text-[14px] font-bold uppercase text-volt mb-4 flex items-center gap-2">
                    <Check className="h-4 w-4" strokeWidth={3} />
                    What you will finish with
                  </h4>
                  <ul className="space-y-3">
                    {PROMISES.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-zinc-200 leading-relaxed">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.14}>
                <div className="rounded-2xl border border-zinc-700/40 bg-void/80 p-6">
                  <h4 className="font-display text-[14px] font-bold uppercase text-zinc-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    What is not promised
                  </h4>
                  <ul className="space-y-3 mb-5">
                    {NOT_PROMISED.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-zinc-400 leading-relaxed">
                        <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-600" strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[13px] text-zinc-500 leading-relaxed border-t border-edge/40 pt-4">
                    Whether you close depends on how many conversations you have and how you handle them. The process,
                    the tools and the correction are provided. The outreach is yours to do.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>



        {/* ═══════════════════ WHO TEACHES IT ═══════════════════ */}
        <section id="instructor" className="scroll-mt-20 py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="07" label="Who teaches it" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                You Are Buying My Time
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-edge bg-panel/40 p-6 backdrop-blur-sm sm:flex-row sm:p-8">
                <div className="shrink-0">
                  <img
                    src="/me.svg"
                    alt="Zain Ul Abideen"
                    className="h-24 w-24 rounded-2xl border border-volt/25 bg-void object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                    Zain Ul Abideen
                  </h3>
                  <p className="mt-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-volt">
                    Founder, AI Founder Hub · Devmate Solutions
                  </p>
                  <p className="mt-4 text-[13.5px] leading-relaxed text-zinc-300">
                    I run an AI-powered software agency across the UAE, Oman and the USA, with clients in the GCC,
                    Europe and the United States. Since 2019 that has meant 40+ brands across 25+ industries. The
                    systems taught in this program are the ones Devmate sells commercially — the prompt libraries in
                    week three are the ones we bill for.
                  </p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-400">
                    Eight seats is not a marketing number. It is how many builds I can personally review and correct in
                    six weeks while still running the agency. That is the constraint, and it is the reason this costs
                    what it costs.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["40+ brands since 2019", "25+ industries", "UAE · Oman · USA", "Ships daily"].map((t) => (
                      <span
                        key={t}
                        className="rounded-lg border border-edge bg-void/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════ FAQ ═══════════════════ */}
        <section id="faq" className="scroll-mt-20 py-14 sm:py-20 border-b border-edge/40">
          <div className="mx-auto max-w-4xl px-5 md:px-10">
            <Reveal>
              <SectionTag index="08" label="Questions" />
              <h2 className="mt-5 font-display text-3xl font-extrabold uppercase text-white sm:text-4xl">
                Before You Pay
              </h2>
            </Reveal>

            <div className="mt-8 space-y-3">
              {FAQS.map((f, i) => (
                <Reveal key={f.q} delay={0.05 + i * 0.04}>
                  <details className="group rounded-2xl border border-edge bg-panel/40 open:border-volt/25 open:bg-panel/70">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left">
                      <span className="font-display text-[13.5px] font-extrabold uppercase leading-tight tracking-tight text-white">
                        {f.q}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="border-t border-edge/50 px-5 pb-5 pt-4 text-[13px] leading-relaxed text-zinc-400">
                      {f.a}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ ENROLLMENT CTA ═══════════════════ */}
        <section id="enroll" className="relative scroll-mt-20 py-20 sm:py-28 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void via-volt/[0.05] to-void" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/[0.05] blur-[180px]" />

          <div className="relative z-10 mx-auto max-w-3xl px-5 text-center md:px-10">
            <Reveal>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-volt">
                ENROLLMENT
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-6 font-display text-3xl font-extrabold uppercase text-white sm:text-5xl">
                NEXT COHORT STARTS
                <br />
                <span className="font-serif italic font-normal normal-case text-volt">
                  {AAA_COHORT.startDate}
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mx-auto mt-5 max-w-lg text-[14px] text-zinc-400 leading-relaxed">
                Seats are capped at 8 because every build is reviewed individually. Enrollment is by short application —
                I would rather run this with 8 committed people than 20 who fade out in Week 3.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Magnetic strength={0.15}>
                  <button
                    onClick={openApply}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-volt px-10 py-5 font-display text-base font-extrabold uppercase tracking-wide text-void shadow-[0_0_60px_rgba(204,242,68,0.3)] transition-shadow hover:shadow-[0_0_90px_rgba(204,242,68,0.55)] cursor-pointer"
                  >
                    <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                    <span className="relative">APPLY — {PRICE} FOUNDING PRICE</span>
                    <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                  </button>
                </Magnetic>
                <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <span>{AAA_SEATS_LEFT} of {AAA_COHORT.seatsTotal} seats left</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-600" />
                  <span>{PRICE} founding price</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-600" />
                  <span>Next cohort {AAA_COHORT.nextCohortPrice}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-edge py-8">
        <div className="mx-auto max-w-7xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4 md:px-10">
          <Wordmark />
          <span className="font-mono text-[10px] text-zinc-600">
            AI Founder Hub · aifounderhub.com · Build → Sell → Scale
          </span>
        </div>
      </footer>

      <BackToTop />

      <AAAApplicationModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
}
