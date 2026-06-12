import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Send, Check, Sparkles, ExternalLink, MessageSquare } from "lucide-react";
import { Reveal, SectionTag } from "./shared";

interface TestimonialMessage {
  id: string;
  name: string;
  avatar: string;
  bgClass: string;
  time: string;
  message: string;
  hearts?: number;
  replies?: TestimonialMessage[];
  link?: string;
  tag?: string;
}

const initialTestimonials: TestimonialMessage[] = [
  {
    id: "t1",
    name: "V",
    avatar: "V",
    bgClass: "bg-volt text-void",
    time: "8:25 PM",
    message: "I agree Natasha. In the very near future, a millionaire will be every 4 persons you know.",
    hearts: 2,
    replies: [
      {
        id: "t1_r1",
        name: "Natasha Williams",
        avatar: "NW",
        bgClass: "bg-pink-500 text-white",
        time: "8:26 PM",
        message: "Let's gooo V! We missed the internet revolution so we can't miss the AI revolution. This is our time!",
      },
    ],
  },
  {
    id: "t13",
    name: "Gary Banks",
    avatar: "GB",
    bgClass: "bg-indigo-500 text-white",
    time: "3:03 PM",
    tag: "Shipped",
    message:
      "Shoutout to the entire team. The last summit was a real turning point for us. What we gained wasn't just information. It was clarity, structure, and the confidence to execute.\n\nBecause of that experience, we officially launched Grantswipe.com 🔥",
    hearts: 8,
  },
  {
    id: "t12",
    name: "Allan Pettit",
    avatar: "AP",
    bgClass: "bg-amber-500 text-void",
    time: "2:38 PM",
    link: "legacyblueprintnow.com",
    message:
      "This summit is like drinking from a fire hose in the best possible way… a buffet that stretches 10 city blocks. I LOVE IT!! More.. more.. more…",
  },
  {
    id: "t6",
    name: "Lynn Fournier",
    avatar: "LF",
    bgClass: "bg-sky-500 text-void",
    time: "1:07 PM",
    message:
      "Thank you for all the time you dedicated to us over the last two days. My excitement level is soaring and I have so many ideas of what I can do! An amazing experience.",
  },
  {
    id: "t18",
    name: "Helen Igomu Kussiy",
    avatar: "HK",
    bgClass: "bg-stone-500 text-white",
    time: "4:12 PM",
    message:
      "I've attended many summits over the years. Usually I'm quietly thinking, please just get to it already.\n\nBut this was different. Every word felt intentional, layered, and necessary. It didn't feel like filler. It felt like foundation.",
  },
  {
    id: "t19",
    name: "Tracy Brock-Islam",
    avatar: "TB",
    bgClass: "bg-rose-500 text-white",
    time: "9:44 PM",
    message:
      "I signed up at midnight and went in today. The resources are wild. I already feel like I'm winning. This portal is phenomenal ❤️",
  },
  {
    id: "t15",
    name: "Cherry Fortenberry",
    avatar: "CF",
    bgClass: "bg-emerald-500 text-void",
    time: "12:40 PM",
    message: "Honestly it's PRICELESS! Having a new-found family and the APP.",
  },
];

