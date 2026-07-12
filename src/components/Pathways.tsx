import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Rocket,
  Briefcase,
  TrendingUp,
  Bot,
  Check,
  ArrowRight,
  Package,
  GraduationCap,
  Users,
  CalendarCheck,
} from "lucide-react";
import { Reveal, SectionTag, scrollToRegister } from "./shared";

interface Week {
  title: string;
  focus: string;
  materials: string[];
  outcome: string;
}

interface Pathway {
  id: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  audience: string;
  weeks: Week[];
  deliverables: string[];
}

const PATHWAYS: Pathway[] = [
  {
    id: "founder",
    name: "Founder Launch",
    icon: Rocket,
    tagline: "Idea → live product → first client, in 30 days",
    audience:
      "Aspiring startup founders, with an idea or none yet, who want a real product live and a path to first revenue.",
    weeks: [
      {
        title: "Validate Like a Pro",
        focus: "AI-powered market research, customer profiling, and offer design before you build anything.",
        materials: ["Validation workbook", "25 market-research prompts", "Competitor-scan agent template"],
        outcome: "A validated one-liner + waitlist landing page live",
      },
      {
        title: "Build the MVP",
        focus: "The conversational build sprint: Claude, Cursor & Lovable turn your validated idea into working software.",
        materials: ["MVP blueprint canvas", "Founder prompt library", "UI component kit"],
        outcome: "A clickable, working MVP deployed to a real URL",
      },
      {
        title: "Monetize It",
        focus: "Payments, pricing psychology, and pilot offers: wiring real money into your product.",
        materials: ["Stripe integration playbook", "Pricing calculator", "Pilot-offer call scripts"],
        outcome: "Live checkout + 3 pilot-customer conversations booked",
      },
      {
        title: "Launch & Sell",
        focus: "Founder-led distribution: launch channels, outreach systems, and your demo-day pitch.",
        materials: ["30-day GTM plan template", "Outreach sequence pack", "Pitch deck framework"],
        outcome: "Public launch + a working first-client pipeline",
      },
    ],
    deliverables: ["Working product on a live URL", "Validated offer & pricing", "Stripe checkout live", "30-day go-to-market plan", "Demo-day pitch"],
  },
  {
    id: "freelancer",
    name: "Freelance Pro",
    icon: Briefcase,
    tagline: "Get hired for AI skills on global marketplaces",
    audience:
      "Anyone who wants income from AI services, starting from zero clients, zero portfolio, zero personal brand.",
    weeks: [
      {
        title: "Pick Your Lane",
        focus: "Choose a productized AI service (app builds, chatbots, automations) and position yourself to charge premium rates.",
        materials: ["Niche selector matrix", "Service menu templates", "Rate card builder"],
        outcome: "A defined offer + AI-built portfolio site live",
      },
      {
        title: "Proof of Work",
        focus: "Build three portfolio demos with AI and turn each into a client-magnet case study.",
        materials: ["3 demo project briefs", "Case-study generator prompts", "Loom walkthrough framework"],
        outcome: "Three polished, deployed portfolio pieces",
      },
      {
        title: "Marketplace Domination",
        focus: "Upwork, Fiverr & LinkedIn: profile optimization, proposal systems, and a pricing ladder that filters for good clients.",
        materials: ["Profile audit checklist", "20 winning proposal templates", "Keyword research kit"],
        outcome: "Optimized profiles + 10 tailored proposals sent",
      },
      {
        title: "The Client Machine",
        focus: "Discovery calls, scoping, contracts, delivery workflow, and turning one gig into repeat business.",
        materials: ["Discovery call scripts", "Scope-of-work templates", "Delivery & review checklist"],
        outcome: "A repeatable client pipeline + first-gig action plan",
      },
    ],
    deliverables: ["Live portfolio site", "3 case-study projects", "Optimized marketplace profiles", "Proposal & pricing system", "Client delivery playbook"],
  },
  {
    id: "scaleup",
    name: "Business Scale-Up",
    icon: TrendingUp,
    tagline: "Bolt AI onto a business that already works",
    audience:
      "Owners and operators with existing revenue who want hours back, margins up, and a team that actually uses AI.",
    weeks: [
      {
        title: "AI Opportunity Audit",
        focus: "Map every workflow in your business and score it for automation ROI, so you fix what actually moves profit.",
        materials: ["Workflow mapping canvas", "ROI scoring matrix", "Audit interview agent"],
        outcome: "A prioritized automation roadmap for your business",
      },
      {
        title: "Automate Operations",
        focus: "Support bots, CRM hygiene, document processing and back-office automation with n8n + LLM APIs.",
        materials: ["12 plug-and-play automation templates", "Integration setup guides", "Cost-per-task calculator"],
        outcome: "Your first 3 automations running in production",
      },
      {
        title: "The AI Growth Engine",
        focus: "Content factories, personalized funnels and AI lead scoring: marketing that compounds while you sleep.",
        materials: ["Content engine setup kit", "Funnel personalization templates", "Lead-scoring prompt pack"],
        outcome: "An AI-assisted marketing system shipping weekly",
      },
      {
        title: "Team & Governance",
        focus: "SOPs, staff training, data safety and vendor strategy: making AI stick after the bootcamp ends.",
        materials: ["AI policy template", "Team training curriculum", "90-day roadmap canvas"],
        outcome: "Team enabled + a signed-off 90-day AI roadmap",
      },
    ],
    deliverables: ["Automation ROI roadmap", "3 production automations", "AI marketing engine", "Team AI playbook & SOPs", "90-day scale roadmap"],
  },
  {
    id: "agency",
    name: "Automation Agency",
    icon: Bot,
    tagline: "Sell AI automations as a recurring-revenue service",
    audience:
      "Builders who want an agency-style business: productized AI services, monthly retainers, and systems that scale past their own hours.",
    weeks: [
      {
        title: "Niche & Offer",
        focus: "Pick a vertical, design retainer packages, and build a brand that sounds expensive because it is.",
        materials: ["Vertical selection scorecard", "Retainer package builder", "Agency brand kit prompts"],
        outcome: "Signature offer defined + agency site live",
      },
      {
        title: "The Delivery Stack",
        focus: "Reusable agent and automation templates (OpenClaw, n8n, LLM APIs) so every client build takes days, not weeks.",
        materials: ["Agent template vault", "Build-system SOPs", "Client environment checklist"],
        outcome: "A deliver-in-one-week fulfillment stack",
      },
      {
        title: "The Sales Engine",
        focus: "AI-assisted outbound, call booking, discovery frameworks and closing retainers without being salesy.",
        materials: ["Outbound sequence pack", "Discovery call framework", "Proposal & close templates"],
        outcome: "20 outbound conversations + booked discovery calls",
      },
      {
        title: "Fulfill & Scale",
        focus: "QA systems, subcontracting, upsells and account management: running the agency, not just the builds.",
        materials: ["QA checklist library", "Subcontractor onboarding kit", "Upsell map template"],
        outcome: "Retainer pipeline + a 90-day scale plan",
      },
    ],
    deliverables: ["Agency brand & site live", "Productized retainer offer", "Reusable delivery stack", "Outbound sales engine", "90-day agency scale plan"],
  },
];

