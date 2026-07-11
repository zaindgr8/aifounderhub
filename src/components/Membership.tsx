import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, PlayCircle, ShieldCheck } from "lucide-react";
import { Magnetic, Reveal, SectionTag, scrollToRegister } from "./shared";

const VALUE_STACK = [
  { item: "Private Community Access — Online & In-Person Dubai Meetups with AI Builders." },
  { item: "Claude, Codex & Latest AI Models — What Top Builders Actually Ship With." },
  { item: "Full-Stack Live Builds — Frontend, Backend, Database from Scratch." },
  { item: "From Code to Live — GitHub, Vercel, App Store & Play Store" },
  { item: "Growth & Marketing Roadmap — Step-by-Step to Your First 50 Paying Users." },

];

const COURSE_CARDS = [
  { title: "Marketing Roadmap & First 50 Users", rotate: -7, x: -28 },
  { title: "Claude, Codex & Latest AI Models", rotate: -2, x: -8 },
  { title: "Full-Stack Live Builds", rotate: 3, x: 12 },
  { title: "From Code to Live", rotate: 8, x: 32 },
  { title: "Private Community Access", rotate: 8, x: 32 },
];

export function Membership({ onPay }: { onPay?: () => void }) {
  return (
    <section
      id="membership"
      className="relative overflow-hidden border-y border-volt/25 scroll-mt-20"
      aria-label="Courses membership offer"
    >
      {/* attention-grabbing volt wash, distinct from every other section */}
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
              <SectionTag index="02" label="Idea → MVP → Launch" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/20 bg-volt/5 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-volt/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-volt opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-volt"></span>
                </span>
                Complete Playbook | Original Price $549
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
              THE ONLY COURSE THAT TAKES YOU FROM
              <br />
              <span className="font-serif italic font-normal normal-case text-volt">IDEA TO LIVE PRODUCT</span>
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-300">
              The Global Software Market is $41 Trillion — and AI just unlocked the door for anyone to walk in. — This course will take you from— no code, no idea, no experience — to a Live, Production-Grade Micro-SaaS, Web App, or Startup. No fluff, no theory — just the exact AI stack & playbook to build, launch, and land your first 50 paying users.
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
                  <span className="flex-shrink-0 font-mono text-[9.5px] font-bold uppercase tracking-wider text-volt/80">
                    {row.value}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* price anchor */}
          {/* <Reveal delay={0.3}>
            <p className="mt-6 max-w-xl text-[13.5px] leading-relaxed text-zinc-400">
              For context: one 1:1 hour costs <span className="font-bold text-zinc-200">$299</span>. The bootcamp is{" "}
              <span className="font-bold text-zinc-200">$249</span>. The membership is{" "}
              <span className="font-bold text-volt">$49.99 a month</span> for everything we have ever recorded.
              That's $1.64 a day.
            </p>
          </Reveal> */}

          {/* CTA */}
          <Reveal delay={0.36}>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Magnetic strength={0.2}>
                <button
                  onClick={onPay ?? scrollToRegister}
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_40px_rgba(204,242,68,0.3)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(204,242,68,0.55)] cursor-pointer"
                  id="membership-pay-btn"
                >
                  <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                  <span className="relative">GET INSTANT ACCESS for $159</span>
                  <ArrowRight className="relative h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Magnetic>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-volt" />
                Cancel anytime · 7-day money-back
              </div>
            </div>
            {/* <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Step 1 is your free account. Your member upgrade link arrives in the welcome email.
            </p> */}
          </Reveal>
        </div>

        {/* ——— RIGHT: fanned course-card stack ——— */}
        <div className="relative mx-auto hidden w-full max-w-md items-center justify-center lg:flex" aria-hidden="true">
          <div className="relative h-[360px] w-full">
            {COURSE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ y: 60, opacity: 0, rotate: 0 }}
                whileInView={{ y: 0, opacity: 1, rotate: card.rotate, x: card.x }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 120, damping: 16 }}
                whileHover={{ y: -12, rotate: 0, zIndex: 30, transition: { duration: 0.25 } }}
                className={`absolute left-1/2 top-1/2 h-56 w-64 -translate-x-1/2 -translate-y-1/2 cursor-default rounded-2xl border p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm ${i === COURSE_CARDS.length - 1
                  ? "border-volt/50 bg-gradient-to-br from-volt/15 to-panel"
                  : "border-edge bg-panel/95"
                  }`}
                style={{ zIndex: i }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    {card.badge && (
                      <span className="mb-2 inline-block rounded bg-volt/20 px-2 py-0.5 font-mono text-[8.5px] font-black uppercase tracking-wider text-volt">
                        {card.badge}
                      </span>
                    )}
                    <h3 className="font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-white">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {card.lessons} · {card.time}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    {/* <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                      <PlayCircle className="h-4 w-4 text-volt" /> Stream instantly
                    </span> */}
                    {/* <span className="rounded-md bg-void/80 px-2 py-1 font-mono text-[9px] font-bold uppercase text-volt">
                      Included
                    </span> */}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* floating member proof */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.75 }}
              className="absolute -bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border border-edge bg-void/95 px-4 py-2 shadow-xl"
              style={{ animation: "float-y 5s ease-in-out infinite" }}
            >
              <div className="flex -space-x-2">
                {["bg-volt text-void", "bg-lilac text-void", "bg-orange-400 text-void"].map((cls, i) => (
                  <span
                    key={i}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-void text-[8px] font-black ${cls}`}
                  >
                    {["SA", "MJ", "DK"][i]}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                A GROWING COMMUNITY OF AI BUILDERS
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
