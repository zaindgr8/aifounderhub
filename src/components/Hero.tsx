import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Mail,
  User,
  ChevronDown,
  Check,
  ArrowRight,
  AlertCircle,
  Zap,
  ShieldCheck,
  Share2,
  Sparkles,
} from "lucide-react";
import { EVENT, Magnetic, OrbitRing, Squiggle, scrollToRegister } from "./shared";
import { captureLead } from "../lib/api";

/* ————————————————— country data ————————————————— */

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", dialCode: "+971" },
  { name: "United States", code: "US", flag: "🇺🇸", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dialCode: "+1" },
  { name: "India", code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", dialCode: "+966" },
  { name: "Qatar", code: "QA", flag: "🇶🇦", dialCode: "+974" },
  { name: "Kuwait", code: "KW", flag: "🇰🇼", dialCode: "+965" },
  { name: "Oman", code: "OM", flag: "🇴🇲", dialCode: "+968" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", dialCode: "+65" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dialCode: "+61" },
];

/* goal → pathway routing (feeds the CRM segmentation) */
const GOALS = [
  { id: "founder", label: "Launch a startup", pathway: "Founder Launch" },
  { id: "freelancer", label: "Become an AI freelancer", pathway: "Freelance Pro" },
  { id: "scaleup", label: "Scale my existing business", pathway: "Business Scale-Up" },
  { id: "agency", label: "Start an automation agency", pathway: "Automation Agency" },
  { id: "explore", label: "Just exploring AI", pathway: "Explorer (we'll guide you)" },
];



/* ————————————————— headline word animation ————————————————— */

function StaggerLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [done, setDone] = useState(false);
  return (
    <span className={`block pb-1 ${done ? "overflow-visible" : "overflow-hidden"}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setDone(true)}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ————————————————— interactive bits ————————————————— */

/* headline words that spring toward volt on hover */
function HoverWord({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      whileHover={{ scale: 1.06, rotate: -1.5, color: "#ccf244" }}
      transition={{ type: "spring", stiffness: 320, damping: 12 }}
      className="inline-block cursor-default will-change-transform"
    >
      {children}
    </motion.span>
  );
}

/* 3D tilt that follows the cursor, springs back on leave */
function TiltCard({ children }: { children: React.ReactNode }) {
  const rx = useSpring(0, { stiffness: 140, damping: 16 });
  const ry = useSpring(0, { stiffness: 140, damping: 16 });
  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        ry.set(px * 7);
        rx.set(-py * 7);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* rotating community-activity toast (placeholder names, like the testimonial wall) */
const TICKER = [
  { flag: "🇦🇪", text: "Sara from Dubai claimed a free seat" },
  { flag: "🇸🇦", text: "Omar matched to the Founder Launch pathway" },
  { flag: "🇮🇳", text: "Priya unlocked the courses membership" },
  { flag: "🇬🇧", text: "James booked a 1:1 with Zain" },
  { flag: "🇦🇪", text: "Fatima joined Dubai Build Night" },
  { flag: "🇺🇸", text: "Maya claimed a free summit seat" },
];

function JoinTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % TICKER.length), 3800);
    return () => clearInterval(id);
  }, []);
  const entry = TICKER[idx];
  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-20 hidden lg:block" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 18, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 rounded-full border border-edge bg-panel/90 px-4 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
          </span>
          <span className="text-base leading-none">{entry.flag}</span>
          <span className="text-[12px] font-semibold text-zinc-300">{entry.text}</span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-600">live</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* confetti burst when the ticket is issued */
const CONFETTI_COLORS = ["#ccf244", "#b5a1ff", "#ffffff", "#fb923c"];

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center" aria-hidden="true">
      {Array.from({ length: 26 }).map((_, i) => {
        const angle = (i / 26) * Math.PI * 2;
        const dist = 70 + (i % 4) * 30;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist * 0.8 + 50,
              opacity: 0,
              scale: 0.35,
              rotate: 160 + i * 24,
            }}
            transition={{ duration: 1.15 + (i % 3) * 0.18, ease: "easeOut" }}
            className="absolute h-2.5 w-1.5 rounded-[1px]"
            style={{ backgroundColor: CONFETTI_COLORS[i % 4] }}
          />
        );
      })}
    </div>
  );
}

/* ————————————————— the hero ————————————————— */

export function Hero({ onOpenModal }: { onOpenModal: (m: "privacy" | "terms") => void }) {

  // form state
  const [firstName, setFirstName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [goalId, setGoalId] = useState("explore");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errors, setErrors] = useState<{ firstName?: string; emailAddress?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // cursor spotlight + parallax (springs keep it buttery)
  const spotX = useMotionValue(-600);
  const spotY = useMotionValue(-600);
  const smoothX = useSpring(spotX, { stiffness: 90, damping: 22, mass: 0.5 });
  const smoothY = useSpring(spotY, { stiffness: 90, damping: 22, mass: 0.5 });
  const spotlight = useMotionTemplate`radial-gradient(540px circle at ${smoothX}px ${smoothY}px, rgba(204,242,68,0.075), transparent 70%)`;

  const normX = useMotionValue(0); // -1 .. 1 across the viewport
  const normY = useMotionValue(0);
  const smoothNormX = useSpring(normX, { stiffness: 50, damping: 20 });
  const smoothNormY = useSpring(normY, { stiffness: 50, damping: 20 });
  const auroraAX = useTransform(smoothNormX, (v) => v * -28);
  const auroraAY = useTransform(smoothNormY, (v) => v * -18);
  const auroraBX = useTransform(smoothNormX, (v) => v * 34);
  const auroraBY = useTransform(smoothNormY, (v) => v * 22);

  const handleHeroMouse = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    spotX.set(e.clientX - (rect?.left ?? 0));
    spotY.set(e.clientY - (rect?.top ?? 0));
    normX.set((e.clientX / window.innerWidth) * 2 - 1);
    normY.set((e.clientY / window.innerHeight) * 2 - 1);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = "Full name is required";
    if (!emailAddress.trim()) newErrors.emailAddress = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(emailAddress)) newErrors.emailAddress = "Please enter a valid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const generatedTicket = `AFH-${randomId}`;

      // 1. Submit lead to database/backend
      await captureLead({
        firstName: firstName.trim(),
        email: emailAddress.trim(),
        phone: phoneNumber || undefined,
        countryCode: selectedCountry.code,
        dialCode: selectedCountry.dialCode,
        goal: goalId,
        source: "website-hero",
      });

      // 2. Submit lead to Make.com webhook
      try {
        await fetch("https://hook.eu2.make.com/t321a330pbobto3ejdm7awu0tchrzpjn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: firstName.trim(),
            email: emailAddress.trim(),
            phone: phoneNumber ? phoneNumber.trim() : "",
            countryCode: selectedCountry.code,
            dialCode: selectedCountry.dialCode,
            fullPhoneNumber: phoneNumber ? `${selectedCountry.dialCode}${phoneNumber.trim()}` : "",
            goal: goalId,
            source: "website-hero",
            ticketNumber: generatedTicket,
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch (webhookErr) {
        console.error("Make.com Webhook error:", webhookErr);
      }

      // 3. Send lead notification email via Resend
      try {
        await fetch("/api/send-lead-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: firstName.trim(),
            email: emailAddress.trim(),
            phone: phoneNumber ? phoneNumber.trim() : "",
            countryCode: selectedCountry.code,
            dialCode: selectedCountry.dialCode,
            fullPhoneNumber: phoneNumber ? `${selectedCountry.dialCode}${phoneNumber.trim()}` : "",
            goal: goalId,
            source: "website-hero",
            ticketNumber: generatedTicket,
            submittedAt: new Date().toISOString(),
          }),
        });
      } catch (resendErr) {
        console.error("Resend email error:", resendErr);
      }

      setTicketNumber(generatedTicket);
      setIsSubmitted(true);
    } catch (err) {
      setErrors({ emailAddress: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:ring-4 focus:ring-volt/10";

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleHeroMouse}
      className="relative min-h-screen overflow-hidden pt-28 pb-14 lg:pt-32"
    >
      {/* ——— atmosphere ——— */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark" />
      {/* parallax aurora: outer layer tracks the cursor, inner keeps the drift keyframes */}
      <motion.div
        className="pointer-events-none absolute -top-[20%] left-[5%] h-[55vh] w-[45vw]"
        style={{ x: auroraAX, y: auroraAY }}
      >
        <div
          className="h-full w-full rounded-full blur-[140px]"
          style={{ background: "rgba(204,242,68,0.10)", animation: "aurora-a 18s ease-in-out infinite" }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute top-[30%] right-[-10%] h-[60vh] w-[45vw]"
        style={{ x: auroraBX, y: auroraBY }}
      >
        <div
          className="h-full w-full rounded-full blur-[150px]"
          style={{ background: "rgba(181,161,255,0.12)", animation: "aurora-b 22s ease-in-out infinite" }}
        />
      </motion.div>
      {/* cursor spotlight */}
      <motion.div className="pointer-events-none absolute inset-0 z-[1]" style={{ background: spotlight }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-void to-transparent" />

      {/* live community ticker */}
      <JoinTicker />

      {/* scroll cue */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="Scroll to the live demo"
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-zinc-600 transition-colors hover:text-volt lg:flex cursor-pointer"
      >
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.35em]">Scroll</span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-current p-1">
          <motion.span
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
        </span>
      </motion.button>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        {/* ——————— LEFT: editorial headline ——————— */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-volt/30 bg-volt/[0.07] px-4 py-2 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-volt"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-70" />
              <span className="pulse-glow-dot relative inline-flex h-2 w-2 rounded-full bg-volt" />
            </span>
            Start Building Today — FOR FREE 🚀
          </motion.div>

          <h1 className="mt-7 font-display font-extrabold uppercase leading-[0.93] tracking-tight text-white text-[44px] sm:text-[64px] lg:text-[72px] xl:text-[82px]">
            <StaggerLine delay={0.35}>
              <HoverWord>Learn it.</HoverWord> <HoverWord>Build it.</HoverWord>
            </StaggerLine>
            <StaggerLine delay={0.45}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                className="text-shimmer inline-block cursor-default"
              >
                Get paid for it.
              </motion.span>
            </StaggerLine>

          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-400 lg:mx-0"
          >
            AI Founder Hub is where builders — technical or not — go from idea to a live, production-ready AI Application.
            Free weekly masterclasses. Premium courses. 1:1 mentorship. Start For Free Today.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="mx-auto mt-7 flex max-w-xl flex-col gap-2.5 text-left lg:mx-0"
          >
            {[
              "Free weekly masterclasses on Claude, OpenClaw, Micro-SaaS & more.",
              "Premium courses to take you from idea to production-grade AI app.",
              "Launch a live product with 1:1 mentorship guiding every step.",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-medium text-zinc-300">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-volt/15 text-volt">
                  <Zap className="h-3 w-3" />
                </span>
                {line}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="mt-9 flex flex-col items-center gap-5 sm:flex-row lg:items-center lg:justify-start justify-center"
          >
            <Magnetic>
              <button
                onClick={scrollToRegister}
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_40px_rgba(204,242,68,0.25)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(204,242,68,0.5)] cursor-pointer"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%] w-1/2" />
                <span className="relative">START MY AI JOURNEY</span>
                <ArrowRight className="relative h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Magnetic>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["bg-lilac text-void", "bg-volt text-void", "bg-zinc-700 text-volt", "bg-orange-400 text-void"].map(
                  (cls, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-void text-[9px] font-black ${cls}`}
                    >
                      {["MK", "JT", "+", "RS"][i]}
                    </div>
                  )
                )}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-zinc-200">Join the community</span>
                <span className="block font-mono text-[10px] text-zinc-500">Of AI Builders</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ——————— RIGHT: registration card ——————— */}
        <motion.div
          id="register"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md scroll-mt-28"
        >
          {/* scroll-linked decorative orbit */}
          <OrbitRing className="pointer-events-none absolute -right-24 -top-24 hidden h-56 w-56 xl:block" />
          <TiltCard>
            <div className="conic-frame shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <div className="relative rounded-[25px] bg-panel/95 p-6 sm:p-8 backdrop-blur-xl">
                {!isSubmitted ? (
                  <form onSubmit={handleRegister} className="space-y-5">
                    {/* full name */}
                    <div className="space-y-1.5">
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined }));
                          }}
                          placeholder="FULL NAME"
                          className={`${inputBase} pl-11 ${errors.firstName ? "border-red-500/70" : "border-edge focus:border-volt/60"
                            }`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="flex items-center gap-1.5 pl-1 text-xs font-medium text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* email */}
                    <div className="space-y-1.5">
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={emailAddress}
                          onChange={(e) => {
                            setEmailAddress(e.target.value);
                            if (errors.emailAddress) setErrors((p) => ({ ...p, emailAddress: undefined }));
                          }}
                          placeholder="EMAIL ADDRESS"
                          className={`${inputBase} pl-11 ${errors.emailAddress ? "border-red-500/70" : "border-edge focus:border-volt/60"
                            }`}
                        />
                      </div>
                      {errors.emailAddress && (
                        <p className="flex items-center gap-1.5 pl-1 text-xs font-medium text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.emailAddress}
                        </p>
                      )}
                    </div>



                    {/* phone + country */}
                    <div className="relative flex overflow-visible rounded-xl border border-edge bg-white/[0.04]">
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          className="flex h-full items-center gap-1.5 border-r border-edge px-3.5 transition-colors hover:bg-white/5 cursor-pointer"
                        >
                          <span className="text-xl leading-none select-none">{selectedCountry.flag}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${countryDropdownOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        <AnimatePresence>
                          {countryDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.18 }}
                              className="absolute left-0 top-full z-50 mt-2 max-h-60 w-64 overflow-y-auto rounded-xl border border-edge bg-panel py-1.5 shadow-2xl"
                            >
                              <div className="border-b border-edge px-3 pb-1.5 mb-1 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                Select country code
                              </div>
                              {COUNTRIES.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setCountryDropdownOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${selectedCountry.code === country.code
                                    ? "bg-volt text-void"
                                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <span className="text-base leading-none">{country.flag}</span>
                                    {country.name}
                                  </span>
                                  <span
                                    className={`font-mono text-[10px] ${selectedCountry.code === country.code ? "text-void/70" : "text-zinc-500"
                                      }`}
                                  >
                                    {country.dialCode}
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="relative flex flex-1 items-center">
                        <span className="pointer-events-none absolute left-3 font-mono text-xs text-zinc-500">
                          {selectedCountry.dialCode}
                        </span>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\- ()]/g, ""))}
                          placeholder="CONTACT NUMBER"
                          className="w-full bg-transparent py-3.5 pl-14 pr-4 text-sm font-semibold text-white placeholder-zinc-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* consent */}
                    <label className="flex cursor-pointer items-center gap-3 text-left">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-4 w-4 flex-shrink-0 rounded border-edge bg-void accent-[#ccf244]"
                      />
                      <span className="text-[11.5px] font-medium leading-relaxed text-zinc-400">
                        I Accept{" "}
                        <button
                          type="button"
                          onClick={() => onOpenModal("terms")}
                          className="font-semibold text-zinc-300 underline transition-colors hover:text-volt cursor-pointer"
                        >
                          Terms & Conditions
                        </button>
                      </span>
                    </label>

                    {/* CTA */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !agreedToTerms}
                      className={`group relative w-full overflow-hidden rounded-xl py-4.5 font-display text-lg font-extrabold uppercase tracking-tight transition-all duration-300 ${!agreedToTerms
                        ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                        : "bg-volt text-void shadow-[0_0_30px_rgba(204,242,68,0.25)] hover:shadow-[0_0_50px_rgba(204,242,68,0.45)] active:scale-[0.98] cursor-pointer"
                        }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2.5">
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Generating your pass…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          GET FREE MASTERCLASS ACCESS
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      )}
                    </button>

                    {/* <p className="text-center font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      Free forever · No card · 2-min signup
                    </p> */}
                  </form>
                ) : (
                  /* ——————— SUCCESS: boarding-pass ticket ——————— */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative space-y-5 text-center"
                  >
                    <ConfettiBurst />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-volt/15 ring-1 ring-volt/40"
                    >
                      <Check className="h-7 w-7 text-volt" strokeWidth={3} />
                    </motion.div>

                    <div>
                      <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                        You're in, {firstName}!
                      </h3>
                      <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                        Your profile is synced. Your free,{" "}
                        <span className="font-semibold text-volt">Masterclass Access</span>, is confirmed{" "}
                        <span className="font-semibold text-zinc-200">{emailAddress}</span>.
                      </p>
                    </div>

                    {/* the pass */}
                    <div className="relative overflow-hidden rounded-2xl border border-volt/25 bg-gradient-to-br from-[#101018] to-void text-left">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-volt/10 blur-2xl" />
                      {/* notches */}
                      <div className="absolute -left-2.5 top-[58%] h-5 w-5 rounded-full bg-panel" />
                      <div className="absolute -right-2.5 top-[58%] h-5 w-5 rounded-full bg-panel" />

                      <div className="flex items-start justify-between border-b border-white/8 p-4.5">
                        <div>
                          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-volt">
                            Free Master Class
                          </span>
                          <span className="mt-1 block font-display text-lg font-extrabold uppercase leading-none text-white">
                            AI Founder Hub
                          </span>
                        </div>
                        <Sparkles className="h-6 w-6 text-volt" />
                      </div>

                      <div className="grid grid-cols-2 gap-y-3.5 p-4.5 text-xs">
                        <div>
                          <span className="block font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Attendee
                          </span>
                          <span className="font-bold text-zinc-100">{firstName}</span>
                        </div>
                        <div>
                          <span className="block font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Pass No.
                          </span>
                          <span className="font-mono font-bold text-volt">{ticketNumber}</span>
                        </div>
                        {/* <div>
                          <span className="block font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Flagship summit
                          </span>
                          <span className="font-semibold text-zinc-200">{EVENT.shortRange}</span>
                        </div>
                        <div>
                          <span className="block font-mono text-[8.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Pathway match
                          </span>
                          <span className="font-semibold text-lilac">
                            {GOALS.find((g) => g.id === goalId)?.pathway ?? "Explorer"}
                          </span>
                        </div> */}
                      </div>

                      {/* <div className="flex items-end justify-between border-t border-dashed border-white/10 p-4.5 pt-4">
                        <div className="barcode h-8 w-36 text-zinc-400" />
                        <span className="rounded border border-volt/30 bg-volt/10 px-2 py-1 font-mono text-[9px] font-black uppercase text-volt">
                          VIP Confirmed
                        </span>
                      </div> */}
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl border border-edge bg-white/[0.03] p-3.5 text-left text-xs">
                      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-volt" />
                      <span className="text-zinc-400">
                        <span className="block font-bold text-zinc-200">NEXT: CHECK YOUR INBOX</span>
                        Your Masterclass Invite + Exclusive WhatsApp Group Link Lands In Minutes. Your Workbook And Prompt Templates Are Inside.
                      </span>
                    </div>

                    {/* tripwire: highest-intent moment on the page */}
                    <div className="rounded-xl border border-volt/30 bg-volt/[0.07] p-3.5 text-left">
                      <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-volt">
                        While you wait
                      </span>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                        Your workshop is days away. Members start tonight:{" "}
                        <span className="font-bold text-white">every course, every replay, instantly.</span>
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          document.getElementById("membership")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="group mt-2.5 flex items-center gap-1.5 font-display text-[11px] font-extrabold uppercase tracking-wide text-volt transition-colors hover:text-white cursor-pointer"
                      >
                        GET INSTANT ACCESS · $159.99/mo
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </button>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => {
                          navigator.clipboard
                            .writeText("I just claimed my seat at the AI Founder Hub 3-day build summit. It's free. Come build with me!")
                            .then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            });
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-edge bg-white/[0.03] py-3 text-xs font-bold text-zinc-200 transition-all hover:border-volt/40 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-volt" /> Copied!
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5 text-volt" /> Invite a friend
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFirstName("");
                          setEmailAddress("");
                          setPhoneNumber("");
                        }}
                        className="flex-1 rounded-xl border border-volt/25 bg-volt/10 py-3 text-xs font-bold text-volt transition-colors hover:bg-volt/20 cursor-pointer"
                      >
                        Register another
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </TiltCard>

          {/* floating guarantee chip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-edge bg-panel px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 shadow-xl"
            style={{ animation: "float-y 5s ease-in-out infinite" }}
          >
            🔒 100% free. No Credit Card Required.
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
