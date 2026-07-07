import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";
import { Reveal, SectionTag } from "./shared";

const FAQ_LIST = [
  {
    question: "What do I actually get for free?",
    answer:
      "A free seat gives you access to live workshops— no card required, nothing auto-upgrades. Every upcoming event invite lands in your inbox automatically after you claim your seat.",
  },
  {
    question: "Do I need any coding or technical skills?",
    answer:
      "Zero. If you can type a message, you have every skill you need. We use conversational AI prompting — Claude, Codex, and the latest models write the architecture live on screen while you direct it. No syntax, no terminal, no prior experience required.",
  },
  {
    question: "Do I need a startup idea before I join?",
    answer:
      "Not at all. Many of the builders who've shipped real products started completely blank. In the first session we run live brainstorming frameworks that pull high-demand micro-SaaS ideas straight out of your daily routines and industry — you'll leave Day 1 with a validated direction.",
  },
  {
    question: "How do the 1:1 sessions with the founders work?",
    answer:
      "Each private session is 60 minutes at $299. Ahmed focuses on business strategy, scaling, and GCC market positioning. Zain Ul Abideen covers AI engineering, Micro-SaaS building, and agency operations.",
  },
  {
    question: "Is this in person or online?",
    answer:
      "Virtual-first — join from anywhere in the world. We also run regular in-person build nights and intensives in Dubai for the GCC community. Members always get first access to in-person seats.",
  },
  {
    question: "What if I already have a business or an existing app?",
    answer:
      "Even better. The course and workshops are built to work at every stage. If you have a business, we help you add AI-powered features, cut operational costs, and open new revenue streams. If you already have an app, we show you how to integrate Claude, Codex, and live model APIs to take it to the next level.",
  },
];

export function Faq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden border-t border-edge bg-panel/30 py-16 sm:py-20 scroll-mt-20">
      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-10">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* left intro */}
          <div className="space-y-5 lg:col-span-5">
            <Reveal>
              <SectionTag index="05" label="Got questions?" />
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="font-display text-5xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-6xl">
                Every
                <br />
                question.
                <br />
                <span className="font-serif italic font-normal normal-case text-lilac">straight answer.</span>
              </h3>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="max-w-md pt-1 text-sm font-medium leading-relaxed text-zinc-400">
                No fluff, no fine print. The things real builders ask before they claim their free seat — answered.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="max-w-sm space-y-4 border-t border-edge pt-6">
                <div className="flex items-start gap-3 text-xs font-semibold text-zinc-300">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-volt" />
                  Free seat — no card, no auto-upgrade, ever. Paid options exist but are always your choice.
                </div>
                <div className="flex items-start gap-3 text-xs font-semibold text-zinc-300">
                  <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-lilac" />
                  1:1 sessions with active founders — not coaches.
                </div>
              </div>
            </Reveal>
          </div>

          {/* right accordion */}
          <div className="space-y-3 lg:col-span-7">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <Reveal key={idx} delay={idx * 0.05}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen ? "border-volt/30 bg-panel" : "cursor-pointer border-edge bg-panel/50 hover:bg-panel/80"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-3.5">
                        <span
                          className={`font-mono text-[10px] font-bold ${isOpen ? "text-volt" : "text-zinc-600"}`}
                        >
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="font-display text-[13.5px] font-extrabold uppercase leading-tight tracking-tight text-white sm:text-sm">
                          {faq.question}
                        </span>
                      </span>
                      <span
                        className={`flex-shrink-0 rounded-lg p-1.5 transition-all duration-300 ${
                          isOpen ? "rotate-180 bg-volt/10 text-volt" : "bg-white/[0.04] text-zinc-500"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <p className="border-t border-white/5 px-5 pb-5 pt-3.5 pl-[52px] text-[13px] font-medium leading-relaxed text-zinc-400">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