export function Testimonials() {
  const [comments, setComments] = useState<TestimonialMessage[]>(initialTestimonials);
  const [userName, setUserName] = useState("");
  const [userMsg, setUserMsg] = useState("");
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userMsg.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setComments((prev) => [
        {
          id: `user_${Date.now()}`,
          name: userName.trim(),
          avatar: userName.trim().substring(0, 2).toUpperCase(),
          bgClass: "bg-volt text-void",
          time: "Just now",
          message: userMsg.trim(),
          hearts: 1,
        },
        ...prev,
      ]);
      setUserName("");
      setUserMsg("");
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  const toggleHeart = (id: string, current = 0) => {
    const liked = likedIds.includes(id);
    setLikedIds((prev) => (liked ? prev.filter((i) => i !== id) : [...prev, id]));
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hearts: Math.max(0, current + (liked ? -1 : 1)) } : c))
    );
  };

  return (
    <section id="receipts" className="relative overflow-hidden py-16 sm:py-20 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />
      <div
        className="pointer-events-none absolute right-[-15%] top-[15%] h-[50vh] w-[40vw] rounded-full blur-[140px]"
        style={{ background: "rgba(204,242,68,0.06)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-10">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <SectionTag index="06" label="Proof, not promises" />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                Wall of <span className="font-serif italic font-normal normal-case text-volt">receipts.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <div className="flex items-center gap-2.5 rounded-full border border-edge bg-panel px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <MessageSquare className="h-3.5 w-3.5 text-volt" />
              Live chat feed · {comments.length} entries
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* add-your-own panel */}
          <Reveal className="lg:row-span-1">
            <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-dashed border-volt/30 bg-panel/80 p-5 transition-colors hover:border-volt/60">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-volt/10 p-1.5 text-volt">
                    <Sparkles className="animate-spin-slow h-4 w-4" />
                  </span>
                  <span className="font-display text-xs font-extrabold uppercase tracking-wider text-white">
                    Drop a live comment
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-zinc-500">
                  Try the live board. Your message appends to the top of the stream instantly.
                </p>
                <form onSubmit={handleAddComment} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Your name…"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={32}
                    className="w-full rounded-xl border border-edge bg-white/[0.04] px-3.5 py-2.5 text-xs font-bold text-white placeholder-zinc-500 outline-none transition-colors focus:border-volt/50"
                  />
                  <textarea
                    placeholder="Type your message…"
                    rows={3}
                    value={userMsg}
                    onChange={(e) => setUserMsg(e.target.value)}
                    maxLength={180}
                    className="w-full resize-none rounded-xl border border-edge bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-500 outline-none transition-colors focus:border-volt/50"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-2.5 font-mono text-[11px] font-black uppercase tracking-wider text-void transition-all hover:shadow-[0_0_24px_rgba(204,242,68,0.35)] active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      "Transmitting…"
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Send to the wall
                      </>
                    )}
                  </button>
                </form>
              </div>
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-xl border border-volt/25 bg-volt/10 p-2.5 text-[11px] font-bold text-volt"
                  >
                    <Check className="h-4 w-4 flex-shrink-0" />
                    Posted to the live wall!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* testimonial cards */}
          {comments.map((t, i) => {
            const isLiked = likedIds.includes(t.id);
            return (
              <Reveal key={t.id} delay={Math.min(i * 0.04, 0.3)}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-edge bg-panel/70 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-panel">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 select-none items-center justify-center rounded-full text-xs font-black ${t.bgClass}`}
                        >
                          {t.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-[13px] font-extrabold leading-none tracking-tight text-white">
                              {t.name}
                            </span>
                            {t.tag && (
                              <span className="rounded bg-volt/15 px-1.5 py-0.5 font-mono text-[8.5px] font-black uppercase text-volt">
                                {t.tag}
                              </span>
                            )}
                          </div>
                          <span className="mt-1 block font-mono text-[9.5px] leading-none text-zinc-500">{t.time}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleHeart(t.id, t.hearts)}
                        className={`flex items-center gap-1.5 rounded-lg border p-1.5 transition-all cursor-pointer ${
                          isLiked
                            ? "scale-105 border-rose-500/40 bg-rose-500/10 text-rose-400"
                            : "border-transparent bg-white/[0.04] text-zinc-500 hover:text-rose-400"
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-400" : ""}`} />
                        {t.hearts && t.hearts > 0 ? (
                          <span className="font-mono text-[10px] font-black">{t.hearts}</span>
                        ) : null}
                      </button>
                    </div>

                    <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-zinc-300">{t.message}</p>

                    {t.link && (
                      <a
                        href={`https://${t.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded bg-lilac/10 px-2 py-1 font-mono text-[10px] font-extrabold text-lilac hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t.link}
                      </a>
                    )}
                  </div>

                  {t.replies?.map((reply) => (
                    <div key={reply.id} className="mt-4 space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-black ${reply.bgClass}`}
                          >
                            {reply.avatar}
                          </div>
                          <span className="font-display text-xs font-extrabold tracking-tight text-white">
                            {reply.name}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] font-bold text-zinc-500">{reply.time}</span>
                      </div>
                      <p className="pl-1 text-xs font-medium leading-normal text-zinc-400">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
