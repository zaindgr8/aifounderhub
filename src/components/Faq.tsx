import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";
import { Reveal, SectionTag } from "./shared";

const FAQ_LIST = [
  {
    question: "What exactly is an AI Lead Management System?",
    answer:
      "It's the core product you build and sell as an AAA (AI Automation Agency). It captures leads from multiple channels, scores them with AI, sends automated follow-up sequences, and syncs everything to a CRM — so your client's sales team only talks to qualified prospects. Businesses in real estate, clinics, gyms, and e-commerce pay $1,500–$5,000/month for this.",
  },
  {
    question: "Do I need coding or technical experience?",
    answer:
      "None at all. We use AI tools like Claude, n8n, and voice agent platforms that let you build and deploy full systems through configuration and prompting — not code. If you can use WhatsApp, you can follow the sessions. We've had members with zero tech background close their first client within 30 days.",
  },
  {
    question: "What do I actually get from the free weekly masterclass?",
    answer:
      "Every week you join a live, hands-on session where we build something real on screen — an AI Call Assistant, a lead capture system, an outbound sequence. You follow along, ask questions, and walk away with a working demo you can show prospects. No pitch, no slides-only webinar. Just building.",
  },
  {
    question: "What's included in the AAA Accelerator ($1,500 founding cohort)?",
    answer:
      "A 6-week live program: 12 sessions where you build a working AI Lead Management System, package it as a service, and run real outreach. Two private 1-on-1 calls with Zain, personal review of your agent build, six vertical prompt libraries, sales scripts, proposal templates, and 3 months of community access included. $159/month from month 4 to continue — cancel anytime.",
  },
  {
    question: "How do the 1:1 sessions with the founders work?",
    answer:
      "Private 60-minute sessions — you book directly with Ahmed or Zain. Ahmed covers business strategy, pricing, client acquisition, and GCC market positioning. Zain covers AI system building, agency operations, and tech stack decisions. These aren't coaching calls — they're working sessions where we dig into your specific situation.",
  },
  {
    question: "How realistic is landing a client in 90 days?",
    answer:
      "Very — if you show up to the classes and do the outreach. Members who follow the program build a working demo in week one, start sending it to prospects in week two, and typically have their first discovery call by week three. The system works because you're selling something businesses already understand the value of — better lead management.",
  },
  {
    question: "Is this online or in person?",
    answer:
      "All live classes are online — join from anywhere in the world. We also run regular in-person build nights in Dubai for the GCC community. Paid members always get first access to in-person sessions.",
  },
  {
    question: "Can I cancel the paid membership anytime?",
    answer:
      "Yes — cancel anytime, no questions asked. There's also a 7-day money-back guarantee if you join and feel it's not the right fit. No lock-ins, no annual commitments.",
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
              <SectionTag index="06" label="Got questions?" />
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
