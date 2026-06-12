import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";
import { Reveal, SectionTag } from "./shared";

const FAQ_LIST = [
  {
    question: "What do I actually get for free?",
    answer:
      "A lot: weekly live masterclasses (Claude, OpenClaw, app building, automations), the 3-day flagship build summit, the community itself, and free Dubai build nights. One signup adds you to the list, and every upcoming workshop invite lands in your inbox automatically.",
  },
  {
    question: "How is the $249 bootcamp different from the free workshops?",
    answer:
      "Workshops teach a skill in one session; the bootcamp ships a result. You pick a goal-based pathway (launch a startup, go freelance, scale your business, or build an automation agency) and follow a 4-week plan with live labs, 1:1 checkpoints, templates and a demo day. You graduate with deliverables, not certificates of attendance.",
  },
  {
    question: "How do the courses membership and 1:1 sessions work?",
    answer:
      "The courses membership is $49.99 per month: the full course library, every masterclass and summit replay, the template vault, and members-only channels. Cancel anytime. Private 1:1 sessions with Ahmed (business) or Zain (AI engineering) are 60 minutes at $299 per session, booked whenever you need a targeted unblock. No monthly commitment.",
  },
  {
    question: "Are sessions in person or online?",
    answer:
      "Virtual-first, so you can join from anywhere. We also run regular in-person sessions in Dubai: free community build nights and paid hands-on intensives. Members get first access to in-person seats.",
  },
  {
    question: "Do I need a fully formed app idea before I join?",
    answer:
      "Absolutely not. Many of our most successful graduates started completely blank. During the Day 1 masterclass we run live brainstorming frameworks and workbook blueprints that extract high-demand micro-SaaS opportunities straight out of your daily routines.",
  },
  {
    question: "Do I need any coding or technical skills?",
    answer:
      "No experience required whatsoever. If you can type a message or make a slide, you have 100% of the skills needed. We use natural, conversational prompting: the AI writes the code architecture live on screen while you direct it.",
  },
  {
    question: "How advanced do I need to be with AI?",
    answer:
      "Whether you prompt daily or have never opened an AI tool in your life, the curriculum starts from absolute ground level and builds clearly from basic inputs to advanced API connectors. Nobody gets left behind.",
  },
  {
    question: "Will this help if I'm a coach or consultant?",
    answer:
      "Heavily. In 2026, the fastest way to stand out from generic competitors and win high-paying clients is shipping custom digital toolkits (diagnostic calculators, client dashboards, automated intake apps) that deliver immediate, tangible value.",
  },
  {
    question: "Do I need a specific tech stack or expensive hardware?",
    answer:
      "No. Everything we demonstrate runs in a single browser tab. We even cover zero-cost hosting and one-click deploy platforms so you can publish your prototype for free.",
  },
  {
    question: "What if I already have an app?",
    answer:
      "Perfect. This is your catalyst to level it up. We'll show you how to safely add AI features (summaries, generation, recommendations), wire in server-side model APIs, and refactor for dramatically lower upkeep costs.",
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
              <SectionTag index="07" label="Still unsure?" />
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="font-display text-5xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-6xl">
                Quick
                <br />
                <span className="font-serif italic font-normal normal-case text-lilac">answers.</span>
              </h3>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="max-w-md pt-1 text-sm font-medium leading-relaxed text-zinc-400">
                The questions every founder asks right before they grab a seat. Answered straight, no fine print.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="max-w-sm space-y-4 border-t border-edge pt-6">
                <div className="flex items-start gap-3 text-xs font-semibold text-zinc-300">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-volt" />
                  100% free virtual ticket. No card needed, and nothing ever auto-upgrades you to a paid plan.
                  Upgrades are always your call.
                </div>
                <div className="flex items-start gap-3 text-xs font-semibold text-zinc-300">
                  <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-lilac" />
                  Interactive workbook download available immediately after registration.
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
