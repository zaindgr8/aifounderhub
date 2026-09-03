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
    id: "t1",
    name: "Khalid Al Mansoori",
    avatar: "KM",
    bgClass: "bg-indigo-500 text-white",
    role: "AAA Founder · Dubai",
    message:
      "I came in with zero agency experience. After the AI Lead System session I had a working demo I could actually show clients. Closed my first deal at AED 7,500/month two weeks later.",
  },
  {
    id: "t2",
    name: "Priya Nair",
    avatar: "PN",
    bgClass: "bg-amber-500 text-void",
    role: "Freelancer → Agency Owner · India",
    message:
      "The AI Call Assistant masterclass was the one. I built the whole thing live during the session, deployed it the same night, and sent demos to 5 real estate agencies the next morning.",
  },
  {
    id: "t3",
    name: "Omar Rashid",
    avatar: "OR",
    bgClass: "bg-emerald-500 text-void",
    role: "Digital Marketer · Riyadh",
    message:
      "I've done a lot of online courses. This is the first one where I actually built something real during the class. The AI lead system we made is now running for a gym client.",
  },
  {
    id: "t4",
    name: "Sara Al Hashimi",
    avatar: "SA",
    bgClass: "bg-rose-500 text-white",
    role: "Business Owner · Abu Dhabi",
    message:
      "Wasn't sure if I could do this without a tech background. But the way they break it down — step by step, live — I had my AI lead capture system set up before the session ended.",
  },
  {
    id: "t5",
    name: "James Okafor",
    avatar: "JO",
    bgClass: "bg-sky-500 text-void",
    role: "AAA Agency · London",
    message:
      "The 1:1 session with Zain changed my pricing completely. I was charging too little. He helped me package the AI Lead System as a proper retainer offer and I doubled my rate.",
  },
  {
    id: "t6",
    name: "Fatima Zahra",
    avatar: "FZ",
    bgClass: "bg-violet-500 text-white",
    role: "Entrepreneur · Casablanca",
    message:
      "I joined the free masterclass just to see what it was about. Within 48 hours I enrolled in the full program. The content is real and the community is actually helpful — no fluff.",
  },
  {
    id: "t7",
    name: "Ravi Mehta",
    avatar: "RM",
    bgClass: "bg-orange-500 text-void",
    role: "Tech Consultant · Mumbai",
    message:
      "Built an AI lead qualification bot for a clinic in the paid class. They signed a 3-month retainer on the spot. I hadn't written a single line of code before this program.",
  },
  {
    id: "t8",
    name: "Aisha Kamara",
    avatar: "AK",
    bgClass: "bg-pink-500 text-white",
    role: "AI Agency Founder · Lagos",
    message:
      "The outbound session alone was worth the membership fee. I had 12 conversations booked in my first week using the scripts they gave us. Two of them converted.",
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
              <SectionTag index="05" label="From the community" />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                What builders{" "}
                <span className="font-serif italic font-normal normal-case text-volt">are saying.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-zinc-400">
                Real results from real members — people who built AI Lead Systems live and landed their first clients.
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

