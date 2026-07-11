import React, { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  BrainCircuit,
  LineChart,
  Instagram,
  Youtube,
  Linkedin,
  Globe,
  Zap,
  Clock,
  Star,
} from "lucide-react";
import { Reveal, SectionTag } from "./shared";
import { SessionBookingModal, type SessionAdvisor } from "./SessionBookingModal";

const ADVISORS: (SessionAdvisor & {
  bio: string;
  topics: string[];
  icon: React.ElementType;
  socials: { platform: string; url: string; icon: React.ElementType }[];
  sessionMin: string;
})[] = [
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
    sessionMin: "60 min",
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
    sessionMin: "40 min",
    socials: [
      { platform: "instagram", url: "https://www.instagram.com/zainulabideen.unicorn/", icon: Instagram },
      { platform: "youtube", url: "https://www.youtube.com/@zainulabideen.unicorn", icon: Youtube },
      { platform: "linkedin", url: "https://www.linkedin.com/in/zainulabideenunicorn/", icon: Linkedin },
      { platform: "website", url: "https://devmatesolutions.com/", icon: Globe },
    ],
  },
];

export function Mentors() {
  const [activeAdvisor, setActiveAdvisor] = useState<SessionAdvisor | null>(null);

  return (
    <>
      <section id="mentors" className="relative overflow-hidden border-t border-edge bg-panel/30 py-16 sm:py-20 scroll-mt-20">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
        <div
          className="pointer-events-none absolute right-[-10%] top-[30%] h-[40vh] w-[35vw] rounded-full blur-[130px]"
          style={{ background: "rgba(181,161,255,0.06)" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
          {/* Heading */}
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
                Book a session with our active founders — not retired educators, not hired instructors. They are
                running live agencies, shipping real products, and working with clients across GCC, Europe, and the
                USA right now. What they teach on Monday, they tested on Friday.
              </p>
            </Reveal>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
            {ADVISORS.map((a, i) => (
              <Reveal key={a.name} delay={i * 0.08}>
                <div className="group flex h-full flex-col justify-between rounded-3xl border border-edge bg-panel/70 p-7 transition-all duration-300 hover:border-lilac/30 hover:-translate-y-1">
                  <div>
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-xl font-extrabold shadow-lg ${a.avatarClass}`}>
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
                                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                                  className="rounded bg-void/40 p-1 text-zinc-400 hover:text-volt border border-edge/30 transition-all duration-200"
                                  title={s.platform}>
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
                        <span key={t} className="rounded-md border border-edge bg-void/70 px-2 py-1 font-mono text-[9.5px] font-bold text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <div className="mt-7">
                    {/* Price strip */}
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-lilac/15 bg-gradient-to-r from-lilac/[0.06] to-transparent px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-lilac" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Private 1:1 · {a.sessionMin}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-display text-2xl font-extrabold text-volt">$299</span>
                        <span className="font-mono text-[10px] font-bold text-zinc-500">/session</span>
                      </div>
                    </div>

                    {/* 3 micro trust bullets */}
                    <div className="mb-4 grid grid-cols-3 gap-1.5">
                      {[
                        { icon: Star,          text: "Expert 1:1" },
                        { icon: CalendarClock, text: "Flexible" },
                        { icon: Zap,           text: "Instant Access" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center justify-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] py-1.5">
                          <Icon className="h-3 w-3 text-lilac" />
                          <span className="font-mono text-[8.5px] font-bold uppercase tracking-wide text-zinc-600">{text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Main CTA button — volt green, full width */}
                    <button
                      onClick={() => setActiveAdvisor(a)}
                      id={`session-cta-btn-${a.slug}`}
                      className="group/btn relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt px-6 py-4 font-display text-[13px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_32px_rgba(204,242,68,0.25)] transition-all duration-300 hover:shadow-[0_0_52px_rgba(204,242,68,0.5)] active:scale-95 cursor-pointer"
                    >
                      <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/25 [transform:skewX(-25deg)] transition-transform duration-700 group-hover/btn:translate-x-[250%]" />
                      <CalendarClock className="relative h-4 w-4 transition-transform group-hover/btn:scale-110" />
                      <span className="relative">Book 1:1 with {a.name} — $299</span>
                      <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SessionBookingModal
        advisor={activeAdvisor}
        onClose={() => setActiveAdvisor(null)}
      />
    </>
  );
}
