import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";

/* ————————————————————————————————————————————————
   EVENT CONSTANTS — single source of truth for dates
———————————————————————————————————————————————— */
export const EVENT = {
  badge: "JULY 17-19, 2026 (FRI-SUN)",
  shortRange: "July 17-19, 2026",
  day1: "Friday, July 17, 2026",
  day2: "Saturday, July 18, 2026",
  day3: "Sunday, July 19, 2026",
  fri_sat: "July 17-18, 2026",
  sun: "July 19, 2026",
  // 9AM PT on July 17, 2026 (PDT = UTC-7)
  countdownTarget: "2026-07-17T16:00:00Z",
};

export function scrollToRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// "Claim Free Seat" → Section 01: Free Workshops / Masterclass
export function scrollToWorkshops() {
  document.getElementById("workshops")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// "Start My AI Journey" → Section 02: Membership / Course
export function scrollToMembership() {
  document.getElementById("membership")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ————————————————————————————————————————————————
   Reveal — fade/slide-in when scrolled into view
———————————————————————————————————————————————— */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "40px" }}
      transition={{ duration: 0.5, delay: Math.min(delay, 0.25), ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ————————————————————————————————————————————————
   SectionTag — small mono eyebrow with index number
———————————————————————————————————————————————— */
export function SectionTag({
  index,
  label,
  tone = "volt",
}: {
  index: string;
  label: string;
  tone?: "volt" | "ink";
}) {
  const isInk = tone === "ink";
  return (
    <div
      className={`inline-flex items-center gap-3 font-mono text-[11px] font-bold tracking-[0.3em] uppercase ${
        isInk ? "text-ink/60" : "text-volt"
      }`}
    >
      <span
        className={`flex h-6 w-9 items-center justify-center rounded-full border text-[10px] ${
          isInk ? "border-ink/25" : "border-volt/35"
        }`}
      >
        {index}
      </span>
      <span>{label}</span>
      <span className={`h-px w-10 ${isInk ? "bg-ink/25" : "bg-volt/35"}`} />
    </div>
  );
}

/* ————————————————————————————————————————————————
   Magnetic — element follows the cursor slightly
———————————————————————————————————————————————— */
export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 180, damping: 16, mass: 0.4 }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setOffset({ x: x * strength, y: y * strength });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  );
}

