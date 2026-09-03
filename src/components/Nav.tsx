import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, LogIn, LayoutDashboard, Menu, Sparkles, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, hasAccess } = useAuth();

  /* lock body scroll while the drawer is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* escape closes the drawer */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const goToSection = (target: string) => {
    setMenuOpen(false);
    requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }),
    );
  };

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
              className="group flex items-center gap-1.5 rounded-full bg-volt px-3.5 sm:px-4 py-1.5 font-display text-[10.5px] sm:text-[11px] md:text-[11.5px] font-extrabold uppercase tracking-wider text-void transition-all duration-300 hover:shadow-[0_0_24px_rgba(204,242,68,0.45)] whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <span className="hidden sm:inline">Claim Free Seat</span>
              <span className="sm:hidden">Free Seat</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            {/* burger — the whole nav was unreachable on mobile before this */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-200 transition-colors hover:border-volt/50 hover:text-volt lg:hidden cursor-pointer"
            >
              {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
        {/* ─────────── mobile drawer ─────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-edge bg-void/98 backdrop-blur-xl lg:hidden"
            >
              <nav className="mx-auto max-w-7xl px-4 py-4">
                <div className="flex flex-col gap-1">
                  {LINKS.map((link) =>
                    link.href ? (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl border border-edge bg-white/[0.02] px-4 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-volt/40 hover:text-volt"
                      >
                        <span>{link.label}</span>
                        <span className="rounded-full border border-volt/30 bg-volt/15 px-2 py-0.5 text-[10px] font-extrabold text-volt">
                          $50K
                        </span>
                      </a>
                    ) : (
                      <button
                        key={link.target}
                        onClick={() => goToSection(link.target!)}
                        className="flex items-center justify-between rounded-xl border border-edge bg-white/[0.02] px-4 py-3.5 text-left font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-volt/40 hover:text-volt cursor-pointer"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600" />
                      </button>
                    ),
                  )}

                  <a
                    href="/claude-master-in-7-days"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-lilac/25 bg-lilac/[0.07] px-4 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-lilac transition-colors hover:border-lilac/50"
                  >
                    <span>Master Claude in 7 Days</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-edge pt-3">
                  {!user && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setAuthOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 font-display text-[12px] font-extrabold uppercase tracking-wider text-zinc-200 transition-colors hover:border-volt/50 hover:text-volt cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleClaimFreeSeat();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-volt py-3.5 font-display text-[12.5px] font-extrabold uppercase tracking-wider text-void active:scale-[0.98] cursor-pointer"
                  >
                    Claim Free Seat
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
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


