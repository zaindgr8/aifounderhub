import React from "react";
import { motion } from "motion/react";
import { Code2, Megaphone, Users } from "lucide-react";
import { Reveal, SectionTag } from "./shared";

/* ————————————————— team data ————————————————— */

const TEAM = [
  {
    name: "Irfan",
    role: "AI Developer",
    photo: "/irfan.jpg",
    initials: "IF",
    icon: Code2,
    tag: "Builds the Stack",
    description:
      "Architects and ships the AI-powered features you use daily — from prompt engineering to full-stack deployment.",
    gradientFrom: "from-volt/10",
    ringColor: "ring-volt/30",
    tagBg: "bg-volt/10 text-volt border-volt/20",
    iconColor: "text-volt",
  },
  {
    name: "Joshua",
    role: "Marketing Executive",
    photo: "/joshua.jpg",
    initials: "JO",
    icon: Megaphone,
    tag: "Grows the Brand",
    description:
      "Drives awareness and community growth — turning ideas into campaigns that reach builders across the GCC and beyond.",
    gradientFrom: "from-orange-400/10",
    ringColor: "ring-orange-400/30",
    tagBg: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    iconColor: "text-orange-400",
  },
  {
    name: "Dareen",
    role: "Community Manager",
    photo: "/dareen.jpg",
    initials: "DA",
    icon: Users,
    tag: "Connects the People",
    description:
      "Keeps the AI Founder Hub community thriving — organising events, supporting members, and making sure no builder is left behind.",
    gradientFrom: "from-purple-400/10",
    ringColor: "ring-purple-400/30",
    tagBg: "bg-purple-400/10 text-purple-300 border-purple-400/20",
    iconColor: "text-purple-300",
  },
];

/* ————————————————— component ————————————————— */

export function Team() {
  return (
    <section
      id="team"
      className="relative overflow-hidden border-t border-edge py-16 sm:py-20 scroll-mt-20"
      aria-label="Meet the team"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30" />
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-[50vw] rounded-full blur-[130px]"
        style={{ background: "rgba(204,242,68,0.05)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        {/* Heading */}
        <div className="mb-14 text-center">
          <Reveal>
            <div className="flex justify-center">
              <SectionTag index="02" label="Meet The Team" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
              The people{" "}
              <span className="font-serif italic font-normal normal-case text-volt">
                behind the hub.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.13}>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-400">
              A small, focused team — each person obsessed with their craft and
              committed to helping AI builders win.
            </p>
          </Reveal>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TEAM.map((member, i) => {
            const Icon = member.icon;
            return (
              <Reveal key={member.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="group relative flex flex-col rounded-3xl border border-edge bg-panel/70 p-6 transition-colors duration-300 hover:border-white/10 overflow-hidden"
                >
                  {/* Subtle gradient wash on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${member.gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Photo */}
                  <div className="relative mb-5 flex justify-center">
                    <div className={`relative h-24 w-24 rounded-2xl ring-2 ${member.ringColor} overflow-hidden shadow-lg transition-all duration-300 group-hover:ring-4`}>
                      <img
                        src={member.photo}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                    {/* Role icon badge */}
                    <span
                      className={`absolute -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-panel shadow-md ${member.iconColor}`}
                      style={{ left: "calc(50% + 28px)" }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Name + role */}
                  <div className="relative text-center">
                    <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                      {member.name}
                    </h3>
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider ${member.tagBg}`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                      {member.role}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="relative mt-4 text-center text-[13px] leading-relaxed text-zinc-400">
                    {member.description}
                  </p>

                  {/* Bottom tag */}
                  <div className="relative mt-5 flex justify-center">
                    <span className={`rounded-md border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${member.tagBg}`}>
                      {member.tag}
                    </span>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
