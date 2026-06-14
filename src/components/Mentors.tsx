import React from "react";
import {
  ArrowRight,
  Check,
  MessageCircle,
  CalendarClock,
  MapPin,
  BrainCircuit,
  LineChart,
  Sparkles,
} from "lucide-react";
import { Reveal, SectionTag, scrollToRegister } from "./shared";

// Manual booking for now: 1:1 requests go to this inbox and are arranged by hand.
// Change this to your real booking email.
const BOOKING_EMAIL = "hello@aifounderhub.com";

const ADVISORS = [
  {
    name: "Ahmed",
    slug: "ahmed",
    fullName: "Ahmed Al Kindi",
    initials: "AH",
    role: "Cofounder · Growth & Systems",
    avatarClass: "from-volt to-emerald-400 text-void",
    bio: "Founder of TSB Labs, cofounder of Devmate Solutions, and author of The System Builder. A GCC Top 20 Entrepreneur, Ahmed turns founder chaos into structure: offers, pricing, sales, and the path to first clients.",
    topics: ["Offer & pricing strategy", "Sales and first clients", "Scaling & operations", "Dubai market entry"],
    icon: LineChart,
  },
  {
    name: "Zain",
    slug: "zain",
    fullName: "Zain Ul Abaideen",
    initials: "ZA",
    role: "Cofounder & CTO",
    avatarClass: "from-lilac to-sky-400 text-void",
    bio: "Cofounder and CTO of Devmate Solutions, specialising in AI infrastructure and platform engineering. Zain reviews your actual build (prompts, code, architecture) and unblocks in one session what forums can't in a month.",
    topics: ["AI app architecture", "Agent & automation stacks", "Code & prompt reviews", "Tool selection & cost control"],
    icon: BrainCircuit,
  },
];

const MEMBERSHIP_INCLUDES = [
  "Full course library: Claude, OpenClaw, app building, automations",
  "A new deep-dive course drop every month",
  "Replay vault of every masterclass and summit",
  "Template, prompt and workbook vault",
  "Members-only community channels",
  "Cancel anytime, keep what you built",
];

export function Mentors() {
  return (
    <section id="mentors" className="relative overflow-hidden border-t border-edge bg-panel/30 py-16 sm:py-20 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        {/* heading */}
        <div className="mb-12">
          <Reveal>
            <SectionTag index="05" label="Mentorship & advisory" />
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
              Learn from builders,
              <br />
              <span className="font-serif italic font-normal normal-case text-lilac">not lecturers.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.13}>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400">
              Your founders, Ahmed and Zain, personally lead every bootcamp, 1:1 session, and in-person Dubai
              workshop. The course library is taught by invited industry experts.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* advisor cards */}
          {ADVISORS.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.08}>
              <div className="flex h-full flex-col justify-between rounded-3xl border border-edge bg-panel/70 p-7 transition-all duration-300 hover:border-zinc-700">
                <div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-xl font-extrabold ${a.avatarClass}`}
                    >
                      {a.initials}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                        {a.fullName}
                      </h3>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
                        <a.icon className="h-3.5 w-3.5" />
                        {a.role}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 text-[13px] leading-relaxed text-zinc-400">{a.bio}</p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {a.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-edge bg-void/70 px-2 py-1 font-mono text-[9.5px] font-bold text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between rounded-xl border border-edge bg-void/60 px-4 py-2.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Private 1:1 session · 60 min
                    </span>
                    <span className="font-display text-lg font-extrabold text-volt">
                      $299<span className="font-mono text-[10px] font-bold text-zinc-400">/hr</span>
                    </span>
                  </div>
                  <a
                    href={`mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(`1:1 session request with ${a.fullName}`)}&body=${encodeURIComponent(`Hi,\n\nI'd like to book a private 1:1 session with ${a.fullName} ($299/hr).\n\nMy name:\nBest times for me:\nWhat I want to cover:\n\nThanks!`)}`}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl border border-edge bg-void py-3.5 font-display text-[12px] font-extrabold uppercase tracking-wide text-zinc-200 transition-all duration-300 hover:border-volt/40 hover:text-volt active:scale-[0.98] cursor-pointer"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Request a session with {a.name}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </a>
                  <p className="mt-2.5 text-center font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                    We arrange every 1:1 personally and send payment details by email.
                  </p>
                </div>
              </div>
            </Reveal>
          ))}

          {/* courses membership card */}
          <Reveal delay={0.16}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-volt/35 bg-gradient-to-br from-volt/[0.08] to-panel p-7">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-volt/10 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-volt/15 px-3 py-1 font-mono text-[9px] font-extrabold uppercase tracking-wider text-volt border border-volt/30">
                  <Sparkles className="h-3 w-3" /> Best value
                </span>
                <h3 className="mt-4 font-display text-xl font-extrabold uppercase tracking-tight text-white">
                  Courses Membership
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold text-volt">$49.99</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    / month · all-access
                  </span>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-zinc-400">
                  Every course, every replay, every template. One subscription that keeps growing while you do.
                </p>

                <ul className="mt-5 space-y-2.5">
                  {MEMBERSHIP_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[12.5px] font-semibold text-zinc-300">
                      <span className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={scrollToRegister}
                className="group relative mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-4 font-display text-[13px] font-extrabold uppercase tracking-wide text-void transition-all duration-300 hover:shadow-[0_0_40px_rgba(204,242,68,0.4)] active:scale-[0.98] cursor-pointer"
              >
                Start membership · $49.99/mo
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <p className="mt-2.5 text-center font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                Starts with your free account. Upgrade in one click from your welcome email.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Dubai in-person strip */}
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-lilac/25 bg-gradient-to-r from-lilac/[0.08] via-panel to-panel p-7 sm:p-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-lilac/15 text-lilac">
                <MapPin className="h-5.5 w-5.5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
                  Dubai, in person 🇦🇪
                </h3>
                <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-zinc-400">
                  We're virtual-first but Dubai-rooted. Build nights and hands-on intensives, delivered by the
                  founders and invited guest experts, run regularly across the city. Members get first access to
                  every seat.
                </p>
              </div>
            </div>
            <button
              onClick={scrollToRegister}
              className="group flex flex-shrink-0 items-center gap-2 rounded-full border border-lilac/35 bg-lilac/10 px-6 py-3 font-display text-[12px] font-extrabold uppercase tracking-wide text-lilac transition-all duration-300 hover:bg-lilac/20 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              Get Dubai event alerts
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
