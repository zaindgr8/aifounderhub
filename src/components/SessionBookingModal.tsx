import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ArrowRight, Loader2, AlertCircle, CheckCircle2,
  CalendarClock, Mail, User, Phone, ChevronDown, Lock,
  Shield, Clock, Star,
} from "lucide-react";
import { initiateZiinaPayment } from "../lib/api";

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
  { name: "Canada",               code: "CA", flag: "🇨🇦", dialCode: "+1"   },
  { name: "Australia",            code: "AU", flag: "🇦🇺", dialCode: "+61"  },
  { name: "Singapore",            code: "SG", flag: "🇸🇬", dialCode: "+65"  },
  { name: "Nigeria",              code: "NG", flag: "🇳🇬", dialCode: "+234" },
  { name: "South Africa",         code: "ZA", flag: "🇿🇦", dialCode: "+27"  },
];

export interface SessionAdvisor {
  name: string;
  slug: string;
  fullName: string;
  initials: string;
  photo?: string;
  role: string;
  avatarClass: string;
}

interface SessionBookingModalProps {
  advisor: SessionAdvisor | null;
  onClose: () => void;
}

type FormState = "idle" | "loading" | "redirecting";

export function SessionBookingModal({ advisor, onClose }: SessionBookingModalProps) {
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [topic, setTopic]           = useState("");
  const [country, setCountry]       = useState<Country>(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [formState, setFormState]   = useState<FormState>("idle");
  const nameRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const open = advisor !== null;

  useEffect(() => {
    if (open) {
      setError(null); setFormState("idle");
      setFullName(""); setEmail(""); setPhone(""); setTopic("");
      setCountry(COUNTRIES[0]); setDropdownOpen(false);
      setTimeout(() => nameRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (dropdownOpen) setDropdownOpen(false); else onClose(); }
    };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, dropdownOpen]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }
    if (!phone.trim()) { setError("Please enter your phone number."); return; }

    setError(null);
    setFormState("loading");

    try {
      // 1. Create Ziina payment intent for $299 session
      const result = await initiateZiinaPayment({
        fullName: fullName.trim(),
        email: email.trim(),
        amount: 29900,   // $299 in cents
        message: `1:1 Session with ${advisor?.name}`,
        cancelPath: "/#mentors",
        advisorName: advisor?.fullName,
      });

      if (!result.ok || !result.redirect_url) {
        setError(result.error ?? "Payment initiation failed. Please try again.");
        setFormState("idle");
        return;
      }

      // 2. Also fire-and-forget the lead email so management is notified immediately
      void fetch("/api/send-lead-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName:        fullName.trim(),
          email:           email.trim(),
          phone:           phone.trim(),
          dialCode:        country.dialCode,
          countryCode:     country.code,
          fullPhoneNumber: `${country.dialCode} ${phone.trim()}`,
          goal:            "session",
          workshopTitle:   `1:1 Private Session with ${advisor?.fullName}`,
          source:          `session-${advisor?.name?.toLowerCase()}`,
          submittedAt:     new Date().toISOString(),
          ticketNumber:    `AFH-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          sessionTopic:    topic.trim() || "Not specified",
        }),
      });

      setFormState("redirecting");
      // Small pause so user sees "Redirecting…" before navigation
      await new Promise((r) => setTimeout(r, 600));
      window.location.href = result.redirect_url!;
    } catch {
      setError("Something went wrong. Please try again.");
      setFormState("idle");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sb-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="sb-modal"
            initial={{ opacity: 0, scale: 0.96, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 28 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog" aria-modal="true"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_32px_100px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto">

              {/* Lilac glow top */}
              <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-80 -translate-x-1/2 rounded-full blur-[70px]"
                style={{ background: "rgba(181,161,255,0.18)" }} />

              {/* Header */}
              <div className="relative border-b border-white/8 px-7 pb-5 pt-6">
                <button onClick={onClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close">
                  <X className="h-4 w-4" />
                </button>

                {/* Advisor avatar */}
                <div className="mb-4 flex items-center gap-3.5">
                  <div className="relative h-14 w-14 flex-shrink-0">
                    {advisor?.photo ? (
                      <img
                        src={advisor.photo}
                        alt={advisor.fullName}
                        className="h-14 w-14 rounded-2xl object-cover object-top shadow-lg border border-white/10"
                      />
                    ) : (
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-lg font-extrabold shadow-lg ${advisor?.avatarClass}`}>
                        {advisor?.initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-lilac">
                      Private 1:1 Session
                    </p>
                    <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                      Book with {advisor?.fullName}
                    </h2>
                    <p className="mt-0.5 font-mono text-[9.5px] text-zinc-500 uppercase tracking-wider">
                      {advisor?.role}
                    </p>
                  </div>
                </div>

                {/* Price + session strip */}
                <div className="flex items-center justify-between rounded-xl border border-lilac/20 bg-lilac/5 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-lilac" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      60-min · Private · Live
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xl font-black text-volt">$299</span>
                    <span className="font-mono text-[9px] text-zinc-500">/session</span>
                  </div>
                </div>
              </div>

              {/* Trust strip */}
              <div className="flex items-center justify-around border-b border-white/5 bg-white/[0.02] px-7 py-2.5">
                {[
                  { icon: Shield, label: "Secure Pay" },
                  { icon: Star,   label: "Expert 1:1" },
                  { icon: CalendarClock, label: "Flexible Time" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-lilac" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 py-5 space-y-3.5" noValidate>

                {/* Full Name */}
                <div>
                  <label htmlFor="sb-name" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                    <input ref={nameRef} id="sb-name" type="text" autoComplete="name"
                      value={fullName} onChange={(e) => { setFullName(e.target.value); setError(null); }}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-lilac/50 focus:bg-white/8" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="sb-email" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                    <input id="sb-email" type="email" autoComplete="email"
                      value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-lilac/50 focus:bg-white/8" />
                  </div>
                </div>

                {/* Phone + country code */}
                <div>
                  <label htmlFor="sb-phone" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">Phone Number</label>
                  <div className="flex gap-2">
                    {/* Country dropdown */}
                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                      <button type="button" onClick={() => setDropdownOpen((v) => !v)}
                        className="flex h-full items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white transition-colors hover:border-lilac/40 outline-none cursor-pointer">
                        <span>{country.flag}</span>
                        <span className="font-mono text-[12px] font-bold text-zinc-300">{country.dialCode}</span>
                        <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div key="dd"
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full z-50 mt-1.5 max-h-52 w-52 overflow-y-auto rounded-xl border border-white/10 bg-[#111118] shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
                            {COUNTRIES.map((c) => (
                              <button key={c.code} type="button"
                                onClick={() => { setCountry(c); setDropdownOpen(false); }}
                                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-[12px] font-semibold transition-colors hover:bg-lilac/10 cursor-pointer ${c.code === country.code ? "text-lilac bg-lilac/5" : "text-zinc-300"}`}>
                                <span>{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="font-mono text-[11px] text-zinc-500">{c.dialCode}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Phone input */}
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                      <input id="sb-phone" type="tel" autoComplete="tel-national"
                        value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^\d\s\-()]/g, "")); setError(null); }}
                        placeholder="50 123 4567"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-lilac/50 focus:bg-white/8" />
                    </div>
                  </div>
                </div>

                {/* What do you want to cover (optional) */}
                <div>
                  <label htmlFor="sb-topic" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                    What do you want to cover? <span className="text-zinc-700">(optional)</span>
                  </label>
                  <textarea id="sb-topic" rows={2}
                    value={topic} onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Launch my AI SaaS, build an automation agency, land first client…"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-lilac/50 focus:bg-white/8" />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div key="err"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <button
                  id={`session-book-btn-${advisor?.name?.toLowerCase()}`}
                  type="submit"
                  disabled={formState !== "idle"}
                  className="group relative mt-1 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-[14px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_40px_rgba(204,242,68,0.3)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(204,242,68,0.5)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                  {formState === "idle" ? (
                    <>
                      <span className="relative">Pay $299 · Book My Session</span>
                      <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  ) : formState === "loading" ? (
                    <>
                      <Loader2 className="relative h-4 w-4 animate-spin" />
                      <span className="relative">Processing…</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="relative h-4 w-4 animate-spin" />
                      <span className="relative">Redirecting to Checkout…</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="h-3 w-3 text-zinc-700" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                    Secured by Ziina · PCI Compliant · Encrypted
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
