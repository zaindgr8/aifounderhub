import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Zap, Calendar, Bell, Mail, User, Lock, Phone, ChevronDown,
} from "lucide-react";

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", dialCode: "+971" },
  { name: "Saudi Arabia",         code: "SA", flag: "🇸🇦", dialCode: "+966" },
  { name: "United States",        code: "US", flag: "🇺🇸", dialCode: "+1"   },
  { name: "United Kingdom",       code: "GB", flag: "🇬🇧", dialCode: "+44"  },
  { name: "India",                code: "IN", flag: "🇮🇳", dialCode: "+91"  },
  { name: "Pakistan",             code: "PK", flag: "🇵🇰", dialCode: "+92"  },
  { name: "Qatar",                code: "QA", flag: "🇶🇦", dialCode: "+974" },
  { name: "Kuwait",               code: "KW", flag: "🇰🇼", dialCode: "+965" },
  { name: "Bahrain",              code: "BH", flag: "🇧🇭", dialCode: "+973" },
  { name: "Oman",                 code: "OM", flag: "🇴🇲", dialCode: "+968" },
  { name: "Egypt",                code: "EG", flag: "🇪🇬", dialCode: "+20"  },
  { name: "Jordan",               code: "JO", flag: "🇯🇴", dialCode: "+962" },
  { name: "Lebanon",              code: "LB", flag: "🇱🇧", dialCode: "+961" },
  { name: "Canada",               code: "CA", flag: "🇨🇦", dialCode: "+1"   },
  { name: "Australia",            code: "AU", flag: "🇦🇺", dialCode: "+61"  },
  { name: "Singapore",            code: "SG", flag: "🇸🇬", dialCode: "+65"  },
  { name: "Malaysia",             code: "MY", flag: "🇲🇾", dialCode: "+60"  },
  { name: "Nigeria",              code: "NG", flag: "🇳🇬", dialCode: "+234" },
  { name: "Kenya",                code: "KE", flag: "🇰🇪", dialCode: "+254" },
  { name: "South Africa",         code: "ZA", flag: "🇿🇦", dialCode: "+27"  },
];

interface WorkshopRegistrationModalProps {
  workshop: { title: string; desc: string; emoji: string; tagline: string } | null;
  onClose: () => void;
}

type FormState = "idle" | "loading" | "success";

