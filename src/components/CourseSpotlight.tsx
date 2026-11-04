import React from "react";
import { ArrowRight, Check, Play } from "lucide-react";
import { Magnetic, Reveal, SectionTag } from "./shared";

// Homepage spotlight for the AI Agency Master Course (/how-to-build-your-ai-agency).
// Replaces the AAA Accelerator <Membership /> block and keeps its #membership anchor.

const COURSE_URL = "/how-to-build-your-ai-agency";

const INCLUDES = [
  "Build a production AI voice agent on a real phone number",
  "Client portal with call recordings, intent & sentiment scoring",
  "Outreach engine and lead generation system, set up with us",
  "Pitch, pricing and help onboarding your first client",
  "30 days direct access to the founders + certificate",
];

const FACTS = [
  { v: "$35B", l: "AI voice agents market by 2033" },
  { v: "$0.07", l: "per minute to run an AI agent" },
  { v: "69%", l: "of missed calls never get a callback" },
];

export function CourseSpotlight() {
  return (
    <section
      id="membership"
      className="relative overflow-hidden border-y border-volt/25 scroll-mt-20"
      aria-label="AI Agency Master Course"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-volt/[0.07] via-void to-void" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
      <div
        className="pointer-events-none absolute -top-20 right-[10%] h-72 w-72 rounded-full blur-[120px]"
        style={{ background: "rgba(204,242,68,0.13)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 sm:py-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr]">
        {/* left: the offer */}
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <SectionTag index="02" label="Master Course" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-0.5 font-mono text-[9.5px] font-extrabold uppercase tracking-wider text-volt">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-volt" />
                </span>
                Accepting now · First 10 only
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mt-6 font-display text-[40px] font-extrabold uppercase leading-[0.92] tracking-tight text-white sm:text-6xl">
              How to Build
              <br />
              <span className="text-volt">Your AI Agency</span>
            </h2>
            <p className="mt-4 font-serif text-2xl italic text-zinc-300 sm:text-[28px]">
              Build and sell AI voice agents.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-zinc-400">
              Five live classes in one month. You build a real AI voice agent, set up your outreach, and learn the pitch that
              lands your first client. Taught by Zain Ul Abideen, founder of DevMate Solutions.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <ul className="mt-7 space-y-2.5">
              {INCLUDES.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14.5px] text-zinc-200">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-volt/15">
                    <Check className="h-3 w-3 text-volt" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic strength={0.2}>
                <a
                  href={COURSE_URL}
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-volt px-8 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_50px_rgba(204,242,68,0.35)] transition-shadow hover:shadow-[0_0_90px_rgba(204,242,68,0.6)] sm:w-auto"
                >
                  See the course <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Magnetic>
              <a
                href={`${COURSE_URL}#demos`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-edge px-7 py-4 font-display text-[14px] font-bold uppercase tracking-wide text-zinc-300 transition hover:border-volt/40 hover:text-white"
              >
                <Play className="h-4 w-4 text-volt" /> Hear a real AI call
              </a>
            </div>
            <p className="mt-4 font-mono text-[11px] text-zinc-500">
              Instead of <span className="line-through">8,000 AED</span>, it's{" "}
              <span className="font-bold text-volt">1,500 AED</span> for the first 10 students only · 158 OMR · $408
            </p>
          </Reveal>
        </div>

        {/* right: proof */}
        <Reveal delay={0.1}>
          <div className="grid items-end gap-4 sm:grid-cols-[220px_1fr]">
            <a
              href={`${COURSE_URL}#demos`}
              className="group relative mx-auto block w-full max-w-[240px] overflow-hidden rounded-3xl border border-edge bg-panel"
              aria-label="Watch a real AI call demo"
            >
              <img src="/demos/ai-call-property-lead.jpg" alt="AI voice agent qualifying a Dubai property lead" loading="lazy" className="aspect-[9/16] w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-void/20">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-volt text-void shadow-[0_0_30px_rgba(204,242,68,0.45)] transition-transform group-hover:scale-110">
                  <Play className="ml-0.5 h-5 w-5" />
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 to-transparent p-4 pt-10 font-display text-[13px] font-bold text-white">
                Real call · lead qualified &amp; booked
              </span>
            </a>
            <div className="space-y-3">
              {FACTS.map((f) => (
                <div key={f.l} className="rounded-2xl border border-edge bg-panel/60 p-5 backdrop-blur-md">
                  <p className="font-display text-4xl font-black text-volt">{f.v}</p>
                  <p className="mt-1 text-[13px] text-zinc-400">{f.l}</p>
                </div>
              ))}
              <p className="px-1 font-mono text-[10px] text-zinc-600">Sources listed on the course page.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
