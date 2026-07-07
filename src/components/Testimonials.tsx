import React from "react";
import { motion } from "motion/react";
import { ExternalLink, Quote, MessageSquare } from "lucide-react";
import { Reveal, SectionTag } from "./shared";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  bgClass: string;
  role?: string;
  message: string;
  link?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t13",
    name: "Gary Banks",
    avatar: "GB",
    bgClass: "bg-indigo-500 text-white",
    message:
      "Shoutout to the entire team. The last summit was a real turning point for us. What we gained wasn't just information. It was clarity, structure, and the confidence to execute.\n\nBecause of that experience, we officially launched Grantswipe.com 🔥",
  },
  {
    id: "t18",
    name: "Helen Igomu Kussiy",
    avatar: "HK",
    bgClass: "bg-stone-500 text-white",
    message:
      "I've attended many summits over the years. Usually I'm quietly thinking, please just get to it already.\n\nBut this was different. Every word felt intentional, layered, and necessary. It didn't feel like filler. It felt like foundation.",
  },
  {
    id: "t12",
    name: "Allan Pettit",
    avatar: "AP",
    bgClass: "bg-amber-500 text-void",
    // link: "legacyblueprintnow.com",
    message:
      "This summit is like drinking from a fire hose in the best possible way… a buffet that stretches 10 city blocks. I LOVE IT!! More.. more.. more…",
  },
  {
    id: "t6",
    name: "Lynn Fournier",
    avatar: "LF",
    bgClass: "bg-sky-500 text-void",
    message:
      "Thank you for all the time you dedicated to us over the last two days. My excitement level is soaring and I have so many ideas of what I can do! An amazing experience.",
  },
  {
    id: "t19",
    name: "Tracy Brock-Islam",
    avatar: "TB",
    bgClass: "bg-rose-500 text-white",
    message:
      "I signed up at midnight and went in today. The resources are wild. I already feel like I'm winning. This portal is phenomenal ❤️",
  },
  {
    id: "t1",
    name: "V",
    avatar: "V",
    bgClass: "bg-volt text-void",
    message: "In the very near future, a millionaire will be every 4 persons you know. And this is the room where it happens.",
  },
  {
    id: "t15",
    name: "Cherry Fortenberry",
    avatar: "CF",
    bgClass: "bg-emerald-500 text-void",
    message: "Honestly it's PRICELESS! Having a new-found family and the APP.",
  },
  {
    id: "t_natasha",
    name: "Natasha Williams",
    avatar: "NW",
    bgClass: "bg-pink-500 text-white",
    message: "Let's gooo! We missed the internet revolution so we can't miss the AI revolution. This is our time!",
  },
];

export function Testimonials() {
  return (
    <section id="receipts" className="relative overflow-hidden py-16 sm:py-20 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />
      <div
        className="pointer-events-none absolute right-[-15%] top-[15%] h-[50vh] w-[40vw] rounded-full blur-[140px]"
        style={{ background: "rgba(204,242,68,0.06)" }}
      />
      <div
        className="pointer-events-none absolute left-[-10%] bottom-[10%] h-[40vh] w-[35vw] rounded-full blur-[130px]"
        style={{ background: "rgba(181,161,255,0.07)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-10">
        {/* heading */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <SectionTag index="04" label="From the community" />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                What builders{" "}
                <span className="font-serif italic font-normal normal-case text-volt">are saying.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-zinc-400">
                Real words from real people — no scripts, no incentives, just builders who showed up and shipped.
              </p>
            </Reveal>
          </div>
          {/* <Reveal delay={0.15}>
            <div className="flex items-center gap-2.5 rounded-full border border-edge bg-panel px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <MessageSquare className="h-3.5 w-3.5 text-volt" />
              {TESTIMONIALS.length} verified testimonials
            </div>
          </Reveal> */}
        </div>

        {/* masonry testimonial grid */}
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} delay={Math.min(i * 0.05, 0.35)}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="mb-5 break-inside-avoid flex flex-col rounded-2xl border border-edge bg-panel/70 p-5 transition-all duration-300 hover:border-zinc-600 hover:bg-panel"
              >
                {/* quote accent */}
                <Quote className="mb-3 h-5 w-5 flex-shrink-0 text-volt/40" />

                <p className="flex-1 whitespace-pre-line text-[13px] font-medium leading-relaxed text-zinc-300">
                  {t.message}
                </p>

                {t.link && (
                  <a
                    href={`https://${t.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded bg-lilac/10 px-2 py-1 font-mono text-[10px] font-extrabold text-lilac hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t.link}
                  </a>
                )}

                {/* card footer */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 select-none items-center justify-center rounded-full text-[10px] font-black ${t.bgClass}`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-[12px] font-extrabold leading-none tracking-tight text-white">
                          {t.name}
                        </span>
                      </div>
                      {t.role && (
                        <span className="mt-0.5 block font-mono text-[9px] leading-none text-zinc-500">{t.role}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

