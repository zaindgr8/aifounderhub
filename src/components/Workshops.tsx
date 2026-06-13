import React from "react";
import { ArrowRight, MapPin, Monitor, Star, Mail } from "lucide-react";
import { Reveal, SectionTag, scrollToRegister } from "./shared";

interface Workshop {
  date: string;
  month: string;
  title: string;
  desc: string;
  mode: "virtual" | "dubai";
  level: string;
  time: string;
  flagship?: boolean;
}

const WORKSHOPS: Workshop[] = [
  {
    date: "26",
    month: "JUN",
    title: "Claude MasterClass",
    desc: "Prompt-to-product with Claude: master the model behind the best AI builders. Structured prompting, artifacts, and shipping your first tool live.",
    mode: "virtual",
    level: "Beginner friendly",
    time: "7:00 PM GST",
  },
  {
    date: "03",
    month: "JUL",
    title: "OpenClaw MasterClass",
    desc: "Deploy your own personal AI agent that works while you sleep. Install, secure, and automate your first three real workflows with OpenClaw.",
    mode: "virtual",
    level: "Beginner friendly",
    time: "7:00 PM GST",
  },
  {
    date: "10",
    month: "JUL",
    title: "Build Apps Using AI",
    desc: "The zero-code live build: watch an idea become a deployed, working app in 90 minutes, then fork the workspace and build yours.",
    mode: "virtual",
    level: "No code needed",
    time: "7:00 PM GST",
  },
  {
    date: "17",
    month: "JUL",
    title: "The 3-Day Build Summit",
    desc: "Our flagship free event: three days, idea to launched app. The full curriculum is below. This is the one you don't miss.",
    mode: "virtual",
    level: "Flagship event",
    time: "Jul 17-19",
    flagship: true,
  },
  {
    date: "24",
    month: "JUL",
    title: "Dubai Build Night",
    desc: "In-person, in Dubai: bring your laptop and an idea, leave with a prototype. Network with the local builder community over karak.",
    mode: "dubai",
    level: "All levels",
    time: "6:30 PM GST",
  },
  {
    date: "31",
    month: "JUL",
    title: "AI Automations MasterClass",
    desc: "Connect LLMs to the tools you already use: build three plug-and-play business automations that save 10+ hours a week.",
    mode: "virtual",
    level: "Beginner friendly",
    time: "7:00 PM GST",
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
              <SectionTag index="02" label="Free workshops" />
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
                Live, hands-on, and genuinely free, led by a rotating roster of invited industry experts. The live
                room costs nothing, no card and no catch. Join the community once and your invite to every upcoming
                workshop lands in your inbox automatically.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="flex items-center gap-2.5 rounded-full border border-edge bg-panel px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <Mail className="h-3.5 w-3.5 text-volt" />
              One signup = invites to all
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WORKSHOPS.map((w, i) => (
            <Reveal key={w.title} delay={Math.min(i * 0.06, 0.3)}>
              <div
                className={`group flex h-full flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
                  w.flagship
                    ? "border-volt/40 bg-gradient-to-br from-volt/[0.08] to-panel hover:border-volt/70"
                    : "border-edge bg-panel/70 hover:border-zinc-700 hover:bg-panel hover:-translate-y-1"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border font-display leading-none ${
                        w.flagship ? "border-volt/50 bg-volt text-void" : "border-edge bg-void text-white"
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{w.month}</span>
                      <span className="text-xl font-extrabold">{w.date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-wider ${
                          w.mode === "dubai"
                            ? "bg-lilac/15 text-lilac border border-lilac/25"
                            : "bg-white/[0.05] text-zinc-400 border border-edge"
                        }`}
                      >
                        {w.mode === "dubai" ? (
                          <>
                            <MapPin className="h-3 w-3" /> Dubai · In person
                          </>
                        ) : (
                          <>
                            <Monitor className="h-3 w-3" /> Virtual · Live
                          </>
                        )}
                      </span>
                      {w.flagship && (
                        <span className="flex items-center gap-1 rounded-full bg-volt/15 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-wider text-volt border border-volt/30">
                          <Star className="h-3 w-3 fill-volt" /> Flagship
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                    {w.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">{w.desc}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {w.time} · {w.level}
                  </div>
                  <button
                    onClick={scrollToRegister}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 font-display text-[11px] font-extrabold uppercase tracking-wide transition-all duration-300 active:scale-95 cursor-pointer ${
                      w.flagship
                        ? "bg-volt text-void hover:shadow-[0_0_24px_rgba(204,242,68,0.4)]"
                        : "border border-edge bg-void text-zinc-200 hover:border-volt/40 hover:text-volt"
                    }`}
                  >
                    Free seat
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
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
        </Reveal>
      </div>
    </section>
  );
}
