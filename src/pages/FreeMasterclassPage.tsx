import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  Clock,
  Video,
  ChevronDown,
} from "lucide-react";
import { Wordmark } from "../components/shared";

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia",         dialCode: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar",                dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait",               dialCode: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain",              dialCode: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman",                 dialCode: "+968", flag: "🇴🇲" },
  { code: "EG", name: "Egypt",                dialCode: "+20",  flag: "🇪🇬" },
  { code: "PK", name: "Pakistan",             dialCode: "+92",  flag: "🇵🇰" },
  { code: "IN", name: "India",                dialCode: "+91",  flag: "🇮🇳" },
  { code: "GB", name: "United Kingdom",       dialCode: "+44",  flag: "🇬🇧" },
  { code: "US", name: "United States",        dialCode: "+1",   flag: "🇺🇸" },
  { code: "CA", name: "Canada",               dialCode: "+1",   flag: "🇨🇦" },
  { code: "AU", name: "Australia",            dialCode: "+61",  flag: "🇦🇺" },
  { code: "DE", name: "Germany",              dialCode: "+49",  flag: "🇩🇪" },
  { code: "FR", name: "France",               dialCode: "+33",  flag: "🇫🇷" },
  { code: "SG", name: "Singapore",            dialCode: "+65",  flag: "🇸🇬" },
];

