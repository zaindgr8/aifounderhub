import React from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Reveal, SectionTag, scrollToRegister } from "./shared";

interface Workshop {
  title: string;
  desc: string;
  flagship?: boolean;
}

const WORKSHOPS: Workshop[] = [
  {
    title: "Claude MasterClass",
    desc: "Master advanced Claude techniques used by top AI builders — prompt engineering, artifacts, MCPs, custom skills, multi-agent workflows, and full automation systems. Learn to build tools, generate presentations, and deploy real production apps.",
  },
  {
    title: "OpenClaw BluePrint",
    desc: "Build and deploy your own personal AI agent from scratch — live. Master OpenClaw's full stack: secure installation, workflow automation, multi-step agent chains, API integrations, and real-world use cases that run 24/7 without you.",
  },
  {
    title: "Build Apps Using AI",
    desc: "Most people watch AI demos. You'll ship one. A fully working app — UI, database, payments, live URL — built from zero. Your first production ready application starts here.",
  },
  {
    title: "UGC & AI Content Creation",
    desc: "Master Sora, Veo 3, Seedance and the full AI creator stack to produce studio-grade UGC, ads, Reels, and social content — at scale. Learn using the exact tools top AI creators are quietly running ahead with.",
  },
  {
    title: "BUILD WITH CODEX",
    desc: "OpenAI Codex is the most powerful AI coding agent available right now — and most founders have no idea how to use it beyond copy-paste. Learn to assign full coding tasks, run parallel agents, connect it to your GitHub, and ship real features.",
  },
  {
    title: "AI VOICE & CHAT AGENTS",
    desc: "Build AI agents that call, chat, and convert on autopilot. Voice assistants, chatbot flows, CRM integrations, and lead qualification — all deployed live. Your 24/7 AI representative, built and running by the end of the session.",
  },
];

export function Workshops() {
  return (
    <section id="workshops" className="relative overflow-hidden py-16 sm:py-20 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />
      <div
        className="pointer-events-none absolute left-[-15%] top-[20%] h-[50vh] w-[40vw] rounded-full blur-[140px]"
        style={{ background: "rgba(204,242,68,0.07)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <SectionTag index="01" label="Free workshops" />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/20 bg-volt/5 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-volt/90">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-volt opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-volt"></span>
                  </span>
                  Limited Slots | For Limited Time
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                A free masterclass,
                <br />
                <span className="font-serif italic font-normal normal-case text-volt">every single week.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400">
                Watch Industry Experts Build Real AI Products Live. 100% Free, No Credit Card Required. One Signup Automatically Unlocks Calendar Invites for Every Upcoming Masterclass.
              </p>
            </Reveal>
          </div>
          {/* <Reveal delay={0.2}>
            <div className="flex items-center gap-2.5 rounded-full border border-edge bg-panel px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <Mail className="h-3.5 w-3.5 text-volt" />
              One signup = invites to all
            </div>
          </Reveal> */}
        </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {WORKSHOPS.map((w, i) => (
                <Reveal key={w.title} delay={Math.min(i * 0.06, 0.3)}>
                  <div
                    className={`group flex h-full flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${w.flagship
                        ? "border-volt/40 bg-gradient-to-br from-volt/[0.08] to-panel hover:border-volt/70"
                        : "border-edge bg-panel/70 hover:border-zinc-700 hover:bg-panel hover:-translate-y-1"
                      }`}
                  >
                    <div>
                      <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                        {w.title}
                      </h3>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">{w.desc}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-end border-t border-white/5 pt-4">
                      <button
                        onClick={scrollToRegister}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-[11px] font-extrabold uppercase tracking-wide transition-all duration-300 active:scale-95 cursor-pointer ${w.flagship
                            ? "bg-volt text-void hover:shadow-[0_0_24px_rgba(204,242,68,0.4)]"
                            : "border border-edge bg-void text-zinc-200 hover:border-volt/40 hover:text-volt"
                          }`}
                      >
                        Get Access
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* <Reveal delay={0.2}>
              <p className="mt-8 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
                New workshops drop monthly · Vibe Coding 101, Micro-SaaS Money, AI Agents for Sales & more
              </p>
              <p className="mt-2 text-center text-[12px] font-semibold text-zinc-500">
                Can't make it live? Every replay lands in the{" "}
                <button
                  onClick={() => document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" })}
                  className="font-bold text-volt underline decoration-volt/40 underline-offset-2 transition-colors hover:text-white cursor-pointer"
                >
                  Courses Membership
                </button>{" "}
                the moment it ends.
              </p>
            </Reveal> */}
          </div>
        </section>
        );
}
