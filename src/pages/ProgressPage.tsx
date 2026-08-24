import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  Flame,
  Crown,
  RotateCcw,
  Check,
  Bot,
  Workflow,
  DollarSign,
  Rocket,
  AlertCircle,
  KeyRound,
  LogOut,
} from "lucide-react";
import { Wordmark } from "../components/shared";

interface QuestTask {
  id: string;
  title: string;
  desc: string;
  xp: number;
  tools?: string[];
  docLink?: string;
}

interface QuestLevel {
  id: number;
  title: string;
  subtitle: string;
  mrrTarget: string;
  badge: string;
  icon: React.ElementType;
  accent: string;
  borderAccent: string;
  tasks: QuestTask[];
}

const ROADMAP_LEVELS: QuestLevel[] = [
  {
    id: 1,
    title: "Agency Foundation & Setup",
    subtitle: "Define your high-ticket vertical, brand identity & developer environment.",
    mrrTarget: "$0 / mo",
    badge: "STAGE 01 · FOUNDATION (FREE PREVIEW)",
    icon: Rocket,
    accent: "text-volt bg-volt/10 border-volt/30",
    borderAccent: "border-volt/40",
    tasks: [
      {
        id: "t1_1",
        title: "Pick Your Core Niche Vertical",
        desc: "Choose 1 high-ticket industry: Real Estate, Private Clinics/Dentists, MedSpas, or High-End Gyms.",
        xp: 100,
        tools: ["Niche Matrix", "Market Scorecard"],
      },
      {
        id: "t1_2",
        title: "Setup Agency Domain & Brand One-Pager",
        desc: "Register a professional agency domain and launch your 1-page offer showcase site.",
        xp: 150,
        tools: ["Domain", "Vercel", "Tailwind"],
      },
      {
        id: "t1_3",
        title: "Provision AI Sandbox Accounts",
        desc: "Setup Retell AI, Vapi, n8n workspace, Cal.com scheduling, and Twilio phone numbers.",
        xp: 150,
        tools: ["Retell AI", "n8n", "Cal.com", "Twilio"],
      },
    ],
  },
  {
    id: 2,
    title: "Build The AI Lead System",
    subtitle: "Construct your demo-ready AI Voice Agent, Chatbot & CRM synchronization pipeline.",
    mrrTarget: "$0 / mo",
    badge: "STAGE 02 · CORE ASSET",
    icon: Bot,
    accent: "text-lilac bg-lilac/10 border-lilac/30",
    borderAccent: "border-lilac/40",
    tasks: [
      {
        id: "t2_1",
        title: "Build 24/7 AI Voice Assistant",
        desc: "Create an inbound call assistant on Retell AI that answers FAQs, qualifies leads, and books slots on Cal.com.",
        xp: 250,
        tools: ["Retell AI", "Cal.com", "Prompt Architecture"],
      },
      {
        id: "t2_2",
        title: "Deploy Website Lead Qualification Chatbot",
        desc: "Build a smart chatbot that scores incoming prospects and triggers instant notifications.",
        xp: 200,
        tools: ["Claude AI", "Webhooks", "Lead Scoring"],
      },
      {
        id: "t2_3",
        title: "Connect n8n Backend to CRM",
        desc: "Build no-code workflows that sync booked appointments to HubSpot or Google Sheets with SMS alerts.",
        xp: 200,
        tools: ["n8n", "Make.com", "HubSpot", "Twilio SMS"],
      },
      {
        id: "t2_4",
        title: "Record 3-Minute Demo Video (Loom)",
        desc: "Record a screen walkthrough calling your AI live — this will be your primary sales weapon.",
        xp: 200,
        tools: ["Loom", "Live Test Call"],
      },
    ],
  },
  {
    id: 3,
    title: "The Outbound Prospecting Engine",
    subtitle: "Scrape high-intent local business leads and launch automated cold outreach.",
    mrrTarget: "$0 → $2,000 / mo",
    badge: "STAGE 03 · PIPELINE",
    icon: Target,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    borderAccent: "border-emerald-500/40",
    tasks: [
      {
        id: "t3_1",
        title: "Scrape 300+ Verified Business Decision Makers",
        desc: "Extract direct phone numbers and verified emails of business owners in your target city using Clay.",
        xp: 250,
        tools: ["Clay", "Google Maps Scraper", "Apollo"],
      },
      {
        id: "t3_2",
        title: "Setup Cold Outreach Inboxes & Domain Warming",
        desc: "Setup secondary sending inboxes and warm them up to ensure 98%+ inbox delivery rates.",
        xp: 200,
        tools: ["Instantly / Smartlead", "Email Warming"],
      },
      {
        id: "t3_3",
        title: "Launch Claude 1:1 Personalized Email Sequence",
        desc: "Deploy a 3-step value-first email campaign sending tailored Loom audit videos to prospects.",
        xp: 300,
        tools: ["Claude AI", "Cold Email", "Video Audit"],
      },
      {
        id: "t3_4",
        title: "Book 5 Discovery Calls",
        desc: "Handle incoming replies, answer initial questions, and secure discovery audit meetings.",
        xp: 350,
        tools: ["Calendar Booking", "Direct Messaging"],
      },
    ],
  },
  {
    id: 4,
    title: "Close Your First $2,000 Client",
    subtitle: "Run the discovery audit, demonstrate live AI on their phone, and secure your wire.",
    mrrTarget: "$2,000 / mo",
    badge: "STAGE 04 · FIRST WIRE",
    icon: DollarSign,
    accent: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    borderAccent: "border-amber-400/40",
    tasks: [
      {
        id: "t4_1",
        title: "Conduct the Discovery & Cost Audit",
        desc: "Walk the business owner through missed call calculations and human receptionist cost comparisons ($3,500/mo).",
        xp: 350,
        tools: ["Audit Framework", "Discovery Deck"],
      },
      {
        id: "t4_2",
        title: "Execute the Live Interactive Demo",
        desc: "Call your AI Assistant live on speakerphone using their actual company services & pricing.",
        xp: 400,
        tools: ["Live Speaker Call", "Live Demo"],
      },
      {
        id: "t4_3",
        title: "Send $2,000 Setup + $600/mo Retainer Agreement",
        desc: "Issue standard service agreement and collect 50% upfront deposit or full payment.",
        xp: 500,
        tools: ["DocuSign", "Stripe / Ziina / Bank Wire"],
      },
      {
        id: "t4_4",
        title: "Client Onboarding & Twilio Live Number Handover",
        desc: "Provision their dedicated business number, configure call forwarding, and launch system into production.",
        xp: 400,
        tools: ["Client Handover", "Twilio Porting", "Production Launch"],
      },
    ],
  },
  {
    id: 5,
    title: "Scale to $10,000 / Month (MRR)",
    subtitle: "Stack 5 recurring retainers and build standardized fulfillment SOPs.",
    mrrTarget: "$10,000 / mo",
    badge: "STAGE 05 · SCALE-UP",
    icon: TrendingUp,
    accent: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    borderAccent: "border-cyan-400/40",
    tasks: [
      {
        id: "t5_1",
        title: "Collect Video Case Study & Testimonial",
        desc: "Interview your first client on how many leads and appointments the AI saved them.",
        xp: 350,
        tools: ["Testimonial Framework", "Case Study Deck"],
      },
      {
        id: "t5_2",
        title: "Add AI Database Reactivation as an Upsell",
        desc: "Run automated SMS reactivation campaigns across cold client databases for a $1,000 bonus fee.",
        xp: 400,
        tools: ["SMS Reactivations", "High-Volume Campaigns"],
      },
      {
        id: "t5_3",
        title: "Close 4 Additional Retainer Clients ($5K–$10K MRR)",
        desc: "Leverage proof of work to consistently close 1 new client every 2 weeks.",
        xp: 600,
        tools: ["Client Compounding", "Referral Flywheel"],
      },
    ],
  },
  {
    id: 6,
    title: "The $50K/mo Agency Empire",
    subtitle: "Hire contractors, run performance ads, and secure enterprise contracts.",
    mrrTarget: "$50,000 / mo",
    badge: "STAGE 06 · TOP 1% EMPIRE",
    icon: Crown,
    accent: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    borderAccent: "border-purple-400/40",
    tasks: [
      {
        id: "t6_1",
        title: "Hire Fulfillment Engineer / VA",
        desc: "Delegate n8n and Retell prompt setups to a trained builder so your time is 100% focused on sales.",
        xp: 500,
        tools: ["Agency Delegation", "Standard Operating Procedures"],
      },
      {
        id: "t6_2",
        title: "Launch Paid Meta/LinkedIn Ad Funnel",
        desc: "Run targeted case study video ads to local business owners to book inbound discovery calls on autopilot.",
        xp: 600,
        tools: ["Meta Ads", "Inbound Funnel"],
      },
      {
        id: "t6_3",
        title: "Close Multi-Location / Franchise Retainer ($15K+ Deals)",
        desc: "Deploy AI Call Assistants across 10+ franchise branches on custom enterprise pricing.",
        xp: 800,
        tools: ["Enterprise Deals", "Franchise Contracts"],
      },
    ],
  },
];

