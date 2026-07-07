import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Wordmark, scrollToRegister } from "./shared";

const LINKS = [
  { label: "FREE MASTERCLASS", target: "workshops" },
  { label: "COURSE", target: "membership" },
  // { label: "Summit", target: "curriculum" },
  // { label: "Bootcamp", target: "bootcamp" },
  { label: "1:1 Session", target: "mentors" },
  { label: "FAQ", target: "faq" },
];

export function Nav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-void/80 backdrop-blur-xl border-b border-edge shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* scroll progress hairline */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-volt via-lilac to-volt"
        style={{ scaleX: progress }}
      />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer"
          aria-label="Back to top"
        >
          <Wordmark />
        </button>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <button
              key={link.target}
              onClick={() => document.getElementById(link.target)?.scrollIntoView({ behavior: "smooth" })}
              className="group relative font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:text-white cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-volt transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            <span className="pulse-glow-dot inline-block h-1.5 w-1.5 rounded-full bg-volt" />
         
          </div>
          <button
            onClick={scrollToRegister}
            className="group flex items-center gap-1.5 rounded-full bg-volt px-4.5 py-2 font-display text-[12px] font-extrabold uppercase tracking-wide text-void transition-all duration-300 hover:shadow-[0_0_28px_rgba(204,242,68,0.45)] active:scale-95 cursor-pointer"
          >
            Claim Free Seat
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
