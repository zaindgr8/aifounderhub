import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Globe, Rocket, MessageSquareText, Wand2, CheckCircle2 } from "lucide-react";
import { Reveal, SectionTag, CountUp } from "./shared";

/* ————————————————————————————————————————————————
   Tools marquee — the 2026 AI builder stack
———————————————————————————————————————————————— */

const STACK = [
  "CLAUDE", "GPT-5", "GEMINI","FABLE 5" ,"CURSOR", "LOVABLE", "REPLIT", "V0", "BOLT", "VERCEL", "SUPABASE", "STRIPE", "WINDSURF",
];

export function ToolsMarquee() {
  const row = [...STACK, ...STACK];
  return (
    <section className="relative border-y border-edge bg-panel/40 py-7 overflow-hidden marquee-paused">
      <p className="mb-5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">
        The 2026 AI builder stack: every tool covered live
      </p>
      <div className="relative" style={{ maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)" }}>
        <div className="marquee-track items-center gap-12 px-6">
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="flex items-center gap-12 whitespace-nowrap font-display text-xl font-extrabold tracking-tight text-zinc-600 transition-colors hover:text-volt"
            >
              {name}
              <span className="h-1.5 w-1.5 rounded-full bg-volt/40" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ————————————————————————————————————————————————
   The looping "AI builds your app" terminal
———————————————————————————————————————————————— */

interface Scenario {
  prompt: string;
  appName: string;
  lines: { text: string; tone: "kw" | "fn" | "str" | "plain" | "cm" }[];
}

const SCENARIOS: Scenario[] = [
  {
    prompt: "Build a booking app for my barbershop with payments",
    appName: "sharpcuts.app",
    lines: [
      { text: "// generating BookingFlow.tsx", tone: "cm" },
      { text: "export function BookingFlow() {", tone: "kw" },
      { text: "  const slots = useAvailability(barber)", tone: "fn" },
      { text: "  const checkout = useStripe()", tone: "fn" },
      { text: "  return <Calendar onPick={checkout.pay} />", tone: "str" },
      { text: "}", tone: "kw" },
      { text: "payments wired · SMS reminders added", tone: "plain" },
    ],
  },
  {
    prompt: "Make a meal-plan generator I can sell as a subscription",
    appName: "platefuel.io",
    lines: [
      { text: "// generating PlanEngine.ts", tone: "cm" },
      { text: "const plan = await ai.generate({", tone: "kw" },
      { text: "  goal: user.macros,", tone: "fn" },
      { text: "  allergies: user.profile.allergies,", tone: "fn" },
      { text: "})", tone: "kw" },
      { text: "gate(plan, { tier: 'pro', price: 9.99 })", tone: "str" },
      { text: "paywall live · 7-day trial enabled", tone: "plain" },
    ],
  },
  {
    prompt: "Create a quiz maker for teachers with auto-grading",
    appName: "quizforge.app",
    lines: [
      { text: "// generating GradeBot.tsx", tone: "cm" },
      { text: "export async function grade(answers) {", tone: "kw" },
      { text: "  const rubric = await ai.rubric(quiz)", tone: "fn" },
      { text: "  return rubric.score(answers)", tone: "fn" },
      { text: "}", tone: "kw" },
      { text: "CSV export ready · parent reports on", tone: "plain" },
    ],
  },
];

const TONE_CLASS: Record<string, string> = {
  kw: "text-lilac",
  fn: "text-sky-300",
  str: "text-volt",
  plain: "text-emerald-400",
  cm: "text-zinc-500 italic",
};

type Phase = "typing" | "thinking" | "coding" | "deployed";

function TerminalWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  const scenario = SCENARIOS[scenarioIdx];

  // drive the loop with a single timeout chain — pause when off-screen
  useEffect(() => {
    if (!inView) return;
    let id: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typedCount < scenario.prompt.length) {
        id = setTimeout(() => setTypedCount((c) => c + 1), 34);
      } else {
        id = setTimeout(() => setPhase("thinking"), 500);
      }
    } else if (phase === "thinking") {
      id = setTimeout(() => setPhase("coding"), 1300);
    } else if (phase === "coding") {
      if (visibleLines < scenario.lines.length) {
        id = setTimeout(() => setVisibleLines((c) => c + 1), 260);
      } else {
        id = setTimeout(() => setPhase("deployed"), 600);
      }
    } else if (phase === "deployed") {
      id = setTimeout(() => {
        setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
        setTypedCount(0);
        setVisibleLines(0);
        setPhase("typing");
      }, 3600);
    }
    return () => clearTimeout(id);
  }, [inView, phase, typedCount, visibleLines, scenario]);

  return (
    <div ref={ref} className="relative">
      {/* glow base */}
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-tr from-volt/15 via-transparent to-lilac/20 blur-xl" />

      <div className="relative overflow-hidden rounded-2xl border border-edge bg-[#0a0a10] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
        {/* title bar */}
        <div className="flex items-center justify-between border-b border-edge bg-white/[0.025] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            founder-terminal · live build
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-volt">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-volt" />
            REC
          </span>
        </div>

        <div className="min-h-[340px] p-5 font-mono text-[12.5px] leading-relaxed sm:text-[13px]">
          {/* prompt line */}
          <div className="flex gap-2.5">
            <span className="select-none font-bold text-volt">you &gt;</span>
            <span className={`text-zinc-100 ${phase === "typing" ? "term-caret" : ""}`}>
              {scenario.prompt.slice(0, typedCount)}
            </span>
          </div>

          {/* thinking */}
          <AnimatePresence>
            {(phase === "thinking" || phase === "coding" || phase === "deployed") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 text-zinc-400"
              >
                <Wand2 className={`h-3.5 w-3.5 text-lilac ${phase === "thinking" ? "animate-pulse" : ""}`} />
                <span className="text-lilac">ai &gt;</span>
                {phase === "thinking" ? (
                  <span className="animate-pulse">
                    designing schema, routes & UI<span className="term-caret" />
                  </span>
                ) : (
                  <span>scaffolding complete, writing code</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* streamed code */}
          <div className="mt-3 space-y-1">
            {scenario.lines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={`${scenarioIdx}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`whitespace-pre ${TONE_CLASS[line.tone]}`}
              >
                {line.text}
              </motion.div>
            ))}
          </div>

          {/* deployed banner */}
          <AnimatePresence>
            {phase === "deployed" && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 flex items-center justify-between rounded-xl border border-volt/30 bg-volt/[0.07] px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-volt" />
                  <div>
                    <span className="block text-[12px] font-bold text-volt">Deployed to production</span>
                    <span className="flex items-center gap-1 text-[10.5px] text-zinc-400">
                      <Globe className="h-3 w-3" /> https://{scenario.appName}
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-volt px-2.5 py-1 font-mono text-[9px] font-black uppercase text-void">
                  Live
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————————
   Section wrapper: copy + steps + terminal
———————————————————————————————————————————————— */

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Describe",
    body: "Talk to AI like you'd brief a developer: plain English, napkin-sketch energy. We hand you the exact prompt frameworks.",
  },
  {
    icon: Wand2,
    title: "Generate",
    body: "Watch full production code stream out: UI, database, payments. You steer; the model types. No syntax to memorize.",
  },
  {
    icon: Rocket,
    title: "Ship",
    body: "One-click deploy to a real URL with hosting, a paywall, and analytics. Ready for your first paying user on Day 3.",
  },
];

/* TerminalShowcase section — commented out */
// export function TerminalShowcase() {
//   return (
//     <section id="demo" className="relative overflow-hidden py-16 sm:py-24 scroll-mt-20">
//       <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" />
//       <div
//         className="pointer-events-none absolute bottom-0 left-[20%] h-[40vh] w-[40vw] rounded-full blur-[140px]"
//         style={{ background: "rgba(181,161,255,0.08)" }}
//       />
//       <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-10 lg:grid-cols-2">
//         <div>
//           <Reveal>
//             <SectionTag index="01" label="The live demo" />
//           </Reveal>
//           <Reveal delay={0.08}>
//             <h2 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-[56px]">
//               What "building
//               <br />
//               with AI" <span className="font-serif italic font-normal normal-case text-volt">actually</span>
//               <br />
//               looks like
//             </h2>
//           </Reveal>
//           <Reveal delay={0.16}>
//             <p className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-400">
//               This isn't drag-and-drop website builders or no-code spaghetti. It's a conversation that compiles. The
//               terminal on the right is the same loop you'll run live with us: three times, on three different apps.
//             </p>
//           </Reveal>
//           <div className="mt-10 space-y-2.5">
//             {STEPS.map((step, i) => (
//               <Reveal key={step.title} delay={0.2 + i * 0.1}>
//                 <div className="group flex gap-4 rounded-2xl border border-edge bg-panel/60 p-4.5 transition-all duration-300 hover:border-volt/30 hover:bg-panel">
//                   <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-volt/10 text-volt transition-transform duration-300 group-hover:scale-110">
//                     <step.icon className="h-4.5 w-4.5" />
//                   </div>
//                   <div>
//                     <div className="flex items-baseline gap-2.5">
//                       <span className="font-mono text-[10px] font-bold text-zinc-600">0{i + 1}</span>
//                       <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-white">
//                         {step.title}
//                       </h3>
//                     </div>
//                     <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">{step.body}</p>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//         <Reveal delay={0.15} y={40}>
//           <TerminalWindow />
//         </Reveal>
//       </div>
//     </section>
//   );
// }

export function TerminalShowcase() {
  return null;
}

/* ————————————————————————————————————————————————
   Stats band with count-up numbers
———————————————————————————————————————————————— */

const STATS = [
  { value: 4281, suffix: "+", label: "Founders registered", note: "this cohort" },
  { value: 317, suffix: "", label: "Apps shipped live", note: "by past attendees" },
  { value: 3, suffix: "", label: "Days, idea to launch", note: "Fri -> Sun" },
  { value: 0, suffix: "", label: "Lines you'll hand-write", note: "AI types, you direct", prefix: "" },
];

export function StatsBand() {
  return (
    <section className="relative border-y border-edge bg-panel/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-edge md:grid-cols-4 md:divide-x">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="px-6 py-8 text-center md:py-10">
            <div className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              <CountUp to={stat.value} suffix={stat.suffix} className="tabular-nums" />
            </div>
            <div className="mt-2 text-[12px] font-bold uppercase tracking-wider text-zinc-300">{stat.label}</div>
            <div className="mt-0.5 font-mono text-[10px] text-zinc-500">{stat.note}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
