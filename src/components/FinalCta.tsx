import React from "react";
import { ArrowRight } from "lucide-react";
import { EVENT, Magnetic, Reveal, scrollToRegister } from "./shared";

export function FinalCta() {
  const ghost = Array.from({ length: 8 }, () => "SHIP IT ▸ ");
  return (
    <section className="relative overflow-hidden border-t border-edge py-20 sm:py-28">
      {/* giant scrolling outline backdrop */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 opacity-70">
        <div className="marquee-track gap-8 whitespace-nowrap font-display text-[11vw] font-extrabold uppercase leading-none text-outline-volt">
          {[...ghost, ...ghost].map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </div>
        <div className="marquee-track marquee-reverse gap-8 whitespace-nowrap font-display text-[11vw] font-extrabold uppercase leading-none text-outline-volt opacity-50">
          {[...ghost, ...ghost].map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void via-void/40 to-void" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-volt">
            Final boarding call · {EVENT.shortRange}
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
            In 3 days you'll either have
            <br />
            <span className="font-serif italic font-normal normal-case text-volt">a working app</span>
            <br />
            or the same idea in your notes.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-zinc-400">
            The summit runs once, July 17 to 19, and one free signup covers everything: the summit, every weekly
            masterclass after it, and your pathway match. Register today and your workbook, prompt templates and
            calendar invite are in your inbox before Day 1.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Magnetic strength={0.2}>
              <button
                onClick={scrollToRegister}
                className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-volt px-10 py-5 font-display text-base font-extrabold uppercase tracking-wide text-void shadow-[0_0_60px_rgba(204,242,68,0.3)] transition-shadow duration-300 hover:shadow-[0_0_90px_rgba(204,242,68,0.55)] sm:text-lg cursor-pointer"
              >
                <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                <span className="relative">Join the 3-day summit, free</span>
                <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </Magnetic>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Free · No card · 2-minute signup
            </span>
            <button
              onClick={() => document.getElementById("membership")?.scrollIntoView({ behavior: "smooth" })}
              className="text-[12px] font-semibold text-zinc-500 transition-colors hover:text-volt cursor-pointer"
            >
              Rather start learning tonight? <span className="font-bold text-volt underline decoration-volt/40 underline-offset-2">Get the membership, $49.99/mo</span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