/* ————————————————————————————————————————————————
   CountUp — number rolls up when scrolled into view
———————————————————————————————————————————————— */
export function CountUp({
  to,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      // ease-out-expo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ————————————————————————————————————————————————
   Brand marks — geometry copied from the AIFH logo kit
   (SVG/aifh-icon-*.svg, aifh-logo-*.svg). Never retype the
   logo in a font; change these only from new kit files.
———————————————————————————————————————————————— */
const BRAND = { void: "#07070B", volt: "#CCF244", mist: "#F4F4F5" };

/** The H icon in a rounded tile. "volt" for favicons and small tiles, "void" for avatars. */
export function LogoMark({ size = 34, variant = "volt" }: { size?: number; variant?: "volt" | "void" }) {
  const onVolt = variant === "volt";
  const ink = onVolt ? BRAND.void : BRAND.mist;
  return (
    <svg width={size} height={size} viewBox="133 -70 204 204" aria-hidden="true">
      <rect x="133" y="-70" width="204" height="204" rx="44.88" fill={onVolt ? BRAND.volt : BRAND.void} />
      <rect x="200" y="0" width="20" height="100" fill={ink} />
      <rect x="250" y="0" width="20" height="100" fill={ink} />
      <rect x="220" y="42" width="30" height="18" fill={onVolt ? BRAND.void : BRAND.volt} />
      <circle cx="210" cy="-24" r="12" fill={ink} />
      <circle cx="260" cy="-24" r="12" fill={ink} />
    </svg>
  );
}

/* ————————————————————————————————————————————————
   Squiggle — hand-drawn SVG underline that draws
   itself in when scrolled into view
———————————————————————————————————————————————— */
export function Squiggle({ color = "var(--color-volt)", delay = 0.3 }: { color?: string; delay?: number }) {
  return (
    <svg
      className="absolute -bottom-2 left-0 w-full"
      viewBox="0 0 220 14"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ height: "0.35em" }}
    >
      <motion.path
        d="M3 10 C 30 3, 55 12, 82 7 S 135 3, 162 8 S 200 10, 217 5"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/* ————————————————————————————————————————————————
   CircuitDivider — animated SVG circuit line that
   draws across the page between sections, with a
   pulse that travels along it forever after
———————————————————————————————————————————————— */
export function CircuitDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative mx-auto max-w-7xl px-5 md:px-10 ${flip ? "-scale-x-100" : ""}`} aria-hidden="true">
      <svg className="h-14 w-full" viewBox="0 0 1200 56" fill="none" preserveAspectRatio="none">
        <motion.path
          d="M0 28 H320 L350 8 H560 L590 48 H840 L870 28 H1200"
          stroke="var(--color-edge)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        {/* travelling pulse */}
        <path
          d="M0 28 H320 L350 8 H560 L590 48 H840 L870 28 H1200"
          stroke="var(--color-volt)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="60 1340"
          opacity="0.9"
        >
          <animate attributeName="stroke-dashoffset" values="1400;0" dur="5s" repeatCount="indefinite" />
        </path>
        {[
          { cx: 320, cy: 28 },
          { cx: 560, cy: 8 },
          { cx: 840, cy: 48 },
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill="var(--color-void)"
            stroke="var(--color-volt)"
            strokeWidth="2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.25, type: "spring", stiffness: 300, damping: 14 }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ————————————————————————————————————————————————
   OrbitRing — decorative SVG ring that slowly spins
   as the user scrolls (scroll-linked rotation)
———————————————————————————————————————————————— */
export function OrbitRing({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 240]);
  return (
    <motion.svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ rotate }}
    >
      <circle cx="100" cy="100" r="96" stroke="rgba(204,242,68,0.18)" strokeWidth="1" strokeDasharray="4 10" />
      <circle cx="100" cy="100" r="72" stroke="rgba(181,161,255,0.16)" strokeWidth="1" strokeDasharray="2 8" />
      <circle cx="196" cy="100" r="4" fill="var(--color-volt)" />
      <circle cx="100" cy="28" r="3" fill="var(--color-lilac)" />
      <circle cx="32" cy="140" r="2.5" fill="rgba(204,242,68,0.6)" />
    </motion.svg>
  );
}

/* ————————————————————————————————————————————————
   BackToTop — floating button with an SVG ring that
   fills with scroll progress
———————————————————————————————————————————————— */
export function BackToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const dashOffset = useTransform(progress, [0, 1], [113, 0]); // circumference of r=18
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.6, pointerEvents: visible ? "auto" : "none" }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-edge bg-panel/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-colors hover:border-volt/40 cursor-pointer"
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="18" stroke="var(--color-edge)" strokeWidth="2" fill="none" />
        <motion.circle
          cx="22"
          cy="22"
          r="18"
          stroke="var(--color-volt)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="113"
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <svg className="h-4 w-4 text-volt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </motion.button>
  );
}

/** The AIFH wordmark: the default logo for headers. `dark` = on a light background.
    Brand minimum is 80px wide, so keep height at 41 or more. */
export function Wordmark({ dark = false, height = 42 }: { dark?: boolean; height?: number }) {
  const ink = dark ? BRAND.void : BRAND.mist;
  // light-background version outlines the volt parts so they hold up on white
  const ring = dark ? { stroke: BRAND.void, strokeWidth: 4 } : {};
  return (
    <svg
      height={height}
      width={(height * 272) / 138}
      viewBox="-1 -37 272 138"
      role="img"
      aria-label="AI Founder Hub"
      className="block select-none"
    >
      <polygon points="0,100 26,0 46,0 72,100 52,100 36,38 20,100" fill={ink} />
      <rect x="20" y="62" width="32" height="16" fill={ink} />
      <rect x="88" y="0" width="20" height="100" fill={ink} />
      <circle cx="98" cy="-24" r="12" fill={BRAND.volt} {...ring} />
      <rect x="128" y="0" width="20" height="100" fill={ink} />
      <rect x="128" y="0" width="52" height="18" fill={ink} />
      <rect x="128" y="42" width="42" height="18" fill={ink} />
      <rect x="200" y="0" width="20" height="100" fill={ink} />
      <rect x="250" y="0" width="20" height="100" fill={ink} />
      {dark ? (
        <rect x="218" y="40" width="34" height="22" fill={BRAND.volt} {...ring} />
      ) : (
        <rect x="220" y="42" width="30" height="18" fill={BRAND.volt} />
      )}
      <circle cx="210" cy="-24" r="12" fill={ink} />
      <circle cx="260" cy="-24" r="12" fill={ink} />
    </svg>
  );
}
