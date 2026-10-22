import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Mail,
  User,
  Phone,
  ChevronDown,
  Lock,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
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
  { name: "Qatar",                code: "QA", flag: "🇶🇦", dialCode: "+974" },
  { name: "Kuwait",               code: "KW", flag: "🇰🇼", dialCode: "+965" },
  { name: "Bahrain",              code: "BH", flag: "🇧🇭", dialCode: "+973" },
  { name: "Oman",                 code: "OM", flag: "🇴🇲", dialCode: "+968" },
  { name: "India",                code: "IN", flag: "🇮🇳", dialCode: "+91"  },
  { name: "Pakistan",             code: "PK", flag: "🇵🇰", dialCode: "+92"  },
  { name: "Egypt",                code: "EG", flag: "🇪🇬", dialCode: "+20"  },
  { name: "Canada",               code: "CA", flag: "🇨🇦", dialCode: "+1"   },
  { name: "Australia",            code: "AU", flag: "🇦🇺", dialCode: "+61"  },
  { name: "Singapore",            code: "SG", flag: "🇸🇬", dialCode: "+65"  },
  { name: "Germany",              code: "DE", flag: "🇩🇪", dialCode: "+49"  },
  { name: "France",               code: "FR", flag: "🇫🇷", dialCode: "+33"  },
];

const PRESET_SYSTEMS = [
  "RETELL AI × CLAUDE: Your First AI Caller in 5 Minutes",
  "(FREE) AI-Personalized Emails → 1000+ Leads",
  "(SupaBase) AI-Personalized Emails → 1000+ Leads",
  "BUILD YOUR STARTUP WITH AI — FROM IDEA TO LIVE APP",
  "Build an AI Call Assistant & Sell for $2,000+",
  "Custom AI Voice / Calling Agent (Vapi / Retell / Bland)",
  "Custom Cold Email & AI Lead Enrichment System (n8n / Supabase)",
  "Custom AI Customer Support & WhatsApp Chatbot",
  "Full-Stack AI Application / SaaS MVP",
  "Other Custom Automation / Agent",
];

const TIMELINE_OPTIONS = [
  "ASAP (Within 1-2 weeks)",
  "2-4 weeks",
  "1-2 months",
  "Flexible / Planning phase",
];

const BUDGET_OPTIONS = [
  "$1,000 - $2,500 (MVP / Quick Setup)",
  "$2,500 - $5,000 (Standard System)",
  "$5,000 - $10,000 (End-to-End Enterprise)",
  "$10,000+ (Complex Custom Architecture)",
  "Discuss on scoping call",
];

export interface HelpBuildModalProps {
  open: boolean;
  onClose: () => void;
  initialResource?: string;
  defaultName?: string;
  defaultEmail?: string;
}

type FormState = "idle" | "loading" | "success";