export function WorkshopRegistrationModal({
  workshop,
  onClose,
}: WorkshopRegistrationModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [country, setCountry]   = useState<Country>(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const nameRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const open = workshop !== null;

  // Reset on open
  useEffect(() => {
    if (open) {
      setError(null);
      setFormState("idle");
      setFullName("");
      setEmail("");
      setPhone("");
      setCountry(COUNTRIES[0]);
      setDropdownOpen(false);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dropdownOpen) setDropdownOpen(false);
        else onClose();
      }
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, dropdownOpen]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setError(null);
    setFormState("loading");

    const fullPhoneNumber = `${country.dialCode} ${phone.trim()}`;
    const ticketNumber = `AFH-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    try {
      const res = await fetch("/api/send-lead-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:        fullName.trim(),
          email:           email.trim(),
          phone:           phone.trim(),
          dialCode:        country.dialCode,
          countryCode:     country.code,
          fullPhoneNumber,
          goal:            "workshop",
          workshopTitle:   workshop?.title,
          source:          `workshop-${workshop?.title?.toLowerCase().replace(/[\s&]+/g, "-")}`,
          submittedAt:     new Date().toISOString(),
          ticketNumber,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        setFormState("success");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setFormState("idle");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setFormState("idle");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="wr-modal"
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 28 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_32px_100px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">

              {/* Top volt glow */}
              <div
                className="pointer-events-none sticky top-0 left-0 right-0 h-0"
                style={{ zIndex: 1 }}
              >
                <div
                  className="absolute -top-16 left-1/2 h-32 w-80 -translate-x-1/2 rounded-full blur-[70px]"
                  style={{ background: "rgba(204,242,68,0.15)" }}
                />
              </div>

              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  /* ── SUCCESS STATE ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-5 px-7 py-10 text-center"
                  >
                    <button
                      onClick={onClose}
                      className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                      className="relative flex h-20 w-20 items-center justify-center"
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt/20" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-volt/40 bg-volt/10">
                        <CheckCircle2 className="h-9 w-9 text-volt" />
                      </div>
                    </motion.div>

                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-volt">
                        ⚡ You're Registered!
                      </span>
                      <h2 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
                        Seat Confirmed 🎉
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        You've registered for the{" "}
                        <span className="font-bold text-volt">{workshop?.title}</span>.
                        <br />
                        {workshop?.tagline}
                      </p>
                    </div>

                    <div className="w-full rounded-xl border border-volt/15 bg-volt/5 p-4 text-left">
                      <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                        What happens next
                      </p>
                      <div className="space-y-2.5">
                        {[
                          { icon: Mail,     text: "Confirmation email sent to your inbox" },
                          { icon: Calendar, text: "Calendar invite for the live session" },
                          { icon: Bell,     text: "Reminders & session updates via email" },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-center gap-2.5">
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-volt/20">
                              <Icon className="h-2.5 w-2.5 text-volt" />
                            </div>
                            <span className="text-[12px] font-semibold text-zinc-300">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full rounded-full bg-volt py-3 font-display text-sm font-extrabold uppercase tracking-wide text-void transition-all hover:opacity-90 cursor-pointer"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  /* ── FORM STATE ── */
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Header */}
                    <div className="relative border-b border-white/8 px-7 pb-5 pt-6">
                      <button
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-volt/20 bg-volt/10 text-xl">
                          {workshop?.emoji}
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">
                          Free Masterclass
                        </span>
                      </div>

                      <h2 className="font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-white">
                        {workshop?.title}
                      </h2>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
                        {workshop?.tagline}
                      </p>
                    </div>

                    {/* Trust strip */}
                    <div className="flex items-center justify-around border-b border-white/5 bg-white/[0.02] px-7 py-2.5">
                      {[
                        { icon: Zap,      label: "100% Free" },
                        { icon: Calendar, label: "Live Session" },
                        { icon: Bell,     label: "Get Updates" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 text-volt" />
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-7 py-5" noValidate>
                      <div className="space-y-3.5">

                        {/* Full Name */}
                        <div>
                          <label htmlFor="wr-fullname" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                            <input
                              ref={nameRef}
                              id="wr-fullname"
                              type="text"
                              autoComplete="name"
                              value={fullName}
                              onChange={(e) => { setFullName(e.target.value); setError(null); }}
                              placeholder="Your full name"
                              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-volt/50 focus:bg-white/8"
                              required
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="wr-email" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                            <input
                              id="wr-email"
                              type="email"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setError(null); }}
                              placeholder="you@example.com"
                              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-volt/50 focus:bg-white/8"
                              required
                            />
                          </div>
                        </div>

                        {/* Phone with country code */}
                        <div>
                          <label htmlFor="wr-phone" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                            Phone Number
                          </label>
                          <div className="flex gap-2">
                            {/* Country code dropdown */}
                            <div className="relative flex-shrink-0" ref={dropdownRef}>
                              <button
                                type="button"
                                onClick={() => setDropdownOpen((v) => !v)}
                                className="flex h-full items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white transition-colors hover:border-volt/40 focus:border-volt/50 outline-none cursor-pointer"
                              >
                                <span>{country.flag}</span>
                                <span className="font-mono text-[12px] font-bold text-zinc-300">{country.dialCode}</span>
                                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                              </button>

                              <AnimatePresence>
                                {dropdownOpen && (
                                  <motion.div
                                    key="dropdown"
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 top-full z-50 mt-1.5 max-h-52 w-52 overflow-y-auto rounded-xl border border-white/10 bg-[#111118] shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
                                  >
                                    {COUNTRIES.map((c) => (
                                      <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => { setCountry(c); setDropdownOpen(false); }}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-semibold transition-colors hover:bg-volt/10 cursor-pointer ${c.code === country.code ? "text-volt bg-volt/5" : "text-zinc-300"}`}
                                      >
                                        <span className="text-base">{c.flag}</span>
                                        <span className="flex-1 truncate">{c.name}</span>
                                        <span className="flex-shrink-0 font-mono text-[11px] text-zinc-500">{c.dialCode}</span>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Phone number input */}
                            <div className="relative flex-1">
                              <Phone className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                              <input
                                id="wr-phone"
                                type="tel"
                                autoComplete="tel-national"
                                value={phone}
                                onChange={(e) => { setPhone(e.target.value.replace(/[^\d\s\-()]/g, "")); setError(null); }}
                                placeholder="50 123 4567"
                                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-volt/50 focus:bg-white/8"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            key="err"
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400"
                          >
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* CTA */}
                      <button
                        id={`workshop-register-btn-${workshop?.title?.toLowerCase().replace(/[\s&]+/g, "-")}`}
                        type="submit"
                        disabled={formState === "loading"}
                        className="group relative mt-5 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-[14px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_40px_rgba(204,242,68,0.3)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(204,242,68,0.5)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                        {formState === "loading" ? (
                          <>
                            <Loader2 className="relative h-4 w-4 animate-spin" />
                            <span className="relative">Reserving Your Seat…</span>
                          </>
                        ) : (
                          <>
                            <span className="relative">Reserve My Free Seat</span>
                            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>

                      <div className="mt-3.5 flex items-center justify-center gap-1.5">
                        <Lock className="h-3 w-3 text-zinc-700" />
                        <p className="text-center font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                          No spam · Unsubscribe anytime · 100% Free
                        </p>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
