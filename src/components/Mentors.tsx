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
  Instagram,
  Youtube,
  Linkedin,
  Globe,
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
    role: "COFOUNDER · STRATEGIST · AUTHOR",
    avatarClass: "from-volt to-emerald-400 text-void",
    bio: "Omani entrepreneur, strategist, and published author. Named in GCC Top 20 Entrepreneur. Featured on Gulf News, Times of Oman, Oman TV, and Smashi TV Dubai. Ahmed doesn't teach motivation — he builds systems. Born deaf, he developed a rare ability to see patterns, structure, and architecture where others see chaos. In this session you will be able to learn the exact architecture behind businesses that grow without burning out.",
    topics: ["GCC Top 20 Entrepreneur", "Published Author", "Scaling & operations", "Sales and First Client"],
    icon: LineChart,
    socials: [
      { platform: "linkedin", url: "https://www.linkedin.com/in/ahmedyahyak/?skipRedirect=true", icon: Linkedin },
      { platform: "website", url: "https://www.ahmedyahyak.com/", icon: Globe },
    ],
  },
  {
    name: "Zain",
    slug: "zain",
    fullName: "Zain Ul Abaideen",
    initials: "ZA",
    role: "Founder & CEO · AI FOUNDER HUB | DEVMATE SOLUTIONS",
    avatarClass: "from-lilac to-sky-400 text-void",
    bio: "Running an AI-powered software agency operating across UAE, Oman, and the USA— with clients spanning GCC, Europe, and the United States. Has worked with 40+ global brands & 25+ industries Since 2019. He doesn't just teach — he builds daily. Whether you want to launch a Micro-SaaS, build an AI Automation Agency, grow a startup from scratch, or explore B2B collaboration — one session can give you a real roadmap, not theory.",
    topics: ["Micro-SaaS Building", "AI Automation Agency", "B2B Collaboration", "Startup Launch & Growth"],
    icon: BrainCircuit,
    socials: [
      { platform: "instagram", url: "https://www.instagram.com/zainulabideen.unicorn/", icon: Instagram },
      { platform: "youtube", url: "https://www.youtube.com/@zainulabideen.unicorn", icon: Youtube },
      { platform: "linkedin", url: "https://www.linkedin.com/in/zainulabideenunicorn/", icon: Linkedin },
      { platform: "website", url: "https://devmatesolutions.com/", icon: Globe },
    ],
  },
];

const MEMBERSHIP_INCLUDES = [
  "Claude, Codex & latest AI models — the exact stack top builders are shipping with right now",
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
            <SectionTag index="03" label="Mentorship & advisory" />
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
              Book session with our active founders — not retired educators, not hired instructors. They are running live agencies, shipping real products, and working with clients across GCC, Europe, and the USA right now. 
              What they teach on Monday, they tested on Friday — no filler, no theory, just founders who've done exactly what you're trying to do.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
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
                      {a.socials && (
                        <div className="mt-2.5 flex items-center gap-2">
                          {a.socials.map((s) => {
                            const Icon = s.icon;
                            return (
                              <a
                                key={s.platform}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-void/40 p-1 text-zinc-400 hover:text-volt border border-edge/30 transition-all duration-200"
                                title={s.platform}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </a>
                            );
                          })}
                        </div>
                      )}
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
                    BOOK 1:1 WITH {a.name}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </a>
                  {/* <p className="mt-2.5 text-center font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                    We arrange every 1:1 personally and send payment details by email.
                  </p> */}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dubai in-person strip */}
        {/* <Reveal delay={0.2}>
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
        </Reveal> */}
      </div>
    </section>
  );
}