const RANKS = [
  { minXP: 0, title: "Novice Builder", icon: Zap, color: "text-zinc-400" },
  { minXP: 500, title: "System Architect", icon: Workflow, color: "text-lilac" },
  { minXP: 1200, title: "Outbound Hunter", icon: Target, color: "text-emerald-400" },
  { minXP: 2200, title: "Deal Closer ($2K Earned)", icon: DollarSign, color: "text-amber-400" },
  { minXP: 3500, title: "Agency Operator ($10K MRR)", icon: TrendingUp, color: "text-cyan-400" },
  { minXP: 5000, title: "AAA Agency Tycoon ($50K MRR)", icon: Crown, color: "text-volt" },
];

export function ProgressPage() {
  // Authentication / Unlock State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem("afh_aaa_unlocked") === "true";
    } catch {
      return false;
    }
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Load completed tasks from localStorage
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("afh_aaa_progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeLevelTab, setActiveLevelTab] = useState<number>(1);
  const [showCelebration, setShowCelebration] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("afh_aaa_progress", JSON.stringify(completedTasks));
    } catch {
      // ignore
    }
  }, [completedTasks]);

  // Handle Login Authentication
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === "aifounderhub" && passwordInput === "Wegrowtogether@yo1") {
      setIsUnlocked(true);
      try {
        localStorage.setItem("afh_aaa_unlocked", "true");
      } catch {
        // ignore
      }
      setLoginModalOpen(false);
      setAuthError(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setAuthError("Invalid username or password. Please try again.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Lock member stages again?")) {
      setIsUnlocked(false);
      try {
        localStorage.removeItem("afh_aaa_unlocked");
      } catch {
        // ignore
      }
      if (activeLevelTab > 1) {
        setActiveLevelTab(1);
      }
    }
  };

  // Calculate stats
  const allTasks = ROADMAP_LEVELS.flatMap((lvl) => lvl.tasks);
  const totalTasksCount = allTasks.length;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalTasksCount) * 100) || 0;

  // Calculate XP
  const currentXP = allTasks.reduce((sum, task) => {
    return completedTasks[task.id] ? sum + task.xp : sum;
  }, 0);

  const totalPossibleXP = allTasks.reduce((sum, task) => sum + task.xp, 0);

  // Calculate current rank
  const currentRank = [...RANKS].reverse().find((r) => currentXP >= r.minXP) || RANKS[0];

  // Estimated MRR calculation
  const getEstimatedMRR = () => {
    if (completedTasks["t6_3"]) return "$50,000 / mo";
    if (completedTasks["t5_3"]) return "$10,000 / mo";
    if (completedTasks["t4_3"]) return "$2,000 / mo";
    if (completedTasks["t3_4"]) return "Pipeline Active";
    return "$0 / mo";
  };

  const toggleTask = (id: string, stageId: number) => {
    if (stageId > 1 && !isUnlocked) {
      setLoginModalOpen(true);
      return;
    }

    setCompletedTasks((prev) => {
      const isChecking = !prev[id];
      const next = { ...prev, [id]: isChecking };
      if (isChecking) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2500);
      }
      return next;
    });
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress checklist?")) {
      setCompletedTasks({});
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07070c] text-zinc-100 font-sans selection:bg-volt selection:text-void pb-24">
      {/* Background Gradients & Effects */}
      <div className="pointer-events-none fixed inset-0 bg-grid-dark opacity-30" />
      <div
        className="pointer-events-none fixed left-1/4 top-0 h-[60vh] w-[50vw] rounded-full blur-[180px]"
        style={{ background: "rgba(204,242,68,0.06)" }}
      />
      <div
        className="pointer-events-none fixed right-10 bottom-10 h-[50vh] w-[40vw] rounded-full blur-[160px]"
        style={{ background: "rgba(181,161,255,0.06)" }}
      />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070c]/85 backdrop-blur-xl px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" className="transition-opacity hover:opacity-85">
              <Wordmark />
            </a>
            <span className="hidden sm:inline-block h-4 w-px bg-white/15" />
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              <span>AAA Accelerator Game Map</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 font-mono text-xs font-bold text-emerald-400 transition hover:bg-emerald-900/50 cursor-pointer"
              >
                <Unlock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Member Access Active</span>
                <span className="text-zinc-400 hover:text-white ml-1">· Logout</span>
              </button>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-volt/30 bg-volt px-3.5 py-2 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_20px_rgba(204,242,68,0.25)] hover:shadow-[0_0_35px_rgba(204,242,68,0.5)] transition cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Member Login</span>
              </button>
            )}

            <a
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Return Home
            </a>
            <button
              onClick={resetProgress}
              title="Reset progress checklist"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main HUD Dashboard */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-12">
        {/* Title & Introduction */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-volt mb-3"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Paid Member Progress Tracker</span>
          </motion.div>

          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            The AAA Roadmap: <span className="text-volt">Zero to $50,000/mo</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Your gamified execution roadmap. Stage 1 is open for free preview. Unlock Stages 2–6 with your paid member access.
          </p>
        </div>

        {/* Player Stats Bar (HUD) */}
        <div className="mb-12 rounded-3xl border border-volt/25 bg-[#0e0e18]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-volt/10 blur-[80px]" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center border-b border-white/10 pb-6 mb-6">
            {/* Rank Status */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Current Rank
              </span>
              <div className="flex items-center gap-2">
                <currentRank.icon className={`h-5 w-5 ${currentRank.color}`} />
                <span className="font-display text-lg sm:text-xl font-extrabold uppercase text-white tracking-tight">
                  {currentRank.title}
                </span>
              </div>
            </div>

            {/* Total XP Earned */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Builder XP Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-black text-volt">
                  {currentXP.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-zinc-500">/ {totalPossibleXP.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Milestones Completed */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Quests Completed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl sm:text-3xl font-black text-white">
                  {completedCount}
                </span>
                <span className="font-mono text-xs text-zinc-500">/ {totalTasksCount} milestones</span>
              </div>
            </div>

            {/* Current Target MRR */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Agency Revenue Status
              </span>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-emerald-400">
                  {getEstimatedMRR()}
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider">Overall AAA Roadmap Completion</span>
              <span className="text-volt font-black">{progressPercent}% UNLOCKED</span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-void border border-white/10 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-volt via-[#d4fa4c] to-emerald-400 shadow-[0_0_20px_rgba(204,242,68,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Level Navigation Tabs (Stage 1 to 6) */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ROADMAP_LEVELS.map((lvl) => {
            const isTabActive = activeLevelTab === lvl.id;
            const lvlTasks = lvl.tasks;
            const lvlCompleted = lvlTasks.filter((t) => completedTasks[t.id]).length;
            const isLvlDone = lvlCompleted === lvlTasks.length && lvlTasks.length > 0;
            const isLocked = lvl.id > 1 && !isUnlocked;

            return (
              <button
                key={lvl.id}
                onClick={() => setActiveLevelTab(lvl.id)}
                className={`relative flex flex-shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 cursor-pointer ${
                  isTabActive
                    ? "border-volt/50 bg-volt/10 text-white shadow-[0_0_30px_rgba(204,242,68,0.12)]"
                    : "border-white/8 bg-[#0e0e16]/80 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${
                    isLocked
                      ? "bg-white/5 text-zinc-500 border border-white/5"
                      : isLvlDone
                      ? "bg-emerald-500 text-void font-bold"
                      : isTabActive
                      ? "bg-volt text-void font-bold"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {isLocked ? <Lock className="h-3.5 w-3.5" /> : isLvlDone ? <Check className="h-4 w-4 stroke-[3]" /> : `0${lvl.id}`}
                </span>
                <div>
                  <div className="font-display text-xs font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
                    <span>Stage {lvl.id}</span>
                    <span className="font-mono text-[11px] font-extrabold text-volt">
                      {lvl.mrrTarget}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] mt-0.5 flex items-center gap-1.5">
                    {isLocked ? (
                      <span className="text-zinc-400 flex items-center gap-1 font-semibold">
                        <Lock className="h-2.5 w-2.5 text-amber-400" />
                        <span>Locked</span>
                        <span className="text-zinc-600">· Paid Member</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500">{lvlCompleted} / {lvlTasks.length} Done</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Quests Panel */}
        <AnimatePresence mode="wait">
          {ROADMAP_LEVELS.filter((l) => l.id === activeLevelTab).map((stage) => {
            const isStageLocked = stage.id > 1 && !isUnlocked;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-3xl border border-white/10 bg-[#0c0c16]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-md overflow-hidden"
              >
                {/* Locked Stage Overlay State */}
                {isStageLocked && (
                  <div className="absolute inset-0 z-30 bg-[#07070c]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="max-w-md space-y-4"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-volt/30 bg-volt/10 text-volt shadow-[0_0_40px_rgba(204,242,68,0.2)]">
                        <Lock className="h-8 w-8" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                          Stage {stage.id} · Locked Milestone
                        </span>
                        <h3 className="font-display text-2xl font-black uppercase text-white mt-1">
                          Paid Member Roadmap Access
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                          Stages 2 through 6 contain the exact system blueprints, outbound campaigns, and scaling frameworks. Enter your member credentials to unlock full access.
                        </p>
                      </div>

                      <button
                        onClick={() => setLoginModalOpen(true)}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_30px_rgba(204,242,68,0.3)] hover:shadow-[0_0_50px_rgba(204,242,68,0.55)] active:scale-95 transition cursor-pointer"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Unlock With Member Login</span>
                      </button>

                      <p className="font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider">
                        Not a paid member yet? <a href="/#membership" className="text-volt underline">Enroll in AAA Accelerator</a>
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Stage Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                  <div className="flex items-start gap-4">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${stage.accent}`}>
                      <stage.icon className="h-7 w-7" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                          {stage.badge}
                        </span>
                        <span className="rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                          Target MRR: {stage.mrrTarget}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
                        {stage.title}
                      </h2>
                      <p className="text-sm text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  {stage.tasks.map((task, idx) => {
                    const isDone = !!completedTasks[task.id];

                    return (
                      <motion.div
                        key={task.id}
                        onClick={() => toggleTask(task.id, stage.id)}
                        whileHover={{ scale: 1.008 }}
                        whileTap={{ scale: 0.995 }}
                        className={`group flex items-start sm:items-center justify-between gap-4 rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer ${
                          isDone
                            ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_20px_rgba(52,211,153,0.06)]"
                            : "border-white/8 bg-panel/60 hover:border-white/20 hover:bg-panel"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-4 flex-1">
                          {/* Interactive Checkbox */}
                          <div
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                              isDone
                                ? "border-emerald-400 bg-emerald-400 text-void shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                : "border-white/20 bg-void/80 group-hover:border-volt"
                            }`}
                          >
                            {isDone && <Check className="h-4 w-4 stroke-[3]" />}
                          </div>

                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-zinc-500">0{idx + 1}.</span>
                              <h4
                                className={`font-display text-base font-bold uppercase tracking-tight transition-colors ${
                                  isDone ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-white"
                                }`}
                              >
                                {task.title}
                              </h4>
                              <span className="rounded-md border border-volt/20 bg-volt/5 px-2 py-0.5 font-mono text-[10px] font-bold text-volt">
                                +{task.xp} XP
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
                              {task.desc}
                            </p>

                            {task.tools && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
                                {task.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="rounded bg-white/[0.04] border border-white/5 px-2 py-0.5 font-mono text-[9.5px] text-zinc-400"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-zinc-500 group-hover:text-volt transition-colors">
                          <span>{isDone ? "Completed" : "Mark Done"}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Stage Navigation Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    disabled={stage.id === 1}
                    onClick={() => setActiveLevelTab((prev) => Math.max(1, prev - 1))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono font-semibold text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    ← Previous Stage
                  </button>

                  <div className="text-center font-mono text-xs text-zinc-500 hidden sm:block">
                    Stage {stage.id} of {ROADMAP_LEVELS.length}
                  </div>

                  <button
                    disabled={stage.id === ROADMAP_LEVELS.length}
                    onClick={() => setActiveLevelTab((prev) => Math.min(ROADMAP_LEVELS.length, prev + 1))}
                    className="flex items-center gap-2 rounded-xl bg-volt px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wider text-void disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#d4fa4c] transition cursor-pointer"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      {/* Member Login Modal for Unlocking Stages 2-6 */}
      <AnimatePresence>
        {loginModalOpen && (
          <>
            <motion.div
              key="login-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md"
              onClick={() => setLoginModalOpen(false)}
            />

            <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
              <motion.div
                key="login-box"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                className="relative w-full max-w-md rounded-3xl border border-volt/30 bg-[#0e0e18] p-7 shadow-2xl overflow-hidden"
              >
                <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-volt/10 blur-[60px]" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt/10 border border-volt/20 text-volt">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-volt">
                      Member Authentication
                    </span>
                    <h3 className="font-display text-xl font-extrabold uppercase text-white">
                      Unlock All Stages
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                  Enter your credentials to unlock Stages 2 through 6 of the AAA Accelerator execution game.
                </p>

                {authError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Username
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Username"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/50 focus:bg-white/8"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Password
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="Password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/50 focus:bg-white/8"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] hover:shadow-[0_0_40px_rgba(204,242,68,0.5)] transition active:scale-95 cursor-pointer mt-2"
                  >
                    Unlock Stages 2–6 →
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(false)}
                    className="w-full text-center font-mono text-xs text-zinc-500 hover:text-zinc-300 transition mt-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Celebration Notification Toast */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-volt/50 bg-[#0e0e18] px-5 py-4 shadow-[0_0_50px_rgba(204,242,68,0.3)] text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt text-void font-bold">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="font-display text-xs font-extrabold uppercase text-volt">
                {isUnlocked ? "All Stages Unlocked!" : "Quest Progress Saved!"}
              </p>
              <p className="text-xs text-zinc-300 font-medium">Keep executing towards your next client wire.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
