import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Calendar, Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Wordmark } from "../components/shared";

/**
 * Lives at /thank-you.
 *
 * The hero form pushes this URL on success without a reload, so this page is
 * what a visitor sees if they refresh, bookmark it, or arrive from an email.
 * Keeping it a real route is what lets GA4 destination goals and Meta custom
 * conversions fire on a URL instead of an invisible state change.
 */
export function ThankYouPage() {
  return (
    <div className="relative min-h-screen bg-void font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-grid-dark opacity-30" />
      <div
        className="pointer-events-none fixed left-1/4 top-0 h-[55vh] w-[50vw] rounded-full blur-[170px]"
        style={{ background: "rgba(204,242,68,0.07)" }}
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-6 md:px-10">
        <a href="/" className="transition-opacity hover:opacity-80">
          <Wordmark />
        </a>
        <a
          href="/"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-[11px] font-bold text-zinc-300 transition hover:border-volt/40 hover:text-volt"
        >
          ← Home
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-8 md:px-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-volt/40 bg-volt/15">
            <Check className="h-7 w-7 text-volt" strokeWidth={3} />
          </div>

          <h1 className="mt-6 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
            You're in.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Your seat for the free live masterclass is confirmed. The session link and calendar invite are on their way
            to your inbox — if nothing arrives in ten minutes, check spam and add us to your contacts.
          </p>
        </motion.div>

        {/* what happens next */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {[
            { icon: MessageCircle, title: "Check your inbox", body: "Invite, WhatsApp group link, workbook and prompt templates." },
            { icon: Calendar, title: "Save the date", body: "Live every Saturday. Replays go out to everyone who registers." },
            { icon: Sparkles, title: "Come with a business", body: "Bring a real client or niche in mind — you'll build against it live." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-edge bg-panel/60 p-5">
              <s.icon className="h-5 w-5 text-volt" />
              <h2 className="mt-3 font-display text-[13px] font-extrabold uppercase tracking-wide text-white">
                {s.title}
              </h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">{s.body}</p>
            </div>
          ))}
        </motion.div>

        {/* the offer — highest-intent moment, so it leads */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-6 rounded-3xl border border-volt/30 bg-volt/[0.06] p-6 sm:p-8"
        >
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-volt">
            Don't want to wait for Saturday?
          </span>
          <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-3xl">
            Start tonight with the AAA Accelerator
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-zinc-300">
            Weekly live builds, every session replay, the sales scripts and proposal templates, the private builder
            community, and direct access to the founders on group calls. 90 days to your first $2,000 client.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="/#membership"
              className="group flex items-center justify-center gap-2 rounded-full bg-volt px-7 py-3.5 font-display text-[14px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_35px_rgba(204,242,68,0.3)] transition hover:shadow-[0_0_55px_rgba(204,242,68,0.5)] active:scale-95"
            >
              Get instant access · $159/mo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-volt" />
              Cancel anytime · 7-day money-back
            </span>
          </div>
        </motion.div>

        {/* free thing to do right now, so the wait isn't dead time */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="mt-4 flex flex-col gap-4 rounded-3xl border border-edge bg-panel/60 p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="font-display text-[15px] font-extrabold uppercase tracking-wide text-white">
              While you wait — free
            </h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-zinc-400">
              Master Claude in 7 Days. Two tracks: run your business on the Claude app with no code, or go deep on
              Claude Code. Start now, it costs nothing.
            </p>
          </div>
          <a
            href="/claude-master-in-7-days"
            className="shrink-0 rounded-full border border-lilac/40 bg-lilac/10 px-5 py-3 text-center font-display text-[12px] font-extrabold uppercase tracking-wider text-lilac transition hover:bg-lilac/20"
          >
            Open the guide
          </a>
        </motion.div>
      </main>
    </div>
  );
}
