import React, { useState, useEffect, useCallback } from "react";
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
  LogOut,
  Loader2,
  ShieldAlert,
  KeyRound,
  LogIn,
  FolderOpen,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Map,
  Settings,
  Play,
  ShoppingCart,
  User,
  RefreshCw,
  Star,
  BadgeCheck,
  Share2,
} from "lucide-react";
import { Wordmark } from "../components/shared";
import { AuthModal } from "../components/AuthModal";
import { LockedStageModal } from "../components/LockedStageModal";
import { PaymentModal } from "../components/PaymentModal";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../lib/auth";
import { initiateZiinaPayment } from "../lib/api";
import { AffiliatePanel } from "../components/affiliate/AffiliatePanel";
import type { ZiinaPaymentResult } from "../lib/api";
import { supabase } from "../lib/supabase";

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
  { minXP: 5000, title: "AAA Agency Tycoon ($50K MRR)", icon: Crown, color: "text-volt" },
];

export function ProgressPage() {
  // ─── Supabase Auth ──────────────────────────────────────────────────────────
  const { user, loading: authLoading, hasAccess, hasRoadmapAccess, hasClaudeAccess, accessLoading } = useAuth();
  const isUnlocked = hasRoadmapAccess;
  const isClaudeUnlocked = hasClaudeAccess;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeLevelTab, setActiveLevelTab] = useState<number>(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [progressSyncing, setProgressSyncing] = useState(false);
  // Dashboard top-level tab
  const [dashTab, setDashTab] = useState<'courses' | 'roadmap' | 'affiliate' | 'settings'>('courses');
  const [claudePayLoading, setClaudePayLoading] = useState(false);
  const [claudePayError, setClaudePayError] = useState<string | null>(null);

  // ─── Progress State ─────────────────────────────────────────────────────────
  // Starts from localStorage for instant render; syncs with Supabase when authed
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("afh_aaa_progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Mirror to localStorage always
  useEffect(() => {
    try {
      localStorage.setItem("afh_aaa_progress", JSON.stringify(completedTasks));
    } catch { /* ignore */ }
  }, [completedTasks]);

  // ─── Cloud Progress Sync ────────────────────────────────────────────────────
  // Load cloud progress when user logs in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('task_id, completed')
          .eq('user_id', user.id);
        if (error || cancelled) return;
        if (data && data.length > 0) {
          const cloudTasks: Record<string, boolean> = {};
          data.forEach((row: { task_id: string; completed: boolean }) => {
            cloudTasks[row.task_id] = row.completed;
          });
          setCompletedTasks(cloudTasks);
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Save a single task toggle to Supabase
  const saveTaskToCloud = useCallback(async (taskId: string, completed: boolean) => {
    if (!user) return;
    try {
      await supabase.from('user_progress').upsert(
        { user_id: user.id, task_id: taskId, completed },
        { onConflict: 'user_id,task_id' }
      );
    } catch { /* ignore — localStorage is the fallback */ }
  }, [user]);

  // ─── Auth Actions ───────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (window.confirm("Sign out and lock member stages?")) {
      await signOut();
      if (activeLevelTab > 1) setActiveLevelTab(1);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // ─── Tab Selection & Gating ─────────────────────────────────────────────────
  const handleSelectTab = (lvlId: number) => {
    setActiveLevelTab(lvlId);
    if (lvlId > 1 && !isUnlocked) {
      setLockedModalOpen(true);
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const allTasks = ROADMAP_LEVELS.flatMap((lvl) => lvl.tasks);
  const totalTasksCount = allTasks.length;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalTasksCount) * 100) || 0;

  const currentXP = allTasks.reduce((sum, task) => {
    return completedTasks[task.id] ? sum + task.xp : sum;
  }, 0);
  const totalPossibleXP = allTasks.reduce((sum, task) => sum + task.xp, 0);
  const currentRank = [...RANKS].reverse().find((r) => currentXP >= r.minXP) || RANKS[0];

  const getEstimatedMRR = () => {
    if (completedTasks["t6_3"]) return "$50,000 / mo";
    if (completedTasks["t5_3"]) return "$10,000 / mo";
    if (completedTasks["t4_3"]) return "$2,000 / mo";
    if (completedTasks["t3_4"]) return "Pipeline Active";
    return "$0 / mo";
  };

  // ─── Task Toggle ────────────────────────────────────────────────────────────
  const toggleTask = (id: string, stageId: number) => {
    // If not authenticated, require email / Google login even for Stage 1 free preview
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // If attempting Stage 2-6 without paid membership
    if (stageId > 1 && !isUnlocked) {
      setLockedModalOpen(true);
      return;
    }

    setCompletedTasks((prev) => {
      const isChecking = !prev[id];
      const next = { ...prev, [id]: isChecking };
      if (isChecking) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2500);
      }
      saveTaskToCloud(id, isChecking);
      return next;
    });
  };

  const resetProgress = async () => {
    if (window.confirm("Are you sure you want to reset your progress checklist?")) {
      setCompletedTasks({});
      if (user) {
        try {
          await supabase.from('user_progress').delete().eq('user_id', user.id);
        } catch { /* ignore */ }
      }
    }
  };

  // ─── Loading screen ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070c]">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-volt" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    );
  }

  const activeStageObj = ROADMAP_LEVELS.find((l) => l.id === activeLevelTab) || ROADMAP_LEVELS[0];

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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070c]/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {/* Left Brand & Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="/" className="transition-opacity hover:opacity-85 flex items-center">
              <Wordmark />
            </a>
            <span className="hidden md:inline-block h-4 w-px bg-white/15" />
            <div className="hidden md:flex h-9 items-center gap-2 rounded-xl border border-volt/30 bg-volt/10 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AAA Accelerator Game Map</span>
            </div>
          </div>

          {/* Right Action Buttons & Badges (Uniform h-9 single row) */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
            {user ? (
              <>
                {/* Resources Dropdown */}
                <div className="relative group/res">
                  <button
                    type="button"
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-volt/35 bg-volt/10 px-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-volt transition hover:bg-volt hover:text-void hover:shadow-[0_0_20px_rgba(204,242,68,0.3)] cursor-pointer"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Resources</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover/res:rotate-180" />
                  </button>

                  {/* Dropdown Card */}
                  <div className="invisible opacity-0 translate-y-2 group-hover/res:visible group-hover/res:opacity-100 group-hover/res:translate-y-0 transition-all duration-200 ease-out absolute right-0 top-full pt-2 z-50 pointer-events-none group-hover/res:pointer-events-auto">
                    <div className="w-80 rounded-2xl border border-volt/30 bg-[#0e0e18]/95 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl relative overflow-hidden text-left">
                      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-volt/10 blur-[40px]" />

                      <a
                        href="https://drive.google.com/drive/folders/1RWIfJyVNdDZC9lbwmWgryDLS1Ip8jssC?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-start gap-3 rounded-xl border border-white/10 bg-panel/80 p-3 transition-all duration-200 hover:border-volt/50 hover:bg-volt/[0.08] cursor-pointer"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-volt/30 bg-volt/15 text-volt group-hover/item:bg-volt group-hover/item:text-void transition-colors">
                          <FolderOpen className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-display text-xs font-black uppercase tracking-tight text-white group-hover/item:text-volt transition-colors truncate">
                              Resources Link (29th Aug)
                            </span>
                            <ExternalLink className="h-3 w-3 text-zinc-400 group-hover/item:text-volt shrink-0 transition-colors" />
                          </div>
                          <p className="font-mono text-[10px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                            Google Drive folder with live masterclass workflows, templates &amp; assets.
                          </p>
                          <div className="mt-2 flex items-center gap-1.5 font-mono text-[9.5px] font-extrabold uppercase text-volt">
                            <span>Open Google Drive</span>
                            <span>→</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* User email badge */}
                <div className="hidden lg:flex h-9 items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="font-mono text-[11px] font-bold text-emerald-400 max-w-[140px] truncate">
                    {user.email}
                  </span>
                  {accessLoading && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
                </div>

                {/* Member access badge */}
                {isUnlocked && (
                  <div className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 font-mono text-xs font-bold text-emerald-400">
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Member Access Active</span>
                  </div>
                )}

                {/* Sign Out button */}
                <button
                  onClick={handleLogout}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 font-mono text-xs font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-volt/30 bg-volt px-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_20px_rgba(204,242,68,0.25)] hover:shadow-[0_0_35px_rgba(204,242,68,0.5)] transition cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Member Login</span>
              </button>
            )}

            {/* Return Home button */}
            <a
              href="/"
              className="flex h-9 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3.5 font-mono text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Return Home
            </a>

            {/* Reset Progress button */}
            <button
              onClick={resetProgress}
              title="Reset progress checklist"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main HUD Dashboard or Login Gate */}
      {!user ? (
        <main className="relative z-10 mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-volt mb-4"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Free &amp; Paid Member Access</span>
            </motion.div>

            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Access Your <span className="text-volt">Roadmap Dashboard</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Create a free account or sign in to track your XP, unlock Stage 1 Free Preview, and save your progress to the cloud.
            </p>
          </div>

          {/* Inline Login / Sign-up Card */}
          <div className="max-w-md mx-auto rounded-3xl border border-volt/25 bg-[#0e0e18]/95 p-6 sm:p-8 shadow-[0_0_80px_rgba(204,242,68,0.12)] relative overflow-hidden backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-volt/10 blur-[60px]" />

            <div className="space-y-4">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] hover:shadow-[0_0_40px_rgba(204,242,68,0.55)] active:scale-95 transition cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Login or Sign Up with Google / Email →</span>
              </button>

              <div className="pt-4 border-t border-white/8 space-y-2.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-center mb-3">
                  ⚡ Included With Free Account:
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt font-bold text-[10px]">✓</div>
                  <span>Full Stage 1 Free Preview (Niche &amp; AI Sandboxes)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt font-bold text-[10px]">✓</div>
                  <span>Cloud XP &amp; Checklist Progress Sync</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt font-bold text-[10px]">✓</div>
                  <span>Gamified Agency Rank progression from Novice to Tycoon</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Main HUD Dashboard for Authenticated Users */
        <main className="relative z-10 mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">

          {/* ── Dashboard Header ─────────────────────────────────────── */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-volt/15 text-volt border border-volt/30">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-volt">Member Dashboard</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Welcome Back<span className="text-volt">,</span> Builder
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
            </div>
            {/* Quick stats */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/8 bg-[#0e0e18]/80 px-4 py-2.5 text-center">
                <div className="font-display text-lg font-black text-volt">{currentXP.toLocaleString()}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">XP Earned</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#0e0e18]/80 px-4 py-2.5 text-center">
                <div className="font-display text-lg font-black text-white">{completedCount}<span className="text-zinc-500 text-xs">/{totalTasksCount}</span></div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Quests Done</div>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-2.5 text-center">
                <div className="font-display text-lg font-black text-emerald-400">{progressPercent}%</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Complete</div>
              </div>
            </div>
          </div>

          {/* ── 3-Tab Nav ───────────────────────────────────────────── */}
          <div className="mb-8 flex items-center gap-1 rounded-2xl border border-white/8 bg-[#0b0b14]/80 p-1.5 w-fit">
            {([
              { id: 'courses',   label: 'Courses',   icon: BookOpen },
              { id: 'roadmap',   label: 'RoadMap',   icon: Map },
              { id: 'affiliate', label: 'Affiliate', icon: Share2 },
              { id: 'settings',  label: 'Settings',  icon: Settings },
            ] as { id: 'courses'|'roadmap'|'affiliate'|'settings'; label: string; icon: React.ElementType }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setDashTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  dashTab === tab.id
                    ? 'bg-volt text-void shadow-[0_0_20px_rgba(204,242,68,0.3)]'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              TAB: COURSES
          ══════════════════════════════════════════════════════════ */}
          {dashTab === 'courses' && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">Your Courses</h2>
                <p className="text-xs text-zinc-500 mt-1">Continue learning or unlock new courses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── Card 1: Road to $50K ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="group relative rounded-3xl border border-volt/30 bg-[#0d0d16]/90 overflow-hidden shadow-[0_0_40px_rgba(204,242,68,0.07)] hover:shadow-[0_0_60px_rgba(204,242,68,0.15)] transition-all duration-300"
                >
                  {/* Glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-volt/10 blur-[60px]" />

                  {/* Top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-volt via-[#d4fa4c] to-emerald-400" />

                  <div className="p-7">
                    {/* Badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt">
                        <BadgeCheck className="h-3 w-3" /> Enrolled
                      </span>
                      <span className="font-mono text-[10px] text-zinc-600">6 Stages · 21 Quests</span>
                    </div>

                    {/* Icon + title */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-volt/30 bg-volt/10 text-volt">
                        <DollarSign className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-black uppercase tracking-tight text-white leading-tight">
                          Road to <span className="text-volt">$50K/mo</span>
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          The AAA Agency gamified roadmap. Build, sell & scale your AI automation agency from $0.
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                        <span className="text-zinc-500 uppercase tracking-wider">Overall Progress</span>
                        <span className="text-volt font-bold">{progressPercent}% Done</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-void border border-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-volt to-emerald-400 transition-all duration-700"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono mt-1.5">
                        <span className="text-zinc-600">{completedCount} / {totalTasksCount} tasks complete</span>
                        <span className="text-zinc-600">{currentXP.toLocaleString()} XP</span>
                      </div>
                    </div>

                    {/* Stage summary chips */}
                    <div className="flex gap-1.5 flex-wrap mb-6">
                      {ROADMAP_LEVELS.map(lvl => {
                        const done = lvl.tasks.filter(t => completedTasks[t.id]).length;
                        const pct = Math.round((done / lvl.tasks.length) * 100);
                        return (
                          <div key={lvl.id} className={`rounded-lg border px-2.5 py-1 text-[10px] font-mono font-bold ${
                            pct === 100 ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400' :
                            pct > 0 ? 'border-volt/30 bg-volt/10 text-volt' :
                            'border-white/8 bg-white/[0.03] text-zinc-600'
                          }`}>
                            S{lvl.id} · {pct}%
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setDashTab('roadmap')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_20px_rgba(204,242,68,0.25)] hover:bg-[#d4fa4c] hover:shadow-[0_0_35px_rgba(204,242,68,0.45)] transition cursor-pointer active:scale-95"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Continue Roadmap
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>

                {/* ── Card 2: Master Claude ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="group relative rounded-3xl border border-[#a855f7]/30 bg-[#0d0d16]/90 overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.07)] hover:shadow-[0_0_60px_rgba(168,85,247,0.18)] transition-all duration-300"
                >
                  {/* Purple glow */}
                  <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-purple-500/10 blur-[60px]" />

                  {/* Top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-violet-400 to-pink-400" />

                  <div className="p-7">
                    {/* Price badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        <Star className="h-3 w-3" /> New Course
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-zinc-600 line-through">$175</span>
                        <span className="rounded-lg bg-volt px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-void">$45</span>
                      </div>
                    </div>

                    {/* Icon + title */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 text-purple-300">
                        <Bot className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-black uppercase tracking-tight text-white leading-tight">
                          Master <span className="text-purple-300">Claude</span>
                          <br />in 7 Days
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Go from zero to expert with Anthropic's Claude AI. Prompting, projects, and building real automations.
                        </p>
                      </div>
                    </div>

                    {/* What's included */}
                    <div className="mb-6 space-y-2">
                      {[
                        '7 daily structured modules',
                        'Prompt engineering mastery',
                        'Real automation projects',
                        'Lifetime access + updates',
                      ].map(item => (
                        <div key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px]">✓</div>
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Launch button */}
                    {isClaudeUnlocked ? (
                      <a
                        href="/claude-master-in-7-days"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/40 bg-purple-500/20 px-4 py-3 font-display text-xs font-extrabold uppercase tracking-wider text-purple-200 hover:bg-purple-500/30 transition cursor-pointer active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Start Course
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={async () => {
                            if (!user) { setAuthModalOpen(true); return; }
                            setClaudePayLoading(true);
                            setClaudePayError(null);
                            try {
                              const res: ZiinaPaymentResult = await initiateZiinaPayment({
                                fullName: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || 'Student',
                                email: user.email || '',
                                amount: 4500,
                                message: 'Master Claude in 7 Days — AI Founder Hub',
                                cancelPath: '/progress',
                                productCode: 'claude-master',
                              });
                              if (res.ok && res.redirect_url) {
                                window.location.href = res.redirect_url;
                              } else {
                                setClaudePayError(res.error ?? 'Payment failed. Please try again.');
                                setClaudePayLoading(false);
                              }
                            } catch {
                              setClaudePayError('Network error. Please try again.');
                              setClaudePayLoading(false);
                            }
                          }}
                          disabled={claudePayLoading}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 font-display text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.55)] transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {claudePayLoading
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                            : <><ShoppingCart className="h-3.5 w-3.5" /> Enroll Now — $45 <span className="opacity-60 line-through ml-1">$175</span></>}
                        </button>
                        {claudePayError && (
                          <p className="text-center text-[11px] text-red-400">{claudePayError}</p>
                        )}
                        <p className="text-center text-[10px] text-zinc-600">Secure checkout via Ziina · One-time payment</p>
                      </div>
                    )}
                  </div>
                </motion.div>

              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB: ROADMAP (existing content wrapped)
          ══════════════════════════════════════════════════════════ */}
          {dashTab === 'roadmap' && (<div>

          {/* Title */}
          <div className="mb-8 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-volt mb-3"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Paid Member Progress Tracker</span>
            </motion.div>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              The AAA Roadmap: <span className="text-volt">Zero to $50,000/mo</span>
            </h2>
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
                onClick={() => handleSelectTab(lvl.id)}
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
                {/* Free Preview Banner for Stage 1 if not logged in */}
                {stage.id === 1 && !user && (
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-volt/30 bg-volt/[0.06] p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-volt/10 text-volt border border-volt/20">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase font-display tracking-tight">Free Preview Mode</p>
                        <p className="text-zinc-400 text-[11.5px]">Enter your email to unlock Stage 1 tasks, track XP, and save progress.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="rounded-xl bg-volt px-4 py-2 font-display text-[11px] font-extrabold uppercase text-void hover:bg-[#d4fa4c] transition cursor-pointer shrink-0 active:scale-95"
                    >
                      Enter Email to Save Progress →
                    </button>
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

                {/* Stage Content: If Locked, show sleek in-view preview card; If Unlocked, show full interactive tasks */}
                {isStageLocked ? (
                  <div className="rounded-2xl border border-volt/20 bg-volt/[0.03] p-8 sm:p-12 text-center max-w-xl mx-auto my-2 relative overflow-hidden">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-volt/30 bg-volt/10 text-volt shadow-[0_0_40px_rgba(204,242,68,0.25)] mb-4">
                      <Lock className="h-7 w-7" />
                    </div>
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-volt">
                      Stage {stage.id} · Paid Milestone
                    </span>
                    <h3 className="font-display text-2xl font-black uppercase text-white mt-1 mb-2">
                      Paid Member Roadmap Access
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
                      {user ? (
                        <>You are signed in as <span className="text-volt font-bold">{user.email}</span>. Stages 2 through 6 contain the exact system blueprints, outbound campaigns, and scaling frameworks.</>
                      ) : (
                        <>Stages 2 through 6 contain the exact system blueprints, outbound campaigns, and scaling frameworks to reach $50,000/mo.</>
                      )}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => setPaymentModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-volt px-6 py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_30px_rgba(204,242,68,0.35)] hover:shadow-[0_0_50px_rgba(204,242,68,0.6)] active:scale-95 transition cursor-pointer"
                      >
                        <Zap className="h-4 w-4 fill-current" />
                        <span>Unlock All Stages ($1,500) →</span>
                      </button>
                      <button
                        onClick={() => setActiveLevelTab(1)}
                        className="w-full sm:w-auto rounded-full border border-white/15 bg-white/5 px-5 py-3.5 font-display text-xs font-bold uppercase text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        ← View Free Stage 1
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tasks List */
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
                )}

                {/* Stage Navigation Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    disabled={stage.id === 1}
                    onClick={() => handleSelectTab(Math.max(1, stage.id - 1))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono font-semibold text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    ← Previous Stage
                  </button>

                  <div className="text-center font-mono text-xs text-zinc-500 hidden sm:block">
                    Stage {stage.id} of {ROADMAP_LEVELS.length}
                  </div>

                  <button
                    disabled={stage.id === ROADMAP_LEVELS.length}
                    onClick={() => handleSelectTab(Math.min(ROADMAP_LEVELS.length, stage.id + 1))}
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
          </div>)}

          {/* ═══════════════════════════════════════════════════════════
              TAB: SETTINGS
          ══════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════
              TAB: AFFILIATE
          ══════════════════════════════════════════════════════════ */}
          {dashTab === 'affiliate' && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">Affiliate</h2>
                <p className="text-xs text-zinc-500 mt-1">Share what you are learning and earn on every sale you refer.</p>
              </div>
              <AffiliatePanel
                email={user?.email ?? ''}
                fullName={(user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || null}
              />
            </div>
          )}

          {dashTab === 'settings' && (
            <div className="max-w-xl">
              <div className="mb-6">
                <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">Account Settings</h2>
                <p className="text-xs text-zinc-500 mt-1">Manage your account and progress.</p>
              </div>

              <div className="space-y-4">
                {/* Profile Card */}
                <div className="rounded-2xl border border-white/10 bg-[#0e0e18]/80 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-white">
                        {(user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || 'Builder'}
                      </p>
                      <p className="font-mono text-xs text-zinc-500">{user?.email}</p>
                    </div>
                    <div className="ml-auto">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-[10px] font-bold text-emerald-400">
                          <Unlock className="h-3 w-3" /> Member Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-zinc-500">
                          <Lock className="h-3 w-3" /> Free Tier
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="rounded-2xl border border-white/10 bg-[#0e0e18]/80 p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Your Progress Stats</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="font-display text-2xl font-black text-volt">{currentXP.toLocaleString()}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">XP Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display text-2xl font-black text-white">{completedCount}/{totalTasksCount}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">Quests Done</div>
                    </div>
                    <div className="text-center">
                      <div className="font-display text-2xl font-black text-emerald-400">{progressPercent}%</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 mt-0.5">Complete</div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-void border border-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-volt to-emerald-400 transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-zinc-600 text-center">Current Rank: <span className="text-zinc-400 font-bold">{currentRank.title}</span></p>
                </div>

                {/* Actions */}
                <div className="rounded-2xl border border-white/10 bg-[#0e0e18]/80 p-5 space-y-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Actions</p>

                  <button
                    onClick={resetProgress}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 font-mono text-xs text-zinc-400 hover:bg-white/[0.07] hover:text-white transition cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4 text-amber-400" />
                    Reset Roadmap Progress
                    <span className="ml-auto text-zinc-600 text-[10px]">Cannot undo</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 font-mono text-xs text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
        )}

      {/* Member Auth Modal (Supabase Google OAuth + Email) */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Locked Stage Pop Up Modal */}
      <LockedStageModal
        open={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        stageNumber={activeStageObj.id}
        stageTitle={activeStageObj.title}
        stageTarget={activeStageObj.mrrTarget}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPayment={() => setPaymentModalOpen(true)}
      />

      {/* Payment / Checkout Modal ($159/mo AAA Accelerator) */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

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