export function FreeMasterclassPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const [formState, setFormState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ticketNum, setTicketNum] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in your full name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your WhatsApp/phone number.");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms to continue.");
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
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          dialCode: country.dialCode,
          countryCode: country.code,
          fullPhoneNumber,
          goal: "workshop",
          workshopTitle: "6 AI Automations Masterclass — Build & Sell For $500–$2,500/Mo",
          source: "freemasterclass-direct-page",
          submittedAt: new Date().toISOString(),
          ticketNumber: generatedTicket,
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
    <div className="relative min-h-screen bg-[#07070c] text-zinc-100 font-sans selection:bg-volt selection:text-void flex flex-col justify-between overflow-x-hidden">
      {/* Background Gradients & Glows */}
      <div className="pointer-events-none fixed inset-0 bg-grid-dark opacity-30" />
      <div
        className="pointer-events-none fixed left-1/2 top-12 -translate-x-1/2 h-[50vh] w-[70vw] max-w-4xl rounded-full blur-[160px]"
        style={{ background: "rgba(204,242,68,0.08)" }}
      />
      <div
        className="pointer-events-none fixed right-10 bottom-10 h-[40vh] w-[40vw] rounded-full blur-[140px]"
        style={{ background: "rgba(181,161,255,0.06)" }}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070c]/85 backdrop-blur-xl px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <a href="/" className="transition-opacity hover:opacity-85">
            <Wordmark />
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/progress"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-volt transition hover:bg-volt hover:text-void"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Roadmap To $50K/Mo</span>
            </a>
            <a
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 font-mono text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              ← Main Site
            </a>
          </div>
        </div>
      </header>

      {/* Main Registration Box */}
      <main className="relative z-10 mx-auto w-full max-w-xl px-4 py-8 sm:py-12 flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-3xl border border-volt/30 bg-[#0c0c16]/95 p-6 sm:p-9 shadow-[0_0_80px_rgba(204,242,68,0.15)] backdrop-blur-xl overflow-hidden"
        >
          {/* Subtle Ambient Lighting Inside Card */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-volt/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-lilac/10 blur-3xl" />
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-volt to-transparent" />

          {formState === "success" ? (
            /* Success State */
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
                ⚡ Registration Confirmed
              </span>
              <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                You're On The List! 🎉
              </h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                We've reserved your free seat for <strong className="text-white">This Saturday's Live Masterclass</strong>. A confirmation email with access links was sent to <span className="text-volt font-mono font-semibold">{email}</span>.
              </p>

              {/* Ticket Badge */}
              <div className="my-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  Your Masterclass Access Ticket
                </p>
                <div className="mt-1 font-mono text-xl font-black tracking-widest text-volt">
                  {ticketNum}
                </div>
              </div>

              {/* WhatsApp VIP Community */}
              <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-center">
                <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  💬 VIP Community Access
                </p>
                <p className="mt-1 text-xs text-zinc-300">
                  Join the official AI Founder Hub WhatsApp community to get class reminders, templates & resources.
                </p>
                <a
                  href="https://chat.whatsapp.com/FBrasZIfmvLAZxcR2Yjcho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-black uppercase tracking-wider transition hover:bg-[#20bd5a] hover:shadow-[0_0_25px_rgba(37,211,102,0.45)]"
                >
                  Join VIP WhatsApp Community →
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/progress"
                  className="flex-1 rounded-xl bg-volt py-3 text-center font-display text-xs font-extrabold uppercase tracking-wider text-void hover:bg-[#d4fa4c] transition"
                >
                  Explore $50K Roadmap →
                </a>
                <a
                  href="/"
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center font-mono text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition"
                >
                  Return to Home
                </a>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <div className="relative z-10">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-volt/25 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase text-volt mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse" />
                <span>Next Live Class: This Saturday (Limited Seats)</span>
              </div>

              {/* Title & Core Hook */}
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                <span className="text-volt">6 AI AUTOMATIONS</span> YOU CAN SELL FOR $500–2,500/MO
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                Join our free live masterclass this Saturday. We'll break down the 6 money making automations local businesses are actually paying monthly for in 2026 — then build one live, end to end, so you leave with something working and know exactly how to price it.
              </p>

              {/* Highlights Bar */}
              <div className="my-5 grid grid-cols-3 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center">
                <div className="border-r border-zinc-800/80 pr-1">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Format</p>
                  <p className="text-xs font-bold text-white mt-0.5">Live + Q&amp;A</p>
                </div>
                <div className="border-r border-zinc-800/80 px-1">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">You Leave With</p>
                  <p className="text-xs font-bold text-volt mt-0.5">A working AI agent</p>
                </div>
                <div className="pl-1">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Access</p>
                  <p className="text-xs font-bold text-white mt-0.5">100% Free</p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 font-medium"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/60 focus:bg-zinc-900 focus:shadow-[0_0_15px_rgba(204,242,68,0.1)]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/60 focus:bg-zinc-900 focus:shadow-[0_0_15px_rgba(204,242,68,0.1)]"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    WhatsApp / Phone Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCountryOpen(!countryOpen)}
                        className="flex h-full items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-3 font-mono text-xs text-white transition hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer"
                      >
                        <span className="text-base">{country.flag}</span>
                        <span>{country.dialCode}</span>
                        <ChevronDown className="h-3 w-3 text-zinc-500" />
                      </button>

                      {countryOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setCountryOpen(false)}
                          />
                          <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-60 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-2xl">
                            {COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setCountry(c);
                                  setCountryOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${
                                  country.code === c.code
                                    ? "bg-volt/15 text-volt font-bold"
                                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                }`}
                              >
                                <span className="text-sm">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="font-mono text-zinc-500">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="50 123 4567"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/60 focus:bg-zinc-900 focus:shadow-[0_0_15px_rgba(204,242,68,0.1)]"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-volt cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-xs text-zinc-400 cursor-pointer">
                    I accept the terms and agree to receive masterclass access &amp; reminder updates.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-volt py-4 font-display text-sm font-black uppercase tracking-wider text-void shadow-[0_0_30px_rgba(204,242,68,0.3)] transition hover:shadow-[0_0_45px_rgba(204,242,68,0.55)] active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
                >
                  <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                  {formState === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-void border-t-transparent" />
                      <span>Reserving Your Seat...</span>
                    </span>
                  ) : (
                    <>
                      <span>CLAIM FREE SEAT</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <p className="text-center font-mono text-[10px] text-zinc-500 pt-1">
                  🔒 Instant email confirmation · 100% Free · No pitch until the last 10 minutes
                </p>
              </form>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} AI Founder Hub · All rights reserved.</p>
      </footer>
    </div>
  );
}
