import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  ChevronDown,
  Laptop,
  Activity,
  Rocket,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { EVENT, Reveal, SectionTag, scrollToRegister } from "./shared";
import speakerImage from "../assets/images/speaker.jpg";

/* ————————————————— timezone strip ————————————————— */

const ZONES = [
  { name: "Pacific", main: "9AM", sunday: "4PM" },
  { name: "Mountain", main: "10AM", sunday: "5PM" },
  { name: "Central", main: "11AM", sunday: "6PM" },
  { name: "Eastern", main: "12PM", sunday: "7PM" },
];

function TimezoneStrip() {
  return (
    <Reveal className="relative z-20 mx-auto -mt-10 w-full max-w-5xl px-5">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-edge bg-edge shadow-[0_30px_60px_rgba(0,0,0,0.5)] lg:grid-cols-4">
        {ZONES.map((zone) => (
          <div key={zone.name} className="bg-panel px-5 py-5 text-center">
            <span className="font-display text-sm font-extrabold uppercase tracking-wide text-lilac">
              {zone.name} Time
            </span>
            <div className="mt-2.5 space-y-1.5 text-[11px] font-semibold text-zinc-400">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-3 w-3 text-volt" />
                <span>{EVENT.fri_sat}</span>
                <span className="rounded bg-volt/10 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-volt">
                  {zone.main}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-3 w-3 text-zinc-500" />
                <span>{EVENT.sun}</span>
                <span className="rounded bg-volt/10 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-volt">
                  {zone.sunday}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ————————————————— speaker player ————————————————— */

function SpeakerPlayer() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const melody = [261.63, 311.13, 349.23, 392.0, 466.16, 523.25, 622.25];

  const stopAudio = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const startAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();
      stopAudio();

      let step = 0;
      const playStep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const frequency = melody[step % melody.length];
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        if (step % 2 === 0) {
          const subOsc = ctx.createOscillator();
          const subGain = ctx.createGain();
          subOsc.type = "triangle";
          subOsc.frequency.setValueAtTime(frequency / 2, ctx.currentTime);
          subGain.gain.setValueAtTime(0.05, ctx.currentTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          subOsc.connect(subGain);
          subGain.connect(ctx.destination);
          subOsc.start();
          subOsc.stop(ctx.currentTime + 0.82);
        }

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.48);
        step++;
      };

      playStep();
      synthIntervalRef.current = window.setInterval(playStep, 500);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  useEffect(() => {
    if (isPlaying && soundEnabled) startAudio();
    else stopAudio();
    return () => stopAudio();
  }, [isPlaying, soundEnabled]);

  // waveform visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bars: number[] = Array.from({ length: 36 }, () => 2);
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { width, height } = canvas;
      const barWidth = width / bars.length;
      phase += 0.08;

      for (let i = 0; i < bars.length; i++) {
        let target = 1.5 + Math.sin(i * 0.2) * 1.5;
        if (isPlaying) {
          const multiplier = soundEnabled ? 28 : 8;
          target = 2 + Math.abs(Math.sin(i * 0.3 + phase) * Math.cos(i * 0.15 + phase * 0.5)) * multiplier;
          target += Math.random() * (soundEnabled ? 6 : 2);
        }
        bars[i] = bars[i] * 0.7 + target * 0.3;

        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, "rgba(204, 242, 68, 0.15)");
        grad.addColorStop(0.6, "rgba(204, 242, 68, 0.7)");
        grad.addColorStop(1, "rgba(181, 161, 255, 0.95)");
        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth + 1, height - bars[i], barWidth - 2, bars[i]);
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, soundEnabled]);

  return (
    <Reveal delay={0.1} className="relative mx-auto w-full max-w-4xl">
      <div className="absolute -inset-2 rounded-[30px] bg-gradient-to-tr from-volt/25 via-transparent to-lilac/25 blur-lg" />
      <div
        onClick={() => {
          const next = !isPlaying;
          setIsPlaying(next);
          if (next && !soundEnabled) setSoundEnabled(true);
        }}
        className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-3xl border-4 border-ink shadow-2xl"
      >
        <img
          src={speakerImage}
          alt="AI Founder Hub lead trainer presenting the live build summit"
          loading="lazy"
          decoding="async"
          width={1280}
          height={698}
          className={`h-full w-full select-none object-cover object-top transition-transform duration-[4000ms] ease-out ${
            isPlaying ? "scale-105" : "scale-100"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/25" />

        {/* sound pill */}
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled((s) => !s);
            }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-ink/85 px-3.5 py-1.5 backdrop-blur-sm transition-all hover:bg-ink active:scale-95 cursor-pointer"
          >
            {soundEnabled && isPlaying ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-volt" />
                <span className="text-[11px] font-semibold text-zinc-100">Sound on</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-[11px] font-semibold text-zinc-100">Enable sound</span>
              </>
            )}
          </button>
        </div>

        {/* center play control */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              <motion.div
                key="play"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-volt text-void shadow-[0_0_50px_rgba(204,242,68,0.5)] transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-8 w-8 translate-x-0.5 fill-void" />
                </div>
                <span className="rounded-full border border-white/10 bg-ink/85 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-volt backdrop-blur-sm">
                  Day 1 + 2 highlight reel
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="pause"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-ink/70 text-white">
                  <Pause className="h-6 w-6" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* bottom visualizer strip */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-ink via-ink/70 to-transparent px-5 py-3.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-wider text-zinc-200">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-volt" />
              <Activity className="h-3.5 w-3.5 text-lilac" />
              {isPlaying ? (soundEnabled ? "Broadcast stream active" : "Broadcast muted") : "Standby"}
            </span>
            <span className="font-mono text-[10px] font-semibold text-zinc-400">[LIVE FEED · JULY 2026]</span>
          </div>
          <canvas ref={canvasRef} className="h-10 w-full border-t border-white/5 opacity-90" width={600} height={80} />
        </div>
      </div>
    </Reveal>
  );
}

/* ————————————————— curriculum data ————————————————— */

interface TopicItem {
  time: string;
  title: string;
  desc: string;
  type: "lecture" | "lab" | "coaching" | "finale";
}

interface DayItem {
  day: number;
  date: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  icon: React.ReactNode;
  duration: string;
  topics: TopicItem[];
}

const DAYS: DayItem[] = [
  {
    day: 1,
    date: EVENT.day1,
    title: "Your Idea, Running In A Browser",
    subtitle: "The 60-minute prototype challenge",
    shortDesc:
      "Turn a napkin sketch or a one-sentence idea into a structured, working interface in under an hour, using nothing but conversation. You'll run the exact prompt frameworks live alongside us.",
    icon: <Laptop className="h-5 w-5" />,
    duration: "3 hrs live + labs",
    topics: [
      {
        time: "09:00-10:15 AM",
        title: "The Prompt Masterclass: Sketches & Logic Maps",
        desc: "How to brief an AI model like a product owner: skip the jargon, keep the intent. You'll draft your first layout with blueprint templates from the VIP workbook.",
        type: "lecture",
      },
      {
        time: "10:30-12:00 PM",
        title: "Build Lab: Your First Real Interface",
        desc: "Watch a full dashboard get built from a blank file, then fork the live workspace template and build yours in minutes, together in real time.",
        type: "lab",
      },
      {
        time: "12:15-01:00 PM",
        title: "Hot-Seat Coaching: Idea Audits",
        desc: "Three registrants pitch their idea on stream; we build, modify, and launch their interfaces live so everyone sees the loop end-to-end.",
        type: "coaching",
      },
    ],
  },
  {
    day: 2,
    date: EVENT.day2,
    title: "Intelligence, Data & Payments",
    subtitle: "From pretty prototype to real product",
    shortDesc:
      "Upgrade your static prototype into a living product: persistent data so users never lose work, an AI feature your competitors can't copy-paste, and the plumbing for getting paid.",
    icon: <Activity className="h-5 w-5" />,
    duration: "3 hrs live + labs",
    topics: [
      {
        time: "09:00-10:15 AM",
        title: "Data Flows: Store & Retrieve Like A Pro",
        desc: "Demystify databases without touching SQL. Wire up persistent storage so your app remembers users, saves work, and survives a refresh.",
        type: "lecture",
      },
      {
        time: "10:30-12:00 PM",
        title: "The AI Feature Lab: Your App Gets A Brain",
        desc: "Connect a frontier model API and ship a genuinely smart feature (summaries, generation, recommendations) gated safely behind your own server route.",
        type: "lab",
      },
      {
        time: "12:15-01:00 PM",
        title: "The Debugging Clinic",
        desc: "The session that turns panic into process. Read error logs calmly, prompt your way out of any bug, and learn the 3 fixes that solve 80% of beginner walls.",
        type: "coaching",
      },
    ],
  },
  {
    day: 3,
    date: EVENT.day3,
    title: "Launch, Monetize, Get Users",
    subtitle: "The 4-figure roadmap",
    shortDesc:
      "Ship it for real: production hosting on a real URL, a checkout flow that takes actual money, and a zero-budget distribution plan to find your first 100 users this month.",
    icon: <Rocket className="h-5 w-5" />,
    duration: "4 hrs live finale",
    topics: [
      {
        time: "04:00-05:15 PM",
        title: "One-Click Cloud Deploy",
        desc: "Package and publish your build to global edge hosting (custom domain, SSL, analytics) and watch your app go live on the open internet.",
        type: "lecture",
      },
      {
        time: "05:30-06:45 PM",
        title: "The Micro-SaaS Blueprint: Paywalls & Subscriptions",
        desc: "Bolt on ready-made checkout: Stripe overlays, subscription tiers, and locked premium features. It is the same pattern behind a thousand indie success stories.",
        type: "lab",
      },
      {
        time: "07:00-07:45 PM",
        title: "Graduation: Certificates & The Road Ahead",
        desc: "Claim your Certified AI App Builder badge, grab the exclusive template vault, and get your personal 30-day launch plan in the closing panel.",
        type: "finale",
      },
    ],
  },
];

const TYPE_STYLE: Record<TopicItem["type"], string> = {
  lecture: "bg-ink/5 text-ink/60",
  lab: "bg-emerald-600/10 text-emerald-700 border border-emerald-600/20",
  coaching: "bg-lilac/20 text-purple-700 border border-purple-300/40",
  finale: "bg-volt/30 text-ink border border-volt-deep/40",
};

/* ————————————————— main agenda section ————————————————— */

export function Agenda() {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <div id="curriculum" className="scroll-mt-20">
      <TimezoneStrip />

      <section className="relative mt-16 overflow-hidden bg-paper py-16 text-ink sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-grid-paper opacity-50" />
        {/* giant ghost word */}
        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[16vw] font-extrabold uppercase leading-none text-outline-paper opacity-60">
          Curriculum
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-10">
          {/* heading */}
          <div className="mb-14 text-center">
            <Reveal>
              <div className="flex justify-center">
                <SectionTag index="03" label="The flagship summit" tone="ink" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                Three days.
                <br />
                <span className="font-serif italic font-normal normal-case">One shipped app.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-xl text-[15px] font-medium leading-relaxed text-ink/65">
                No coding. No previous experience. Just your idea, a browser, and a willingness to execute. Every
                session is live, hands-on, and recorded for VIP pass holders.
              </p>
            </Reveal>
          </div>

          <SpeakerPlayer />

          {/* day accordion */}
          <div className="mx-auto mt-14 max-w-4xl space-y-4">
            {DAYS.map((agenda, idx) => {
              const isOpen = expandedDay === agenda.day;
              return (
                <Reveal key={agenda.day} delay={idx * 0.08}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? "border-ink/20 bg-white shadow-[0_24px_60px_rgba(20,19,14,0.10)]"
                        : "cursor-pointer border-ink/10 bg-paper-dim/60 hover:bg-paper-dim"
                    }`}
                    onClick={() => !isOpen && setExpandedDay(agenda.day)}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDay(isOpen ? null : agenda.day);
                      }}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-13 w-13 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 font-display font-extrabold leading-none transition-colors h-[52px] w-[52px] ${
                            isOpen ? "border-ink bg-ink text-volt" : "border-ink/20 bg-white text-ink/70"
                          }`}
                        >
                          <span className="text-[9px] uppercase tracking-tight">Day</span>
                          <span className="text-xl">{agenda.day}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="font-mono text-[10.5px] font-extrabold uppercase tracking-wider text-purple-700">
                              {agenda.date}
                            </span>
                            <span className="rounded-full bg-volt/40 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase text-ink/70">
                              {agenda.duration}
                            </span>
                          </div>
                          <h4 className="mt-1 font-display text-lg font-extrabold uppercase leading-tight tracking-tight sm:text-xl">
                            {agenda.title}
                          </h4>
                          <span className="text-[13px] font-semibold text-ink/55">{agenda.subtitle}</span>
                        </div>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-lg border p-1.5 transition-all duration-300 ${
                          isOpen ? "rotate-180 border-ink/20 bg-ink/5 text-ink" : "border-transparent text-ink/40"
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="space-y-5 border-t border-ink/8 bg-paper/60 px-5 pb-6 pt-5 sm:px-6">
                            <p className="max-w-3xl border-l-4 border-volt-deep pl-4 text-[13px] font-medium leading-relaxed text-ink/70">
                              {agenda.shortDesc}
                            </p>

                            <div className="relative space-y-3.5 pl-5 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-[2px] before:bg-ink/10">
                              {agenda.topics.map((topic, tIdx) => (
                                <div key={tIdx} className="group/topic relative">
                                  <div className="absolute -left-[19px] top-5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-ink/30 transition-colors group-hover/topic:bg-volt-deep" />
                                  <div className="space-y-2 rounded-xl border border-ink/8 bg-white p-4 shadow-sm transition-all hover:border-ink/15 sm:p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded bg-ink px-2 py-0.5 font-mono text-[10.5px] font-bold text-volt">
                                        {topic.time}
                                      </span>
                                      <span
                                        className={`rounded px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase ${TYPE_STYLE[topic.type]}`}
                                      >
                                        {topic.type}
                                      </span>
                                    </div>
                                    <h6 className="font-display text-[15px] font-extrabold tracking-tight text-ink transition-colors group-hover/topic:text-purple-700">
                                      {topic.title}
                                    </h6>
                                    <p className="text-xs font-medium leading-relaxed text-ink/60">{topic.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-volt-deep/25 bg-volt/15 p-4 text-xs sm:flex-row sm:items-center">
                              <span className="flex items-center gap-2 font-bold text-ink/80">
                                <Sparkles className="animate-spin-slow h-4 w-4 text-purple-700" />
                                Day {agenda.day} workbook bonuses included
                              </span>
                              <span className="rounded-full border border-ink/10 bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                                +3 custom templates
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}

            <Reveal className="pt-6 text-center">
              <button
                type="button"
                onClick={scrollToRegister}
                className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-volt transition-all duration-300 hover:shadow-[0_14px_40px_rgba(20,19,14,0.3)] active:scale-95 cursor-pointer"
              >
                Reserve my seat for all 3 days
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