const INCLUDED = [
  { icon: GraduationCap, label: "Live weekly labs" },
  { icon: Users, label: "1:1 checkpoints" },
  { icon: Package, label: "Templates & workbooks" },
  { icon: CalendarCheck, label: "Demo day finale" },
];

export function Pathways() {
  const [activeId, setActiveId] = useState("founder");
  const active = PATHWAYS.find((p) => p.id === activeId)!;

  return (
    <section id="bootcamp" className="relative overflow-hidden border-t border-edge py-16 sm:py-20 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
      <div
        className="pointer-events-none absolute right-[-10%] top-[10%] h-[55vh] w-[40vw] rounded-full blur-[150px]"
        style={{ background: "rgba(181,161,255,0.10)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        {/* heading */}
        <div className="mb-12 text-center">
          <Reveal>
            <div className="flex justify-center">
              <SectionTag index="03" label="The AI Builder Bootcamp" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
              One goal.
              <br />
              <span className="font-serif italic font-normal normal-case text-volt">One pathway.</span> One month.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              The bootcamp isn't a course you watch. It's a result you ship. Pick the pathway that matches your goal
              and follow a 4-week build plan with live labs, 1:1 checkpoints, and a demo day at the end.
            </p>
          </Reveal>
          <Reveal delay={0.19}>
            <p className="mx-auto mt-3 font-mono text-[11px] font-bold uppercase tracking-wider text-volt/80">
              Led by founders Ahmed Al Kindi &amp; Zain Ul Abideen
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-volt/30 bg-volt/[0.07] px-5 py-2.5">
              <span className="font-display text-2xl font-extrabold text-volt">$249</span>
              <span className="text-left font-mono text-[9.5px] font-bold uppercase leading-tight tracking-wider text-zinc-400">
                per program
                <br />
                up to 4 weeks
              </span>
            </div>
          </Reveal>
        </div>

        {/* pathway tabs */}
        <Reveal delay={0.1}>
          <div className="mx-auto mb-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
            {PATHWAYS.map((p) => {
              const isActive = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`relative flex items-center gap-2 rounded-full px-5 py-3 font-display text-[12px] font-extrabold uppercase tracking-wide transition-colors duration-300 cursor-pointer ${isActive ? "text-void" : "border border-edge bg-panel/60 text-zinc-400 hover:text-white"
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pathway-pill"
                      className="absolute inset-0 rounded-full bg-volt"
                      transition={{ type: "spring", stiffness: 350, damping: 32 }}
                    />
                  )}
                  <p.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{p.name}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* active pathway panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          >
            {/* left: who + deliverables + CTA */}
            <div className="flex flex-col justify-between rounded-3xl border border-edge bg-panel/70 p-7 sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-volt/12 text-volt">
                    <active.icon className="h-5.5 w-5.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                      {active.name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
                      {active.tagline}
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-[13.5px] leading-relaxed text-zinc-400">
                  <span className="font-bold text-zinc-200">Who it's for: </span>
                  {active.audience}
                </p>

                <div className="mt-6">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                    You graduate with
                  </span>
                  <ul className="mt-3 space-y-2">
                    {active.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2.5 text-[13px] font-semibold text-zinc-300">
                        <span className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  {INCLUDED.map((inc) => (
                    <div
                      key={inc.label}
                      className="flex items-center gap-2 rounded-xl border border-edge bg-void/60 px-3 py-2.5 text-[11px] font-bold text-zinc-300"
                    >
                      <inc.icon className="h-3.5 w-3.5 flex-shrink-0 text-lilac" />
                      {inc.label}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollToRegister}
                className="group mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl bg-volt py-4 font-display text-[14px] font-extrabold uppercase tracking-wide text-void transition-all duration-300 hover:shadow-[0_0_40px_rgba(204,242,68,0.4)] active:scale-[0.98] cursor-pointer"
              >
                Apply for {active.name} · $249
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Applications start with the free account. Pick your goal in the signup form and your pathway invite
                follows by email.
              </p>
            </div>

            {/* right: week-by-week curriculum */}
            <div className="space-y-3.5">
              {active.weeks.map((week, i) => (
                <motion.div
                  key={`${active.id}-w${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group rounded-2xl border border-edge bg-panel/60 p-5 transition-colors duration-300 hover:border-volt/25 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-edge bg-void font-display leading-none text-zinc-300">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">WK</span>
                      <span className="text-base font-extrabold text-volt">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display text-[15px] font-extrabold uppercase tracking-tight text-white">
                        {week.title}
                      </h4>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">{week.focus}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {week.materials.map((m) => (
                          <span
                            key={m}
                            className="rounded-md border border-edge bg-void/70 px-2 py-1 font-mono text-[9.5px] font-bold text-zinc-400"
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-[11.5px] font-bold text-volt">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        {week.outcome}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
            Not sure which pathway fits? Join a free workshop first. We'll route you from there.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
