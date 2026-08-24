import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Zap, Calendar, Mail, User, Lock, Phone, ChevronDown, Sparkles
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

interface ClaudeMasterclassPopupModalProps {
  open: boolean;
  onClose: () => void;
}

type FormState = "idle" | "loading" | "success";

export function ClaudeMasterclassPopupModal({
  open,
  onClose,
}: ClaudeMasterclassPopupModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [country, setCountry]   = useState<Country>(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [ticketNum, setTicketNum] = useState<string>("");
  const nameRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (open) {
      setError(null);
      setFormState("idle");
      setTimeout(() => nameRef.current?.focus(), 250);
    }
  }, [open]);

  // Escape key to close
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

  // Close dropdown on click outside
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

  // Prevent background scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

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
    const generatedTicket = `AFH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setTicketNum(generatedTicket);

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
          workshopTitle:   "AI Call Assistant Masterclass — Build & Sell For $2,000+",
          source:          "timed-popup-modal",
          submittedAt:     new Date().toISOString(),
          ticketNumber:    generatedTicket,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        setFormState("success");
        try {
          sessionStorage.setItem("claude_popup_registered", "true");
        } catch {
          // ignore
        }
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
            key="claude-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
            <motion.div
              key="claude-popup-content"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative w-full max-w-lg rounded-3xl border border-volt/30 bg-[#0c0c14] p-6 sm:p-8 shadow-[0_0_80px_rgba(204,242,68,0.18)] my-auto overflow-hidden text-zinc-100"
            >
              {/* Background ambient lighting */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-volt/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-lilac/10 blur-3xl" />
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-volt to-transparent" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition hover:border-zinc-700 hover:text-white hover:bg-zinc-800 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              {formState === "success" ? (
                /* Success View */
                <div className="relative z-10 text-center py-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-volt/15 border border-volt/30 text-volt shadow-[0_0_30px_rgba(204,242,68,0.25)]"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>

                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-volt">
                    Registration Confirmed
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                    You're On The List! 🎉
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    We've reserved your free seat for <strong className="text-white">This Saturday's Live Class</strong>. A confirmation email with the session details & link was sent to <span className="text-volt font-mono font-semibold">{email}</span>.
                  </p>

                  {/* Access Ticket Pill */}
                  <div className="my-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                      Your Masterclass Access Ticket
                    </p>
                    <div className="mt-0.5 font-mono text-lg font-black tracking-widest text-volt">
                      {ticketNum}
                    </div>
                  </div>

                  {/* WhatsApp VIP Community Prompt */}
                  <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      💬 VIP Community Access
                    </p>
                    <p className="mt-1 text-xs text-zinc-300">
                      You qualify to join the official AI Founder Hub WhatsApp community.
                    </p>
                    <a
                      href="https://chat.whatsapp.com/JorMU8jZSDdDTBokqBFBsW"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-black uppercase tracking-wider transition hover:bg-[#20bd5a] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                    >
                      Join WhatsApp Community →
                    </a>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={onClose}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
                    >
                      Done &amp; Return to Site
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form View */
                <div className="relative z-10">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-volt/25 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase text-volt mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse" />
                    <span>Next Live Class: Coming Saturday (Limited Seats)</span>
                  </div>

                  {/* Title & Core Hook */}
                  <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                    Build An <span className="text-volt">AI Call Assistant</span> &amp; Sell For $2,000+
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                    Join our free live masterclass this Saturday. Watch us build a working voice agent on Retell AI, connect Cal.com for 24/7 booking, and learn how to sell it to real businesses for <strong className="text-volt font-bold">$2,000+</strong>.
                  </p>

                  {/* Highlights bar */}
                  <div className="my-4 grid grid-cols-3 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 text-center">
                    <div className="border-r border-zinc-800/80 pr-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Format</p>
                      <p className="text-[11px] font-bold text-white mt-0.5">Live Masterclass</p>
                    </div>
                    <div className="border-r border-zinc-800/80 px-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">When</p>
                      <p className="text-[11px] font-bold text-volt mt-0.5">This Saturday</p>
                    </div>
                    <div className="pl-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Access</p>
                      <p className="text-[11px] font-bold text-white mt-0.5">100% Free</p>
                    </div>
                  </div>

                  {/* Error display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 font-medium"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          ref={nameRef}
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          disabled={formState === "loading"}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none focus:ring-1 focus:ring-volt"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          disabled={formState === "loading"}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none focus:ring-1 focus:ring-volt"
                        />
                      </div>
                    </div>

                    {/* Phone Number with Country Picker */}
                    <div>
                      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        {/* Country Selector Dropdown */}
                        <div className="relative shrink-0" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setDropdownOpen((v) => !v)}
                            disabled={formState === "loading"}
                            className="flex h-[42px] items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 text-xs text-white transition hover:border-zinc-700 focus:border-volt focus:outline-none"
                          >
                            <span className="text-base">{country.flag}</span>
                            <span className="font-mono text-zinc-400">{country.dialCode}</span>
                            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                          </button>

                          {dropdownOpen && (
                            <div className="absolute left-0 top-full mt-1.5 z-50 max-h-56 w-56 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950 p-1 shadow-2xl">
                              {COUNTRIES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCountry(c);
                                    setDropdownOpen(false);
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-zinc-800 ${
                                    c.code === country.code ? "bg-zinc-800/80 text-volt" : "text-zinc-300"
                                  }`}
                                >
                                  <span>{c.flag}</span>
                                  <span className="truncate flex-1">{c.name}</span>
                                  <span className="font-mono text-zinc-500 text-[10px]">{c.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Phone input */}
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="50 123 4567"
                            disabled={formState === "loading"}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none focus:ring-1 focus:ring-volt"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={formState === "loading"}
                      className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-3 font-display text-sm font-black uppercase tracking-wider text-void transition-all hover:bg-[#d8fa55] hover:shadow-[0_0_35px_rgba(204,242,68,0.4)] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {formState === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-void" />
                          <span>Reserving Seat...</span>
                        </>
                      ) : (
                        <>
                          <span>Claim Free Seat</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    {/* Security note */}
                    <p className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                      <Lock className="h-3 w-3 text-zinc-500" />
                      <span>Instant email confirmation · 100% Free · Limited seats</span>
                    </p>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
