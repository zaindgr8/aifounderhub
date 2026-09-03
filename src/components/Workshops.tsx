import React, { useState } from "react";
import {
  ArrowRight,
  Zap,
  CheckCircle2,
  Crown,
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

          {/* Masterclass Registration CTA Bar */}
          <Reveal delay={0.24}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 bg-panel/70 rounded-2xl p-5 sm:p-6 border border-edge/80 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3.5 text-center lg:text-left">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-volt/10 text-volt">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-[13.5px] text-zinc-300 leading-relaxed">
                    <strong className="text-white">Free Weekly Class:</strong> Master the tools &amp; live builds on screen.{" "}
                    <strong className="text-volt">AAA Accelerator:</strong> We guide you to your first $2,000 client.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                id="masterclass-register-cta-btn"
                className="group relative flex-shrink-0 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_30px_rgba(204,242,68,0.3)] transition-all hover:shadow-[0_0_50px_rgba(204,242,68,0.55)] active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                <Zap className="relative h-4 w-4 fill-void" />
                <span className="relative">Claim Free Masterclass Seat</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
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
