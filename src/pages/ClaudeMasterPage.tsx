import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  Crown,
  Eye,
  Factory,
  FileCode,
  Flame,
  GitBranch,
  GraduationCap,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Wordmark } from "../components/shared";
import {
  AGENT_TEMPLATE,
  ANTIPATTERNS,
  COMMANDS,
  COST_LEVERS,
  type CodeBlock as CodeBlockType,
  DAY_ZERO,
  DAYS,
  EXAM,
  FLAGS,
  LADDER,
  MAX_XP,
  MYTHS,
  PROMPTS,
  RANKS,
  REPO_TREE,
  TICKET_TEMPLATE,
  type Callout,
  type Day,
} from "../data/claude7Days";

const STORE_KEY = "afh_claude7_progress";

/* ════════════════════════════════════════════════════════════════
   Small primitives
════════════════════════════════════════════════════════════════ */

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          },
          () => undefined,
        );
      }}
      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
        copied
          ? "border-volt/50 bg-volt/15 text-volt"
          : "border-white/10 bg-white/5 text-zinc-400 hover:border-volt/40 hover:text-volt"
      } ${className}`}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function CodeBlock({ block }: { block: CodeBlockType }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#08080e]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-white/[0.02] px-3.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Terminal className="h-3 w-3 shrink-0 text-volt/70" />
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {block.label || block.lang}
          </span>
        </div>
        <CopyButton text={block.code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3.5">
        <code className="font-mono text-[12px] leading-relaxed whitespace-pre text-zinc-300 sm:text-[12.5px]">
          {block.code}
        </code>
      </pre>
    </div>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="bg-white/[0.03]">
            {head.map((h) => (
              <th
                key={h}
                className="border-b border-white/10 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`border-b border-white/[0.06] px-4 py-3 text-[13px] leading-relaxed ${
                    j === 0 ? "font-mono text-[12px] font-semibold text-volt/90" : "text-zinc-400"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalloutBox({ callout }: { callout: Callout }) {
  const map = {
    edge: { icon: Lightbulb, ring: "border-volt/25 bg-volt/[0.05]", text: "text-volt", tag: "Operator's edge" },
    trap: { icon: AlertTriangle, ring: "border-orange-400/25 bg-orange-400/[0.05]", text: "text-orange-300", tag: "Trap" },
    myth: { icon: X, ring: "border-lilac/25 bg-lilac/[0.05]", text: "text-lilac", tag: "Myth" },
  } as const;
  const cfg = map[callout.kind];
  const Icon = cfg.icon;
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${cfg.ring}`}>
      <div className={`mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${cfg.text}`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{cfg.tag}</span>
      </div>
      <p className="text-[13px] font-bold text-zinc-100">{callout.title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{callout.body}</p>
    </div>
  );
}

function CheckRow({
  checked,
  onToggle,
  children,
  xp,
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  xp?: number;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        checked
          ? "border-volt/30 bg-volt/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          checked ? "border-volt bg-volt text-void" : "border-white/25 text-transparent group-hover:border-volt/50"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
      </span>
      <span className={`flex-1 text-[13px] leading-relaxed ${checked ? "text-zinc-300 line-through decoration-volt/40" : "text-zinc-300"}`}>
        {children}
      </span>
      {xp ? (
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
            checked ? "bg-volt/15 text-volt" : "bg-white/5 text-zinc-500"
          }`}
        >
          +{xp}
        </span>
      ) : null}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Myth deck — tap to reveal
════════════════════════════════════════════════════════════════ */

