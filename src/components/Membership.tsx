import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, ShieldCheck, TrendingUp, Globe2, Users } from "lucide-react";
import { Magnetic, Reveal, SectionTag, scrollToRegister } from "./shared";

const VALUE_STACK = [
  // { item: "AI Lead Management System — Built, Deployed & Ready to Sell." },
  { item: "AI Lead Management System — Handles Calls, Qualifies Leads & Books Appointments." },
  { item: "AAA Agency Setup — Niche, Offer, Outreach & First Client Playbook." },
  { item: "Private Builders Community — Online & In-Person Dubai Meetups." },
  { item: "Sales Playbook — Scripts, Proposals & Close Your First $2K Client." },
];

const MARKET_FACTS = [
  {
    icon: TrendingUp,
    title: "$50B Agency Market by 2033",
    desc: "The AI Automation Agency market is growing at ~25% CAGR as businesses outsource automation builds.",
  },
  {
    icon: Globe2,
    title: "3–5x Global Arbitrage",
    desc: "US & European clients pay 3–5x for equivalent workflows — giving Dubai & remote agencies a massive edge.",
  },
  {
    icon: Users,
    title: "48% Talent Shortage",
    desc: "Middle East organizations cite lack of AI talent as their #1 barrier — forcing them to hire outside agencies.",
  },
];

const COURSE_CARDS = [
  { title: "AI Lead Management System", rotate: -7, x: -28 },
  { title: "AI Call Assistant Build", rotate: -2, x: -8 },
  { title: "AAA Agency Launch", rotate: 3, x: 12 },
  { title: "Sales & Client Closing", rotate: 8, x: 32 },
  { title: "Private Builders Community", rotate: 8, x: 32 },
];

export function Membership({ onPay }: { onPay?: () => void }) {
  return (
    <section
      id="membership"
      className="relative overflow-hidden border-y border-volt/25 scroll-mt-20"
      aria-label="Courses membership offer"
    >
      {/* attention-grabbing volt wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-volt/[0.07] via-void to-void" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
      <div
        className="pointer-events-none absolute -top-20 right-[10%] h-72 w-72 rounded-full blur-[120px]"
        style={{ background: "rgba(204,242,68,0.13)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:py-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ——— LEFT: the offer ——— */}
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SectionTag index="02" label="AAA Accelerator" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-0.5 font-mono text-[9.5px] font-extrabold uppercase tracking-wider text-volt">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-volt opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-volt"></span>
                </span>
                Next Cohort: Starts 20th September (Limited Seats)
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
              THE ONLY PROGRAM THAT TAKES YOU FROM
              <br />
              <span className="font-serif italic font-normal normal-case text-volt">Zero to First $2,000 AI Client</span>
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-300">
              The AI Automation Agency (AAA) market is exploding toward <strong>$50 Billion</strong> — and <strong>74% of businesses</strong> are looking for external help to deploy AI that makes revenue. This program takes you from zero to running a live AAA: you'll build the system, package the offer, and land your first $2,000 paying client in 90 days.
            </p>
          </Reveal>

          {/* value stack */}
          <div className="mt-7 space-y-2.5">
            {VALUE_STACK.map((row, i) => (
              <Reveal key={row.item} delay={0.18 + i * 0.06}>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-volt/15 bg-void/60 px-4 py-2.5">
                  <span className="flex items-start gap-2.5 text-[13px] font-semibold text-zinc-200">
                    <span className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-volt/20 text-volt">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {row.item}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.36}>
            <div className="mt-8 flex flex-col items-start gap-3.5">
              <div className="flex flex-wrap items-center gap-3.5">
                {/* 1. Explore Program Button */}
                <a
                  href="/aaa-accelerator"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-display text-[13.5px] font-extrabold uppercase tracking-wide text-white transition-all duration-300 hover:border-volt/60 hover:bg-white/10 hover:text-volt cursor-pointer whitespace-nowrap"
                  id="membership-explore-btn"
                >
                  <span>EXPLORE PROGRAM</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                {/* 2. Buy Program Button */}
                <Magnetic strength={0.2}>
                  <button
                    onClick={onPay ?? scrollToRegister}
                    className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt px-7 py-3.5 font-display text-[14px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_35px_rgba(204,242,68,0.3)] transition-shadow duration-300 hover:shadow-[0_0_55px_rgba(204,242,68,0.6)] cursor-pointer whitespace-nowrap"
                    id="membership-buy-btn"
                  >
                    <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                    <span className="relative whitespace-nowrap">BUY PROGRAM — $1,499</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Magnetic>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="h-3.5 w-3.5 text-volt flex-shrink-0" />
                  <span>8 seats · founding cohort · $159/mo from month 4</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ——— RIGHT: Market Advantage Box & Stack ——— */}
        <div className="relative mx-auto w-full max-w-lg space-y-4">
          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-volt/20 bg-void/90 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-volt" />
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-volt">
                  The Market Arbitrage — Why Now?
                </span>
              </div>

              <div className="space-y-3.5">
                {MARKET_FACTS.map((fact) => (
                  <div key={fact.title} className="flex items-start gap-3 rounded-xl border border-white/5 bg-panel/60 p-3.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-volt/10 text-volt">
                      <fact.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-[13px] font-bold uppercase text-white leading-tight">
                        {fact.title}
                      </h4>
                      <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
                        {fact.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-zinc-400 font-mono text-[10px]">
                <span>North America &amp; Europe hold &gt;60% market share</span>
                <span className="text-volt font-bold">Sell Globally</span>
              </div>
            </div>
          </Reveal>

          {/* Premium active community proof badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-volt/25 bg-void/90 p-3.5 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-void bg-volt text-[10px] font-black text-void shadow-md">
                  DXB
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-void bg-lilac text-[10px] font-black text-void shadow-md">
                  RUH
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-void bg-amber-400 text-[10px] font-black text-void shadow-md">
                  LON
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-void bg-zinc-800 text-[10px] font-bold text-volt shadow-md">
                  +40
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-display text-[12px] font-bold uppercase tracking-wider text-white">
                    Active AAA Builders Community
                  </span>
                </div>
                <p className="font-mono text-[10px] text-zinc-400">
                  Online Network + In-Person Dubai Meetups
                </p>
              </div>
            </div>

            <span className="rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wider text-volt whitespace-nowrap">
              Founding Cohort
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
