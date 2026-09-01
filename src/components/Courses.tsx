import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  BookOpen,
  Bot,
  DollarSign,
  Star,
  Check,
  Lock,
  Play,
  Clock,
  Layers,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { Reveal, SectionTag } from "./shared";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../hooks/useAuth";

interface CourseItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: "volt" | "purple" | "emerald" | "amber";
  originalPrice?: string;
  currentPrice: string;
  priceNote?: string;
  description: string;
  highlights: string[];
  duration: string;
  level: string;
  icon: React.ElementType;
  route: string;
  featured?: boolean;
  comingSoon?: boolean;
}

const COURSES: CourseItem[] = [
  {
    id: "claude-master",
    title: "Master Claude in 7 Days",
    subtitle: "Two tracks — No-Code Operator or Claude Code Engineer",
    badge: "⚡ LIVE SHORT COURSE · 74% OFF",
    badgeTone: "purple",
    originalPrice: "$175",
    currentPrice: "$45",
    priceNote: "One-time payment · Lifetime access",
    description:
      "Updated for September 2026. Pick your track: run your business on the Claude app with Projects, Artifacts, Connectors, Skills and Cowork — no code at all — or go deep on Claude Code with CLAUDE.md, subagents, hooks and headless automation. Seven daily missions either way.",
    highlights: [
      "No-code track: Projects, Artifacts, Connectors, Skills, Cowork",
      "Developer track: CLAUDE.md, subagents, hooks, worktrees, headless",
      "Claude in Excel, Word, PowerPoint, Outlook, Chrome & Slack",
      "30+ copy-paste prompts, templates & the Operator Exam",
    ],
    duration: "7 Days Sprint",
    level: "Non-technical to Advanced",
    icon: Bot,
    route: "/claude-master-in-7-days",
    featured: true,
  },
  {
    id: "aaa-roadmap",
    title: "Road to $50K/mo AI Agency",
    subtitle: "The 6-Stage Gamified Agency Roadmap",
    badge: "🏆 FLAGSHIP BLUEPRINT",
    badgeTone: "volt",
    originalPrice: "$299/mo",
    currentPrice: "$159/mo",
    priceNote: "Includes AI Sandbox + Mentorship + All 6 Stages",
    description:
      "The comprehensive step-by-step accelerator to launch, scale, and automate a high-ticket AI automation agency from $0 to $50,000/mo. Stage 1 is 100% free to preview.",
    highlights: [
      "Stage 1 Free Preview (Niche selection & AI sandboxes)",
      "Retell AI & Vapi phone calling voice agents",
      "n8n & Make.com enterprise workflow pipelines",
      "Outbound lead scraping engine & $2,000+ closing scripts",
    ],
    duration: "6 Stages · 21 Quests",
    level: "All Levels",
    icon: DollarSign,
    route: "/progress",
    featured: false,
  },
];

export function Courses() {
  const { user, hasAccess, hasClaudeAccess, hasRoadmapAccess } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string>("/progress");

  const handleCourseClick = (course: CourseItem) => {
    if (user) {
      // User is logged in -> navigate directly to dashboard or course
      window.location.href = course.route;
    } else {
      // User is not logged in -> prompt signup/login and redirect to dashboard
      setTargetRoute(course.route);
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    // Take user directly to the dashboard upon successful auth
    window.location.href = targetRoute || "/progress";
  };

  return (
    <section
      id="courses"
      className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
    >
      {/* Background ambient glows */}
      <div
        className="pointer-events-none absolute left-1/2 top-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full blur-[140px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(204,242,68,0.15) 50%, transparent 80%)",
        }}
      />

      {/* Section Header */}
      <div className="mb-14 text-center max-w-3xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-volt mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Curated Short Courses &amp; Roadmaps</span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Level Up With <span className="text-volt">Practical AI Skills</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            High-impact tactical courses engineered for founders, operators, and builders. Sign up or log in to access your course dashboard and start executing.
          </p>
        </Reveal>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {COURSES.map((course, idx) => {
          const isClaude = course.id === "claude-master";
          const isRoadmap = course.id === "aaa-roadmap";
          const isUnlocked = isClaude
            ? hasClaudeAccess || hasAccess
            : isRoadmap
            ? hasRoadmapAccess || hasAccess
            : hasAccess;

          return (
            <Reveal key={course.id} delay={idx * 0.08}>
              <div
                className={`group relative flex flex-col justify-between h-full rounded-3xl border bg-[#0d0d16]/95 p-7 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 ${
                  course.featured
                    ? "border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:shadow-[0_0_70px_rgba(168,85,247,0.3)] hover:border-purple-400/70"
                    : "border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:border-volt/40 hover:shadow-[0_0_50px_rgba(204,242,68,0.15)]"
                }`}
              >
                {/* Top Accent Gradient Line */}
                <div
                  className={`absolute left-0 top-0 h-1.5 w-full rounded-t-3xl ${
                    isClaude
                      ? "bg-gradient-to-r from-purple-500 via-pink-400 to-volt"
                      : isRoadmap
                      ? "bg-gradient-to-r from-volt via-emerald-400 to-[#d4fa4c]"
                      : "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                  }`}
                />

                {/* Card Top */}
                <div>
                  {/* Badge & Meta */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                        isClaude
                          ? "border border-purple-400/40 bg-purple-500/15 text-purple-300"
                          : isRoadmap
                          ? "border border-volt/35 bg-volt/10 text-volt"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {course.badge}
                    </span>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border ${
                        isClaude
                          ? "border-purple-400/30 bg-purple-500/10 text-purple-300"
                          : isRoadmap
                          ? "border-volt/30 bg-volt/10 text-volt"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      <course.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                        {course.title}
                      </h3>
                      <p className="font-mono text-[11px] text-zinc-400 mt-1">
                        {course.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="mb-5 rounded-2xl border border-white/8 bg-[#07070c]/80 p-4">
                    <div className="flex items-baseline gap-2">
                      {course.originalPrice && (
                        <span className="font-mono text-sm text-zinc-500 line-through">
                          {course.originalPrice}
                        </span>
                      )}
                      <span
                        className={`font-display text-2xl sm:text-3xl font-black ${
                          isClaude ? "text-purple-300" : "text-volt"
                        }`}
                      >
                        {course.currentPrice}
                      </span>
                    </div>
                    {course.priceNote && (
                      <p className="mt-1 font-mono text-[10.5px] text-zinc-400">
                        {course.priceNote}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* Highlights List */}
                  <div className="space-y-2 mb-6 border-t border-white/8 pt-5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      What's Included:
                    </p>
                    {course.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                            isClaude
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-volt/15 text-volt"
                          }`}
                        >
                          ✓
                        </div>
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="pt-2 border-t border-white/8 mt-auto">
                  {course.comingSoon ? (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-500 cursor-not-allowed"
                    >
                      <span>Upcoming Next Cohort</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCourseClick(course)}
                      className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                        isClaude
                          ? "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_45px_rgba(168,85,247,0.6)]"
                          : "bg-volt text-void shadow-[0_0_25px_rgba(204,242,68,0.25)] hover:bg-[#d4fa4c] hover:shadow-[0_0_40px_rgba(204,242,68,0.45)]"
                      }`}
                    >
                      {user ? (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>
                            {isUnlocked ? "Continue Course" : "Access in Dashboard"}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Login &amp; View Course →</span>
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-center font-mono text-[10px] text-zinc-600 mt-2">
                    {user
                      ? "Instant sync with your dashboard"
                      : "Create a free account to track progress"}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
}