export function HelpBuildModal({
  open,
  onClose,
  initialResource,
  defaultName = "",
  defaultEmail = "",
}: HelpBuildModalProps) {
  const [fullName, setFullName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState(initialResource || PRESET_SYSTEMS[0]);
  const [projectDetails, setProjectDetails] = useState("");
  const [timeline, setTimeline] = useState(TIMELINE_OPTIONS[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [ticketNum, setTicketNum] = useState<string>("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial resource and defaults when opened
  useEffect(() => {
    if (open) {
      setError(null);
      setFormState("idle");
      if (initialResource) {
        setResourceTitle(initialResource);
      }
      if (defaultName && !fullName) setFullName(defaultName);
      if (defaultEmail && !email) setEmail(defaultEmail);
      setTimeout(() => nameInputRef.current?.focus(), 200);
    }
  }, [open, initialResource, defaultName, defaultEmail]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (countryDropdownOpen) setCountryDropdownOpen(false);
        else onClose();
      }
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, countryDropdownOpen]);

  // Click outside country dropdown
  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [countryDropdownOpen]);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please provide your WhatsApp / phone number.");
      return;
    }
    if (!projectDetails.trim()) {
      setError("Please describe what you want the AFH team to build.");
      return;
    }

    setError(null);
    setFormState("loading");

    const fullPhoneNumber = `${country.dialCode} ${phone.trim()}`;

    try {
      let res = await fetch("/api/help-build-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          countryCode: country.code,
          dialCode: country.dialCode,
          fullPhoneNumber,
          resourceTitle,
          projectDetails: projectDetails.trim(),
          timeline,
          budget,
          source: "resources-help-build",
        }),
      });

      // Fallback in case local server hasn't restarted yet
      if (res.status === 404) {
        res = await fetch("/api/send-lead-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            countryCode: country.code,
            dialCode: country.dialCode,
            fullPhoneNumber,
            goal: "help-me-build",
            workshopTitle: `Help Me Build: ${resourceTitle}`,
            reason: `Details: ${projectDetails.trim()} | Timeline: ${timeline} | Budget: ${budget}`,
            source: "resources-help-build",
          }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        setTicketNum(data.ticketNumber || `AFH-DEV-${Date.now().toString(36).toUpperCase().slice(-5)}`);
        setFormState("success");
      } else {
        setError(data.error || "Failed to submit request. Please try again or reach out on WhatsApp.");
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
            key="help-build-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[111] flex items-center justify-center p-3 sm:p-4 overflow-y-auto pointer-events-none">
            <motion.div
              key="help-build-modal"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-volt/30 bg-[#0c0c16] p-6 sm:p-8 shadow-[0_0_80px_rgba(204,242,68,0.15)] my-auto text-zinc-100"
            >
              {/* Background ambient glows */}
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
                    ⚡ Request Dispatched to Engineering
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                    We're Ready to Build! 🚀
                  </h3>
                  <p className="mt-2 text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                    We've received your build specifications for <strong className="text-white">{resourceTitle}</strong>.
                    A confirmation email has been sent to <span className="text-volt font-mono font-semibold">{email}</span>.
                  </p>

                  {/* Ticket Badge */}
                  <div className="my-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                      Your Engineering Ticket Reference
                    </p>
                    <div className="mt-1 font-mono text-xl font-black tracking-widest text-volt">
                      {ticketNum}
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      An AFH Technical Lead will reach out to you within 24 hours via WhatsApp &amp; Email.
                    </p>
                  </div>

                  {/* Fast Track WhatsApp Contact */}
                  <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      💬 Want Urgent Scoping?
                    </p>
                    <p className="mt-1 text-xs text-zinc-300">
                      Message our team directly on WhatsApp with your ticket reference for instant review.
                    </p>
                    <a
                      href={`https://wa.me/971500000000?text=${encodeURIComponent(
                        `Hi Zain! I just submitted a Help Me Build request on AI Founder Hub for "${resourceTitle}" (Ref: ${ticketNum}). Can we discuss the scope?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-bold text-black uppercase tracking-wider transition hover:bg-[#20bd5a] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
                    >
                      Chat on WhatsApp Now →
                    </a>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 font-display text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
                  >
                    Done &amp; Return to Dashboard
                  </button>
                </div>
              ) : (
                /* Form View */
                <div className="relative z-10">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-volt/25 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase text-volt mb-2">
                    <Sparkles className="h-3 w-3 animate-pulse text-volt" />
                    <span>AFH Engineering &amp; Build Squad</span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                    Help Me Build / Hire Developer
                  </h2>
                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                    Don't want to build it alone? Have our team of verified AI engineers build, integrate, and deploy this system directly into your business or client stack.
                  </p>

                  {/* Highlights Bar */}
                  <div className="my-4 grid grid-cols-3 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 text-center">
                    <div className="border-r border-zinc-800/80 pr-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">TURNAROUND</p>
                      <p className="text-[11px] font-bold text-white mt-0.5">24h First Contact</p>
                    </div>
                    <div className="border-r border-zinc-800/80 px-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">TEAM</p>
                      <p className="text-[11px] font-bold text-volt mt-0.5">Verified Builders</p>
                    </div>
                    <div className="pl-1">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">SUPPORT</p>
                      <p className="text-[11px] font-bold text-white mt-0.5">Direct WhatsApp</p>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 font-medium"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Your Name <span className="text-volt">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            ref={nameInputRef}
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Alex Morgan"
                            disabled={formState === "loading"}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Email Address <span className="text-volt">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@company.com"
                            disabled={formState === "loading"}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone with Country Picker */}
                    <div>
                      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        WhatsApp / Phone Number <span className="text-volt">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative shrink-0" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setCountryDropdownOpen((v) => !v)}
                            disabled={formState === "loading"}
                            className="flex h-[40px] items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 text-xs text-white transition hover:border-zinc-700 focus:border-volt focus:outline-none"
                          >
                            <span className="text-base">{country.flag}</span>
                            <span className="font-mono text-zinc-400">{country.dialCode}</span>
                            <ChevronDown className="h-3 w-3 text-zinc-500" />
                          </button>

                          {countryDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1.5 z-50 max-h-52 w-56 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950 p-1 shadow-2xl">
                              {COUNTRIES.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setCountry(c);
                                    setCountryDropdownOpen(false);
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

                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="50 123 4567"
                            disabled={formState === "loading"}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Which Resource / System */}
                    <div>
                      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Which Resource / System Do You Need Help With? <span className="text-volt">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white transition focus:border-volt focus:outline-none cursor-pointer"
                        >
                          {PRESET_SYSTEMS.map((item) => (
                            <option key={item} value={item} className="bg-zinc-950 text-white">
                              {item}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      </div>
                    </div>

                    {/* Project Details */}
                    <div>
                      <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Project Details &amp; Requirements <span className="text-volt">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={projectDetails}
                        onChange={(e) => setProjectDetails(e.target.value)}
                        placeholder="Tell us what you need built, existing tools (e.g. Supabase, n8n, Twilio, Retell, Claude), your goals, and any specific integrations..."
                        disabled={formState === "loading"}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 transition focus:border-volt focus:outline-none resize-none"
                      />
                    </div>

                    {/* Timeline & Budget Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Timeline
                        </label>
                        <div className="relative">
                          <select
                            value={timeline}
                            onChange={(e) => setTimeline(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 pr-10 text-xs text-white transition focus:border-volt focus:outline-none cursor-pointer"
                          >
                            {TIMELINE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-zinc-950 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Estimated Budget
                        </label>
                        <div className="relative">
                          <select
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 pr-10 text-xs text-white transition focus:border-volt focus:outline-none cursor-pointer"
                          >
                            {BUDGET_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-zinc-950 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={formState === "loading"}
                      className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-void transition-all hover:bg-[#d8fa55] hover:shadow-[0_0_35px_rgba(204,242,68,0.4)] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {formState === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-void" />
                          <span>Dispatching to Engineering...</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="h-4 w-4 text-void" />
                          <span>SUBMIT BUILD REQUEST</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <p className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                      <Lock className="h-3 w-3 text-zinc-500" />
                      <span>Confidential NDA protected · Instant email &amp; WhatsApp alert dispatched</span>
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