function MythCard({ stale, truth, i }: { stale: string; truth: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className={`flex h-full w-full flex-col rounded-2xl border p-4 text-left transition cursor-pointer ${
        open ? "border-volt/30 bg-volt/[0.05]" : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      <span className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-zinc-600">
        Stale advice {String(i + 1).padStart(2, "0")}
      </span>
      <span className="text-[13px] font-semibold leading-snug text-zinc-500 line-through decoration-red-500/50">
        {stale}
      </span>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.span
            key="truth"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="block overflow-hidden"
          >
            <span className="mt-3 block border-t border-volt/20 pt-3 text-[12.5px] leading-relaxed text-zinc-300">
              {truth}
            </span>
          </motion.span>
        ) : (
          <span className="mt-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-volt/70">
            <Eye className="h-3 w-3" /> Tap for what's actually true
          </span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Celebration overlay
════════════════════════════════════════════════════════════════ */

function Celebration({ payload, onClose }: { payload: { title: string; sub: string; kind: "badge" | "rank" }; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
    >
      {/* sparks */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-volt"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.4, 0.4],
            x: Math.cos((i / 14) * Math.PI * 2) * (120 + (i % 4) * 40),
            y: Math.sin((i / 14) * Math.PI * 2) * (120 + (i % 3) * 40),
          }}
          transition={{ duration: 1.4, delay: 0.1 + i * 0.03, ease: "easeOut" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.85, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative w-full max-w-sm rounded-3xl border border-volt/30 bg-[#0d0d16] p-8 text-center shadow-[0_0_90px_rgba(204,242,68,0.2)]"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-volt/40 bg-volt/10">
          {payload.kind === "rank" ? <Crown className="h-8 w-8 text-volt" /> : <Trophy className="h-8 w-8 text-volt" />}
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-volt">
          {payload.kind === "rank" ? "Rank up" : "Badge unlocked"}
        </p>
        <h3 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white">{payload.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{payload.sub}</p>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">Tap anywhere to continue</p>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Views
════════════════════════════════════════════════════════════════ */

type ViewKey = number | "cheatsheet" | "prompts" | "templates" | "antipatterns" | "exam" | "ladder";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-volt">{eyebrow}</p>
      <h2 className="mt-1.5 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">{title}</h2>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════ */

export function ClaudeMasterPage() {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [view, setView] = useState<ViewKey>(1);
  const [peeked, setPeeked] = useState<Record<number, boolean>>({});
  const [celebration, setCelebration] = useState<{ title: string; sub: string; kind: "badge" | "rank" } | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(done));
    } catch {
      /* ignore — private browsing */
    }
  }, [done]);

  /* ——— derived state ——— */
  const bossDefeated = useCallback(
    (day: Day) => day.boss.checks.every((_, i) => done[`b${day.id}_${i}`]),
    [done],
  );

  const day0Done = DAY_ZERO.checks.every((_, i) => done[`d0c${i}`]);

  const isUnlocked = useCallback(
    (dayId: number) => {
      if (dayId === 1) return day0Done;
      const prev = DAYS.find((d) => d.id === dayId - 1);
      return prev ? bossDefeated(prev) : false;
    },
    [day0Done, bossDefeated],
  );

  const xp = useMemo(() => {
    let total = 0;
    for (const day of DAYS) {
      for (const dr of day.drills) if (done[dr.id]) total += dr.xp;
      if (bossDefeated(day)) total += day.boss.xp;
      if (done[`s${day.id}`]) total += day.side.xp;
    }
    return total;
  }, [done, bossDefeated]);

  const rank = useMemo(() => [...RANKS].reverse().find((r) => xp >= r.min) || RANKS[0], [xp]);
  const nextRank = RANKS.find((r) => r.min > xp);
  const badgesEarned = DAYS.filter((d) => bossDefeated(d));
  const examScore = EXAM.filter((_, i) => done[`e${i}`]).length;

  /* ——— celebrate on rank-up / badge ——— */
  const prevRank = useRef(rank.lvl);
  const prevBadges = useRef(badgesEarned.length);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      prevRank.current = rank.lvl;
      prevBadges.current = badgesEarned.length;
      return;
    }
    if (badgesEarned.length > prevBadges.current) {
      const latest = badgesEarned[badgesEarned.length - 1];
      setCelebration({ kind: "badge", title: latest.badge.name, sub: latest.badge.desc });
    } else if (rank.lvl > prevRank.current) {
      setCelebration({ kind: "rank", title: rank.name, sub: `You crossed ${rank.min} XP. Level ${rank.lvl} of 7.` });
    }
    prevRank.current = rank.lvl;
    prevBadges.current = badgesEarned.length;
  }, [rank.lvl, badgesEarned.length]);

  const toggle = (key: string) => setDone((p) => ({ ...p, [key]: !p[key] }));

  const goto = (v: ViewKey) => {
    setView(v);
    requestAnimationFrame(() => gameRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const resetAll = () => {
    if (window.confirm("Reset all progress, XP and badges? This cannot be undone.")) {
      setDone({});
      setPeeked({});
      setView(1);
    }
  };

  const currentDay = DAYS.find((d) => !bossDefeated(d)) || DAYS[DAYS.length - 1];
  const xpPct = Math.min(100, Math.round((xp / MAX_XP) * 100));

  return (
    <div className="relative min-h-screen bg-[#07070c] font-sans text-zinc-100 selection:bg-volt selection:text-void">
      <div className="pointer-events-none fixed inset-0 bg-grid-dark opacity-30" />
      <div
        className="pointer-events-none fixed left-1/4 top-0 h-[60vh] w-[50vw] rounded-full blur-[180px]"
        style={{ background: "rgba(204,242,68,0.06)" }}
      />
      <div
        className="pointer-events-none fixed bottom-10 right-10 h-[50vh] w-[40vw] rounded-full blur-[160px]"
        style={{ background: "rgba(181,161,255,0.06)" }}
      />

      {/* ─────────── HUD ─────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <a href="/" className="shrink-0 transition-opacity hover:opacity-80">
              <Wordmark />
            </a>
            <span className="hidden h-4 w-px bg-white/15 lg:inline-block" />
            <div className="hidden items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt lg:flex">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              <span>7-Day Operator Protocol</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* XP + rank pill */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <Trophy className="h-3.5 w-3.5 shrink-0 text-volt" />
              <div className="leading-none">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-sm font-black text-white">{xp}</span>
                  <span className="font-mono text-[9px] text-zinc-500">/ {MAX_XP} XP</span>
                </div>
                <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-white/10 sm:w-28">
                  <motion.div
                    className="h-full rounded-full bg-volt"
                    animate={{ width: `${xpPct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-1.5 rounded-xl border border-lilac/25 bg-lilac/[0.08] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-lilac sm:flex">
              <Crown className="h-3.5 w-3.5" />
              <span>
                Lv{rank.lvl} {rank.name}
              </span>
            </div>

            <a
              href="/"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white md:block"
            >
              ← Home
            </a>
            <button
              onClick={resetAll}
              title="Reset all progress"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500 transition-colors hover:border-red-500/30 hover:text-red-400 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-8 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Free Operator Field Guide · Edition 2.0</span>
            </motion.div>

            <h1 className="mt-5 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
              Become a <span className="text-volt">Claude Code</span>
              <br />
              expert in 7 days
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-400">
              Most people use Claude Code at 10% of its power — they prompt a tool that is designed to be{" "}
              <span className="text-zinc-200">managed</span>. Seven daily missions turn it from a chatbot that writes
              broken code into a disciplined AI engineer that works inside your business.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => goto(day0Done ? currentDay.id : 0)}
                className="group flex items-center gap-2 rounded-full bg-volt px-6 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] transition hover:shadow-[0_0_45px_rgba(204,242,68,0.55)] active:scale-95 cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>{xp > 0 ? `Resume — Day ${currentDay.id}` : day0Done ? "Start Day 1" : "Start Boot Camp"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => goto("prompts")}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-zinc-200 transition hover:border-volt/40 hover:text-volt cursor-pointer"
              >
                <ScrollText className="h-4 w-4" />
                <span>Skip to the prompt vault</span>
              </button>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["7", "daily missions"],
                ["1,250", "XP to earn"],
                ["8", "ranks to climb"],
                ["40+", "copy-paste blocks"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
                  <div className="font-display text-xl font-black text-volt">{n}</div>
                  <div className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* rank ladder */}
          <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/80 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">The ranks</p>
              <span className="rounded-full bg-volt/10 px-2.5 py-1 font-mono text-[10px] font-bold text-volt">
                {nextRank ? `${nextRank.min - xp} XP to ${nextRank.name}` : "Maxed"}
              </span>
            </div>
            <div className="space-y-1.5">
              {RANKS.map((r) => {
                const reached = xp >= r.min;
                const current = r.lvl === rank.lvl;
                return (
                  <div
                    key={r.lvl}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                      current
                        ? "border-volt/40 bg-volt/10"
                        : reached
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-white/[0.06] bg-transparent"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-8 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold ${
                        reached ? "bg-volt/15 text-volt" : "bg-white/5 text-zinc-600"
                      }`}
                    >
                      LV{r.lvl}
                    </span>
                    <span className={`flex-1 text-[13px] font-semibold ${reached ? "text-white" : "text-zinc-600"}`}>
                      {r.name}
                      {r.note ? <span className="ml-2 font-mono text-[9.5px] font-normal text-zinc-600">{r.note}</span> : null}
                    </span>
                    <span className={`font-mono text-[10px] ${reached ? "text-zinc-400" : "text-zinc-700"}`}>{r.min}+</span>
                  </div>
                );
              })}
            </div>

            {badgesEarned.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Badges · {badgesEarned.length}/7
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {badgesEarned.map((d) => (
                    <span
                      key={d.id}
                      className="rounded-lg border border-volt/30 bg-volt/10 px-2.5 py-1 font-mono text-[10px] font-bold text-volt"
                    >
                      {d.badge.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── MYTH DECK ─────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <SectionHeading eyebrow="Credibility check" title="Nine things every other guide gets wrong" />
        <p className="mb-6 max-w-2xl text-[14px] leading-relaxed text-zinc-400">
          This tool changed enormously between 2025 and now. Most blog posts and videos you'll find are quietly out of
          date, and following them will make you look like an amateur. Start here.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MYTHS.map((m, i) => (
            <MythCard key={i} i={i} stale={m.stale} truth={m.truth} />
          ))}
        </div>
      </section>

      {/* ─────────── GAME ─────────── */}
      <div ref={gameRef} className="relative z-10 mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          {/* rail */}
          <nav className="lg:sticky lg:top-24">
            <p className="mb-2.5 px-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
              Mission map
            </p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {/* Day 0 */}
              <button
                onClick={() => setView(0)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition cursor-pointer lg:w-full ${
                  view === 0 ? "border-volt/40 bg-volt/10" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold ${
                    day0Done ? "bg-volt text-void" : "bg-white/8 text-zinc-500"
                  }`}
                >
                  {day0Done ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : "0"}
                </span>
                <span className="whitespace-nowrap text-[12.5px] font-semibold text-zinc-200 lg:whitespace-normal">
                  Boot Camp
                </span>
              </button>

              {DAYS.map((d) => {
                const unlocked = isUnlocked(d.id) || peeked[d.id];
                const beaten = bossDefeated(d);
                return (
                  <button
                    key={d.id}
                    onClick={() => setView(d.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition cursor-pointer lg:w-full ${
                      view === d.id
                        ? "border-volt/40 bg-volt/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold ${
                        beaten ? "bg-volt text-void" : unlocked ? "bg-white/10 text-zinc-300" : "bg-white/5 text-zinc-600"
                      }`}
                    >
                      {beaten ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : unlocked ? d.id : <Lock className="h-3 w-3" />}
                    </span>
                    <span className="flex-1 whitespace-nowrap text-[12.5px] font-semibold text-zinc-200 lg:whitespace-normal">
                      {d.title}
                    </span>
                  </button>
                );
              })}

              <div className="hidden h-px bg-white/10 lg:my-2 lg:block" />
              <p className="mb-1 hidden px-1 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 lg:block">
                Field kit
              </p>

              {(
                [
                  ["cheatsheet", "Cheat sheet", BookOpen],
                  ["prompts", "Prompt vault", ScrollText],
                  ["templates", "Template pack", FileCode],
                  ["antipatterns", "Fix-it table", AlertTriangle],
                  ["ladder", "Days 8–30", GitBranch],
                  ["exam", "Operator exam", GraduationCap],
                ] as [ViewKey, string, React.ElementType][]
              ).map(([key, label, Icon]) => (
                <button
                  key={String(key)}
                  onClick={() => setView(key)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition cursor-pointer lg:w-full ${
                    view === key ? "border-lilac/40 bg-lilac/10" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-lilac" />
                  <span className="whitespace-nowrap text-[12.5px] font-semibold text-zinc-300 lg:whitespace-normal">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* content */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={String(view)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {view === 0 ? (
                  <DayZeroView done={done} toggle={toggle} allDone={day0Done} onNext={() => goto(1)} />
                ) : typeof view === "number" ? (
                  <DayView
                    day={DAYS.find((d) => d.id === view)!}
                    done={done}
                    toggle={toggle}
                    unlocked={isUnlocked(view) || !!peeked[view]}
                    onPeek={() => setPeeked((p) => ({ ...p, [view]: true }))}
                    onGotoBlocker={() => goto(view === 1 ? 0 : view - 1)}
                    beaten={bossDefeated(DAYS.find((d) => d.id === view)!)}
                    onNext={() => goto(view === 7 ? "exam" : view + 1)}
                  />
                ) : view === "cheatsheet" ? (
                  <CheatSheetView />
                ) : view === "prompts" ? (
                  <PromptsView />
                ) : view === "templates" ? (
                  <TemplatesView />
                ) : view === "antipatterns" ? (
                  <AntiPatternsView />
                ) : view === "ladder" ? (
                  <LadderView />
                ) : (
                  <ExamView done={done} toggle={toggle} score={examScore} xp={xp} rank={rank.name} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ─────────── CTA ─────────── */}
      <section className="relative z-10 border-t border-white/10 bg-[#0a0a12] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-volt">What's next</p>
          <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            The guide teaches the system.
            <br />
            <span className="text-volt">The program builds it with you.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-400">
            This field guide is the free half. Inside AI Founder Hub you get the part a webpage can't give you — the
            done-for-you operator repo, live build sessions on real client projects, the private operator community, and
            the agency playbook for packaging this into services clients pay for monthly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/#membership"
              className="group flex items-center gap-2 rounded-full bg-volt px-7 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] transition hover:shadow-[0_0_45px_rgba(204,242,68,0.55)] active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>See the program</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/freemasterclass"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-zinc-200 transition hover:border-volt/40 hover:text-volt"
            >
              Claim a free masterclass seat
            </a>
          </div>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            Claude Code ships weekly — run /doctor monthly and skim the changelog. Ten minutes a month keeps you ahead of
            almost everyone.
          </p>
        </div>
      </section>

      <AnimatePresence>
        {celebration && <Celebration payload={celebration} onClose={() => setCelebration(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Day 0
════════════════════════════════════════════════════════════════ */

function DayZeroView({
  done,
  toggle,
  allDone,
  onNext,
}: {
  done: Record<string, boolean>;
  toggle: (k: string) => void;
  allDone: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Day 0 · Pre-mission
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-zinc-500">20 min · 0 XP</span>
        </div>
        <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          {DAY_ZERO.title}
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-zinc-400">{DAY_ZERO.tagline}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/60 p-5 sm:p-7">
        <h3 className="mb-1 font-display text-lg font-bold text-white">First: the plan question nobody tells you about</h3>
        <p className="mb-4 text-[13.5px] leading-relaxed text-zinc-400">
          Claude Code is free to install and not free to use. The free Claude.ai tier does not include it.
        </p>
        <DataTable head={["Plan", "Cost", "Verdict for this challenge"]} rows={DAY_ZERO.plans} />
        <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">
          Subscription plans have two stacked limits: a rolling five-hour window and a weekly cap, shared across the
          Claude apps and Claude Code together. Check yours any time with <span className="font-mono text-volt">/usage</span>.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/60 p-5 sm:p-7">
        <h3 className="mb-4 font-display text-lg font-bold text-white">Install it — the current way</h3>
        <div className="space-y-3">
          {DAY_ZERO.blocks.map((b, i) => (
            <CodeBlock key={i} block={b} />
          ))}
        </div>
        <div className="mt-4">
          <CalloutBox
            callout={{
              kind: "trap",
              title: "Already installed via npm from an older guide?",
              body:
                "Migrate: run /migrate-installer inside Claude Code, then npm uninstall -g @anthropic-ai/claude-code and hash -r. Running both versions at once produces genuinely baffling bugs. On native Windows (not WSL), also install Git for Windows — without it, Claude's Bash tool doesn't work.",
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-volt/25 bg-volt/[0.04] p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-volt">
          <Target className="h-3.5 w-3.5" />
          <span>Day 0 complete when</span>
        </div>
        <div className="space-y-2">
          {DAY_ZERO.checks.map((c, i) => (
            <CheckRow key={i} checked={!!done[`d0c${i}`]} onToggle={() => toggle(`d0c${i}`)}>
              {c}
            </CheckRow>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4">
          <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">Non-negotiable</p>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            If your project is not in git with a clean working tree, stop and fix that now. Every safety mechanism in
            this guide — checkpoints, worktrees, review gates, rollbacks — assumes git underneath. Working with an
            autonomous agent on uncommitted code is the single most common way people lose work.
          </p>
        </div>

        {allDone && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onNext}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void transition hover:shadow-[0_0_35px_rgba(204,242,68,0.45)] active:scale-95 cursor-pointer"
          >
            <span>Boot camp cleared — start Day 1</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Day view
════════════════════════════════════════════════════════════════ */

function DayView({
  day,
  done,
  toggle,
  unlocked,
  onPeek,
  onGotoBlocker,
  beaten,
  onNext,
}: {
  day: Day;
  done: Record<string, boolean>;
  toggle: (k: string) => void;
  unlocked: boolean;
  onPeek: () => void;
  onGotoBlocker: () => void;
  beaten: boolean;
  onNext: () => void;
}) {
  const bossDone = day.boss.checks.filter((_, i) => done[`b${day.id}_${i}`]).length;
  const drillsDone = day.drills.filter((d) => done[d.id]).length;
  const dayXp =
    day.drills.reduce((s, d) => s + (done[d.id] ? d.xp : 0), 0) +
    (beaten ? day.boss.xp : 0) +
    (done[`s${day.id}`] ? day.side.xp : 0);
  const dayMax = day.drills.reduce((s, d) => s + d.xp, 0) + day.boss.xp + day.side.xp;

  if (!unlocked) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0b0b13]/70 p-10 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Lock className="h-7 w-7 text-zinc-500" />
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-600">
          Day {day.id} · {day.code}
        </p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-zinc-500">{day.title}</h2>
        <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-zinc-500">
          Missions unlock in order — that's the whole point. Finish{" "}
          <span className="text-zinc-300">{day.id === 1 ? "Boot Camp" : `Day ${day.id - 1}'s boss fight`}</span> and this
          one opens.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGotoBlocker}
            className="flex items-center gap-2 rounded-full bg-volt px-5 py-3 font-display text-xs font-extrabold uppercase tracking-wider text-void transition hover:shadow-[0_0_30px_rgba(204,242,68,0.4)] active:scale-95 cursor-pointer"
          >
            <span>Go finish {day.id === 1 ? "Boot Camp" : `Day ${day.id - 1}`}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onPeek}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-mono text-[11px] font-semibold text-zinc-400 transition hover:border-volt/40 hover:text-volt cursor-pointer"
          >
            Peek at this mission anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b13]/80 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-volt/[0.07] blur-[60px]" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">
              Day {day.id} · {day.code}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-zinc-500">{day.time}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-zinc-500">
              {dayMax} XP
            </span>
            {beaten && (
              <span className="flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/15 px-3 py-1 font-mono text-[10px] font-bold uppercase text-volt">
                <Trophy className="h-3 w-3" /> {day.badge.name}
              </span>
            )}
          </div>

          <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            {day.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-zinc-400">{day.tagline}</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-volt"
                animate={{ width: `${Math.round((dayXp / dayMax) * 100)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <span className="shrink-0 font-mono text-[11px] font-bold text-zinc-400">
              {dayXp} / {dayMax} XP
            </span>
          </div>
        </div>
      </div>

      {/* concept */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/60 p-5 sm:p-7">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-lilac">
          <Brain className="h-3.5 w-3.5" />
          <span>The core concept</span>
        </div>
        <h3 className="font-display text-xl font-bold leading-snug text-white">{day.concept.heading}</h3>
        <div className="mt-3 space-y-3">
          {day.concept.body.map((p, i) => (
            <p key={i} className="text-[13.5px] leading-relaxed text-zinc-400">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* drills */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-volt">
            <Zap className="h-3.5 w-3.5" />
            <span>Drills</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-zinc-500">
            {drillsDone} / {day.drills.length} done
          </span>
        </div>

        <div className="space-y-4">
          {day.drills.map((drill, idx) => {
            const isDone = !!done[drill.id];
            return (
              <div
                key={drill.id}
                className={`overflow-hidden rounded-3xl border transition ${
                  isDone ? "border-volt/25 bg-volt/[0.03]" : "border-white/10 bg-[#0b0b13]/60"
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold ${
                        isDone ? "bg-volt text-void" : "bg-white/8 text-zinc-400"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" strokeWidth={3.5} /> : idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display text-lg font-bold leading-snug text-white">{drill.title}</h4>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">{drill.body}</p>
                    </div>
                  </div>

                  {(drill.blocks || drill.table || drill.callout) && (
                    <div className="mt-5 space-y-4 sm:pl-10">
                      {drill.blocks?.map((b, i) => (
                        <CodeBlock key={i} block={b} />
                      ))}
                      {drill.table && <DataTable head={drill.table.head} rows={drill.table.rows} />}
                      {drill.callout && <CalloutBox callout={drill.callout} />}
                    </div>
                  )}

                  <div className="mt-5 sm:pl-10">
                    <CheckRow checked={isDone} onToggle={() => toggle(drill.id)} xp={drill.xp}>
                      I ran this drill in my own project — not just read it.
                    </CheckRow>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* founder track */}
      <div className="rounded-3xl border border-lilac/25 bg-lilac/[0.05] p-5 sm:p-6">
        <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-lilac">
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Founder track · Day {day.id}</span>
        </div>
        <p className="text-[13.5px] leading-relaxed text-zinc-300">{day.founder}</p>
      </div>

      {/* boss fight */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 ${
          beaten ? "border-volt/40 bg-volt/[0.06]" : "border-orange-400/25 bg-orange-400/[0.04]"
        }`}
      >
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
          <Shield className="h-3.5 w-3.5" />
          <span>Boss fight · {day.boss.xp} XP</span>
        </div>
        <h3 className="font-display text-xl font-bold text-white">
          {beaten ? `Defeated — ${day.badge.name} unlocked` : "Beat this to unlock the next day"}
        </h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">{day.boss.intro}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full ${beaten ? "bg-volt" : "bg-orange-400"}`}
              animate={{ width: `${Math.round((bossDone / day.boss.checks.length) * 100)}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] font-bold text-zinc-400">
            {bossDone} / {day.boss.checks.length}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {day.boss.checks.map((c, i) => (
            <CheckRow key={i} checked={!!done[`b${day.id}_${i}`]} onToggle={() => toggle(`b${day.id}_${i}`)}>
              {c}
            </CheckRow>
          ))}
        </div>

        {beaten && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className="mb-4 rounded-2xl border border-volt/30 bg-volt/10 p-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="h-5 w-5 shrink-0 text-volt" />
                <div>
                  <p className="font-display text-sm font-black uppercase tracking-wide text-volt">{day.badge.name}</p>
                  <p className="text-[12.5px] leading-relaxed text-zinc-400">{day.badge.desc}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onNext}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void transition hover:shadow-[0_0_35px_rgba(204,242,68,0.45)] active:scale-95 cursor-pointer"
            >
              <span>{day.id === 7 ? "Take the Operator Exam" : `Unlock Day ${day.id + 1}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

      {/* side quest */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/60 p-5 sm:p-6">
        <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          <Flame className="h-3.5 w-3.5" />
          <span>Side quest · +{day.side.xp} XP</span>
        </div>
        <p className="mb-4 text-[13.5px] leading-relaxed text-zinc-400">{day.side.text}</p>
        <CheckRow checked={!!done[`s${day.id}`]} onToggle={() => toggle(`s${day.id}`)} xp={day.side.xp}>
          Side quest complete.
        </CheckRow>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Field kit views
════════════════════════════════════════════════════════════════ */

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-[#0b0b13]/60 p-5 sm:p-7">{children}</div>;
}

function CheatSheetView() {
  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading eyebrow="Appendix A" title="The operator's cheat sheet" />
        <p className="mb-5 text-[13.5px] leading-relaxed text-zinc-400">
          Claude Code ships updates weekly. If something here doesn't match your terminal, type{" "}
          <span className="font-mono text-volt">/help</span> to see what your version actually has and run{" "}
          <span className="font-mono text-volt">/doctor</span>. Being able to do that is part of being an expert.
        </p>
        <h3 className="mb-3 font-display text-base font-bold text-white">Commands you'll use every day</h3>
        <DataTable head={["Command", "What it does"]} rows={COMMANDS.map(([a, b]) => [a, b])} />
      </Panel>

      <Panel>
        <h3 className="mb-3 font-display text-base font-bold text-white">CLI flags worth memorising</h3>
        <DataTable head={["Flag", "Use"]} rows={FLAGS.map(([a, b]) => [a, b])} />
      </Panel>

      <Panel>
        <h3 className="mb-3 font-display text-base font-bold text-white">Cost & limits control</h3>
        <p className="mb-4 text-[13.5px] leading-relaxed text-zinc-400">
          Every turn re-sends your system prompt, tool definitions, CLAUDE.md, MCP tool schemas, and the whole
          conversation so far. That's why a long session is exponentially more expensive than a short one — and why{" "}
          <span className="font-mono text-volt">/clear</span> is the cheapest optimisation available to you.
        </p>
        <DataTable head={["Lever", "Effect"]} rows={COST_LEVERS.map(([a, b]) => [a, b])} />
      </Panel>
    </div>
  );
}

function PromptsView() {
  const [q, setQ] = useState("");
  const filtered = PROMPTS.filter(
    (p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeading eyebrow="Appendix B" title="The prompt vault" />
        <p className="mb-5 text-[13.5px] leading-relaxed text-zinc-400">
          Thirteen prompts that do the heavy lifting. Steal them, adapt them, keep them in a file.
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter prompts — try 'review', 'test', 'debug'…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[12.5px] text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-volt/40"
        />
      </Panel>

      {filtered.map((p) => (
        <div key={p.n} className="rounded-3xl border border-white/10 bg-[#0b0b13]/60 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lilac/15 font-mono text-[10px] font-bold text-lilac">
              {p.n}
            </span>
            <h3 className="font-display text-base font-bold text-white">{p.title}</h3>
          </div>
          <CodeBlock block={{ lang: "text", label: `Prompt ${p.n}`, code: p.code }} />
        </div>
      ))}

      {filtered.length === 0 && (
        <Panel>
          <p className="text-center text-[13.5px] text-zinc-500">No prompts match “{q}”.</p>
        </Panel>
      )}
    </div>
  );
}

function TemplatesView() {
  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeading eyebrow="Appendix C" title="The template pack" />
        <p className="mb-5 text-[13.5px] leading-relaxed text-zinc-400">
          The file structure a well-run repo actually has. Build this once and every future project starts here.
        </p>
        <CodeBlock block={{ lang: "text", label: "Repo structure", code: REPO_TREE }} />
      </Panel>
      <Panel>
        <h3 className="mb-3 font-display text-base font-bold text-white">Ticket template</h3>
        <CodeBlock block={{ lang: "md", label: "specs/ticket-NN.md", code: TICKET_TEMPLATE }} />
      </Panel>
      <Panel>
        <h3 className="mb-3 font-display text-base font-bold text-white">Subagent template</h3>
        <CodeBlock block={{ lang: "md", label: ".claude/agents/agent-name.md", code: AGENT_TEMPLATE }} />
      </Panel>
    </div>
  );
}

function AntiPatternsView() {
  return (
    <Panel>
      <SectionHeading eyebrow="Appendix E" title="Anti-patterns and their antidotes" />
      <p className="mb-5 text-[13.5px] leading-relaxed text-zinc-400">
        Find your symptom. Apply the antidote. Every one of these traces back to a day in this protocol.
      </p>
      <DataTable head={["Symptom", "Antidote"]} rows={ANTIPATTERNS.map(([a, b]) => [a, b])} />
    </Panel>
  );
}

function LadderView() {
  return (
    <Panel>
      <SectionHeading eyebrow="Appendix G" title="Days 8–30: the mastery ladder" />
      <p className="mb-6 text-[13.5px] leading-relaxed text-zinc-400">
        Seven days makes you dangerous. These four weeks make you the person others ask.
      </p>
      <div className="space-y-3">
        {LADDER.map(([week, focus, body]) => (
          <div key={week} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2.5">
              <span className="rounded-md bg-volt/15 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
                {week}
              </span>
              <span className="font-display text-sm font-bold uppercase tracking-wide text-white">{focus}</span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-zinc-400">{body}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ExamView({
  done,
  toggle,
  score,
  xp,
  rank,
}: {
  done: Record<string, boolean>;
  toggle: (k: string) => void;
  score: number;
  xp: number;
  rank: string;
}) {
  const passed = score === EXAM.length;
  return (
    <div className="space-y-6">
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
          passed ? "border-volt/40 bg-volt/[0.07]" : "border-white/10 bg-[#0b0b13]/80"
        }`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-volt/[0.08] blur-[60px]" />
        <div className="relative">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-volt">Appendix I · The capstone</p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            The Operator Exam
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-zinc-400">
            Twelve checks. No partial credit. Pass all twelve and you have earned the title — not because a webpage says
            so, but because these things either exist in your repo or they don't. Each one is a fact you can verify in
            under a minute.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <div className="font-display text-2xl font-black text-volt">
                {score}
                <span className="text-base text-zinc-600">/12</span>
              </div>
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">exam score</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <div className="font-display text-2xl font-black text-white">{xp}</div>
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">total XP</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5">
              <div className="font-display text-2xl font-black text-lilac">{rank}</div>
              <div className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">rank</div>
            </div>
          </div>
        </div>
      </div>

      <Panel>
        <div className="space-y-2">
          {EXAM.map((c, i) => (
            <CheckRow key={i} checked={!!done[`e${i}`]} onToggle={() => toggle(`e${i}`)}>
              <span className="font-mono text-[11px] text-zinc-600">{String(i + 1).padStart(2, "0")}. </span>
              {c}
            </CheckRow>
          ))}
        </div>
      </Panel>

      {passed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-volt/40 bg-gradient-to-br from-volt/15 to-transparent p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-volt/40 bg-volt/15">
            <Crown className="h-8 w-8 text-volt" />
          </div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-volt">Twelve out of twelve</p>
          <h3 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-white">The Operator</h3>
          <p className="mx-auto mt-3 max-w-lg text-[13.5px] leading-relaxed text-zinc-400">
            You're not a person who uses Claude Code. You're an operator who runs it — and that is a genuinely rare
            thing. Most people at your skill level got there over months of trial and error. You did it in a week
            because you followed a system instead of collecting tips.
          </p>
          <a
            href="/#membership"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-volt px-6 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void transition hover:shadow-[0_0_40px_rgba(204,242,68,0.5)]"
          >
            <Factory className="h-4 w-4" />
            <span>Now turn it into income</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      ) : (
        <Panel>
          <div className="flex items-start gap-3">
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
            <p className="text-[13.5px] leading-relaxed text-zinc-400">
              <span className="font-bold text-zinc-200">Eight or nine out of twelve is completely normal.</span> Find the
              missing ones, look at which day they came from, and redo that day's boss fight. The gaps are almost always
              Days 5–7, because that's where it stops being about prompting and starts being about engineering. That's
              also where all the leverage is. Go back.
            </p>
          </div>
        </Panel>
      )}
    </div>
  );
}
