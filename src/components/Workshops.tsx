import React, { useState } from "react";
import {
  ArrowRight,
  Zap,
  CheckCircle2,
  PhoneCall,
  Workflow,
  Target,
  BadgeDollarSign,
  Crown,
  Check,
} from "lucide-react";
import { Reveal, SectionTag } from "./shared";
import { WorkshopRegistrationModal } from "./WorkshopRegistrationModal";

const FREE_MASTERCLASS_DETAILS = {
  title: "Weekly AI Automation Agency (AAA) Masterclass",
  desc: "Live, hands-on masterclass where we build AI voice assistants, chatbots, and CRM automations from scratch using Retell AI, Vapi, and n8n.",
  emoji: "⚡",
  tagline: "Free live weekly masterclass covering voice agents, chatbots, automations, and lead generation.",
};

const MARKET_STATS = [
  {
    num: "$1.14T",
    label: "Global AI Automation Market",
    sub: "Surging at 31.4% CAGR to 2033",
  },
  {
    num: "74%",
    label: "Adoption Gap in Businesses",
    sub: "Testing AI, but only 7% generating revenue",
  },
  {
    num: "3–5x",
    label: "Global Client Arbitrage",
    sub: "US & EU pay top rates for automated workflows",
  },
];

const AGENCY_PILLARS = [
  {
    step: "01",
    icon: PhoneCall,
    title: "AI Voice Agents & Chatbots",
    desc: "Build human-sounding voice agents & qualification bots on Retell AI & Vapi, connected to 24/7 calendar booking via Cal.com.",
    tools: ["Retell AI", "Vapi", "Cal.com", "Twilio"],
    accent: "text-volt border-volt/20 bg-volt/10",
  },
  {
    step: "02",
    icon: Workflow,
    title: "No-Code Workflow Automations",
    desc: "Connect AI tools directly to CRMs using n8n & Make. Trigger instant WhatsApp/SMS alerts and eliminate manual back-office tasks.",
    tools: ["n8n", "Make.com", "Zapier", "CRMs"],
    accent: "text-lilac border-lilac/20 bg-lilac/10",
  },
  {
    step: "03",
    icon: Target,
    title: "Lead Scraping & Outbound Engine",
    desc: "Find high-intent business leads in real estate, clinics & gyms, and automate 1:1 personalized cold outreach emails using Claude & Clay.",
    tools: ["Claude AI", "Clay", "Cold Email"],
    accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  },
  {
    step: "04",
    icon: BadgeDollarSign,
    title: "Packaging & $2,000+ Retainer Sales",
    desc: "Structure your agency offer ($1,500–$3,000 setup + monthly retainers) and use live demo scripts that close clients on the first call.",
    tools: ["Retainer Model", "Scripts", "Proposals"],
    accent: "text-amber-400 border-amber-400/20 bg-amber-400/10",
  },
];

const STACK_BADGES = [
  "Retell AI",
  "Vapi",
  "n8n",
  "Make.com",
  "Zapier",
  "Claude AI",
  "Cal.com",
  "Twilio",
];

export function Workshops() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section id="workshops" className="relative overflow-hidden py-16 sm:py-20 scroll-mt-20">
        {/* Background Atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
        <div
          className="pointer-events-none absolute left-[-15%] top-[10%] h-[55vh] w-[45vw] rounded-full blur-[150px]"
          style={{ background: "rgba(204,242,68,0.07)" }}
        />
        <div
          className="pointer-events-none absolute right-[-10%] bottom-[10%] h-[50vh] w-[40vw] rounded-full blur-[140px]"
          style={{ background: "rgba(181,161,255,0.06)" }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <Reveal>
              <div className="flex justify-center items-center gap-2.5 flex-wrap">
                <SectionTag index="01" label="Free Weekly Masterclass" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-volt opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-volt" />
                  </span>
                  Live &amp; Hands-On · 100% Free
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-[54px]">
                Build Your AI Automation Agency
              </h2>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-4 text-[15px] sm:text-[16px] leading-relaxed text-zinc-300">
                Join our free live masterclass where we build production-grade AI systems on screen. Learn how to
                construct AI Voice Agents, build intelligent chatbots, automate backend workflows, and land paying clients.
              </p>
            </Reveal>

            {/* Tools covered */}
            <Reveal delay={0.18}>
              <div className="mt-5 flex flex-wrap justify-center items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mr-1">
                  Tools covered live:
                </span>
                {STACK_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-md border border-edge bg-panel/80 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-zinc-300"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Market Proof Bar */}
          <Reveal delay={0.2}>
            <div className="my-7 rounded-2xl border border-edge bg-void/80 p-4 sm:p-5 backdrop-blur-md">
              <div className="grid grid-cols-1 divide-y divide-edge/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0 text-center">
                {MARKET_STATS.map((stat) => (
                  <div key={stat.label} className="px-4 py-2 sm:py-0">
                    <div className="font-display text-2xl sm:text-3xl font-black text-volt">
                      {stat.num}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mt-0.5">
                      {stat.label}
                    </div>
                    <div className="font-mono text-[10.5px] text-zinc-500 mt-0.5">
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Single Unified 4-Pillar System Container */}
          <Reveal delay={0.24}>
            <div className="rounded-3xl border border-edge/80 bg-[#0d0d15] p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                    The Complete Masterclass Curriculum
                  </span>
                  <h3 className="font-display text-xl font-extrabold uppercase text-white mt-0.5">
                    What We Build Together Live
                  </h3>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10.5px] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-volt" /> Live Build on Screen
                </span>
              </div>

              {/* 4 Unified Horizontal Flow Rows */}
              <div className="space-y-4">
                {AGENCY_PILLARS.map((pillar) => (
                  <div
                    key={pillar.step}
                    className="group rounded-2xl border border-white/5 bg-panel/50 p-4 sm:p-5 transition-all duration-200 hover:border-white/15 hover:bg-panel flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black border border-white/10 bg-void text-zinc-300 group-hover:text-volt group-hover:border-volt/30 transition-colors">
                        {pillar.step}
                      </span>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className={`p-1 rounded-lg ${pillar.accent}`}>
                            <pillar.icon className="h-4 w-4" />
                          </span>
                          <h4 className="font-display text-base font-bold text-white uppercase tracking-tight">
                            {pillar.title}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-[13px] text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center pl-14 sm:pl-14 md:pl-0">
                      {pillar.tools.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-white/5 bg-void/70 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Bridge & CTA Bar */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-5 bg-void/50 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-3 text-center lg:text-left">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-volt/10 text-volt">
                    <Crown className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-[13px] text-zinc-300">
                      <strong className="text-white">Free Weekly Class:</strong> Master the tools &amp; live builds.{" "}
                      <strong className="text-volt">AAA Accelerator:</strong> We guide you to your first $2,000 client in 90 days.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  id="masterclass-register-cta-btn"
                  className="group relative flex-shrink-0 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-volt px-7 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_30px_rgba(204,242,68,0.3)] transition-all hover:shadow-[0_0_50px_rgba(204,242,68,0.55)] active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                  <Zap className="relative h-3.5 w-3.5 fill-void" />
                  <span className="relative">Claim Free Masterclass Seat</span>
                  <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Micro Trust Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-volt" />
              <span>100% Free · No Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-volt" />
              <span>Calendar Invite &amp; Reminder</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-volt" />
              <span>Replay Access For All Registrants</span>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <WorkshopRegistrationModal
        workshop={modalOpen ? FREE_MASTERCLASS_DETAILS : null}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
