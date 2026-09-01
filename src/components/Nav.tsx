import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, LogIn, LayoutDashboard, Sparkles } from "lucide-react";
import { Wordmark, scrollToWorkshops } from "./shared";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";

const LINKS = [
  { label: "COURSES", target: "courses" },
  { label: "MASTERCLASS", target: "workshops" },
  { label: "ACCELERATOR", target: "membership" },
  { label: "FOUNDERS", target: "mentors" },
  { label: "TEAM", target: "team" },
  { label: "ROADMAP", href: "/progress", isBadge: true },
];

interface NavProps {
  onOpenClaudeModal?: () => void;
}

export function Nav({ onOpenClaudeModal }: NavProps) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, hasAccess } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClaimFreeSeat = () => {
    if (onOpenClaudeModal) {
      onOpenClaudeModal();
    } else {
      scrollToWorkshops();
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-void/90 backdrop-blur-xl border-b border-edge shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        {/* Banner 1: Free Masterclass */}
        <div 
          onClick={handleClaimFreeSeat}
          className="bg-volt px-4 py-1.5 text-center text-[10px] md:text-[11px] font-mono font-extrabold uppercase tracking-wider text-void flex items-center justify-center gap-2 relative z-10 shadow-sm border-b border-white/10 cursor-pointer hover:bg-opacity-95 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
        >
          <span className="truncate">⚡ FREE LIVE MASTERCLASS THIS SATURDAY (LIMITED SEATS) • BUILD &amp; SELL REAL AI AUTOMATION SYSTEMS • CLICK "CLAIM FREE SEAT"</span>
        </div>

        {/* Banner 2: Next Cohort Starting 20th September */}
        <div 
          onClick={() => {
            const el = document.getElementById("membership");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-[#0f0f18] border-b border-volt/25 px-4 py-1.5 text-center text-[10px] md:text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-center gap-2 relative z-10 cursor-pointer hover:text-white transition-colors whitespace-nowrap overflow-hidden text-ellipsis shadow-inner"
        >
          <span className="inline-flex items-center gap-1.5 text-volt font-black">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-volt opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-volt"></span>
            </span>
            NEXT COHORT:
          </span>
          <span className="truncate">
            STARTS 20TH SEPTEMBER • ENROLL IN AAA ACCELERATOR TO LAUNCH YOUR AGENCY • LIMITED SEATS • ENROLL NOW →
          </span>
        </div>

        {/* scroll progress hairline */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-volt via-lilac to-volt"
          style={{ scaleX: progress }}
        />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="cursor-pointer flex-shrink-0"
            aria-label="Back to top"
          >
            <Wordmark />
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-shrink-0">
            {LINKS.map((link) => {
              if (link.href) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="group relative flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-white whitespace-nowrap cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <span className="rounded-full bg-volt/15 border border-volt/30 px-1.5 py-0.2 text-[9px] font-extrabold text-volt">
                      $50K
                    </span>
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
                  </a>
                );
              }

              return (
                <button
                  key={link.target}
                  onClick={() => document.getElementById(link.target!)?.scrollIntoView({ behavior: "smooth" })}
                  className="group relative font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-white whitespace-nowrap cursor-pointer"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {user ? (
              <a
                href="/progress"
                className="group flex items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-3.5 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-volt transition-all duration-300 hover:bg-volt hover:text-void hover:shadow-[0_0_20px_rgba(204,242,68,0.35)] whitespace-nowrap active:scale-95"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
                {hasAccess && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] ml-0.5" />
                )}
              </a>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="group flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-zinc-300 transition-all duration-300 hover:border-volt/50 hover:bg-volt/10 hover:text-volt whitespace-nowrap active:scale-95 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={handleClaimFreeSeat}
              className="group flex items-center gap-1.5 rounded-full bg-volt px-4 py-1.5 font-display text-[11px] md:text-[11.5px] font-extrabold uppercase tracking-wider text-void transition-all duration-300 hover:shadow-[0_0_24px_rgba(204,242,68,0.45)] whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <span>Claim Free Seat</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          window.location.href = "/progress";
        }}
      />
    </>
  );
}


