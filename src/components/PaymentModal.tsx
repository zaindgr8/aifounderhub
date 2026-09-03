import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShieldCheck, Lock, Zap, AlertCircle, Loader2, User, Mail, Phone, ChevronDown, CheckCircle2 } from "lucide-react";
import { initiateZiinaPayment } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { AAA_COHORT, PRODUCTS, formatPrice } from "../lib/products";
import { trackBeginCheckout } from "../lib/analytics";

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

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [country, setCountry]       = useState<Country>(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const nameRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-fill fields on modal open
  useEffect(() => {
    if (open) {
      setError(null);
      setDropdownOpen(false);

      let savedName = "";
      let savedPhone = "";
      let savedEmail = "";
      try {
        savedName = localStorage.getItem("afh_customer_name") || "";
        savedPhone = localStorage.getItem("afh_customer_phone") || "";
        savedEmail = localStorage.getItem("afh_customer_email") || "";
      } catch { /* ignore */ }

      const authEmail = user?.email || savedEmail;
      const authName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || savedName;

      setEmail(authEmail);
      setFullName(authName);
      if (savedPhone) setPhone(savedPhone);

      // Focus first empty field
      setTimeout(() => {
        if (!authName) {
          nameRef.current?.focus();
        }
      }, 120);
    }
  }, [open, user]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (dropdownOpen) setDropdownOpen(false); else onClose(); }
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
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

    // Persist details in memory
    try {
      localStorage.setItem("afh_customer_name", fullName.trim());
      localStorage.setItem("afh_customer_email", email.trim());
      localStorage.setItem("afh_customer_phone", phone.trim());
    } catch { /* ignore */ }

    setError(null);
    setLoading(true);

    try {
      const product = PRODUCTS["aaa-accelerator"];
      trackBeginCheckout({ product: product.code, value: product.priceCents / 100 });

      const result = await initiateZiinaPayment({
        fullName: fullName.trim(),
        email: email.trim(),
        /* explicit — the server defaults to $159 and silently under-charged
           every founding-cohort enrolment while the UI displayed $1,500 */
        amount: product.priceCents,
        message: product.checkoutMessage,
        productCode: product.code,
        cancelPath: product.cancelPath,
      });

      if (!result.ok || !result.redirect_url) {
        setError(result.error ?? "Payment initiation failed. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = result.redirect_url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog" aria-modal="true" aria-labelledby="payment-modal-title"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_32px_100px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto">
              {/* Volt glow top */}
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full blur-[60px]"
                style={{ background: "rgba(204,242,68,0.18)" }}
              />

              {/* Header */}
              <div className="relative border-b border-white/8 px-7 pb-5 pt-6">
                <button onClick={onClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close" id="payment-modal-close">
                  <X className="h-4 w-4" />
                </button>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-volt">
                  ⚡ AI Founder Hub
                </span>
                <h2 id="payment-modal-title" className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white">
                  Get Instant Access
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Complete your details to proceed to secure checkout.
                </p>
              </div>

              {/* Cohort & Price badge */}
              <div className="mx-7 mt-5 rounded-xl border border-volt/25 bg-volt/[0.06] p-4">
                <div className="flex items-start justify-between border-b border-volt/15 pb-3 mb-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-volt/20 border border-volt/30 px-2 py-0.5 font-mono text-[9.5px] font-extrabold uppercase text-volt">
                      🔥 Next Cohort: 20th September
                    </span>
                    <h3 className="font-display text-base font-black uppercase text-white mt-1.5">
                      AAA Accelerator Program
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-400">
                      Limited seats available for upcoming cohort
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 line-through">
                      {AAA_COHORT.nextCohortPrice}
                    </p>
                    <p className="font-display text-2xl font-black text-volt">
                      {formatPrice(PRODUCTS["aaa-accelerator"].priceCents)}
                    </p>
                    <p className="font-mono text-[8px] text-zinc-500">one-time · founding cohort</p>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[10.5px] text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-volt font-bold text-xs">✓</span>
                    <span>AI Lead Management & Voice Agent Blueprints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-volt font-bold text-xs">✓</span>
                    <span>First $2,000 Client Closing Sales Playbook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-volt font-bold text-xs">✓</span>
                    <span>Weekly Live Build Sessions & Private Community</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-volt font-bold text-xs">✓</span>
                    <span>Full 6-Stage Cloud Roadmap Dashboard Access</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 py-5" noValidate>
                <div className="space-y-3.5">

                  {/* Full Name */}
                  <div>
                    <label htmlFor="payment-fullname" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                      <input
                        ref={nameRef} id="payment-fullname" type="text" autoComplete="name"
                        value={fullName} onChange={(e) => { setFullName(e.target.value); setError(null); }}
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-volt/50 focus:bg-white/8"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="payment-email" className="block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                        Email Address
                      </label>
                      {user && (
                        <span className="font-mono text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Auto-linked
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
                      <input
                        id="payment-email" type="email" autoComplete="email"
                        value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-volt/50 focus:bg-white/8"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone with country code */}
                  <div>
                    <label htmlFor="payment-phone" className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      {/* Country code dropdown */}
                      <div className="relative flex-shrink-0" ref={dropdownRef}>
                        <button type="button" onClick={() => setDropdownOpen((v) => !v)}
                          className="flex h-full items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white transition-colors hover:border-volt/40 outline-none cursor-pointer">
                          <span>{country.flag}</span>
                          <span className="font-mono text-[12px] font-bold text-zinc-300">{country.dialCode}</span>
                          <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {dropdownOpen && (
                            <motion.div key="dd"
                              initial={{ opacity: 0, y: -6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-full z-50 mt-1.5 max-h-52 w-52 overflow-y-auto rounded-xl border border-white/10 bg-[#111118] shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
                            >
                              {COUNTRIES.map((c) => (
                                <button key={c.code} type="button"
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
                          id="payment-phone" type="tel" autoComplete="tel-national"
                          value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^\d\s\-()]/g, "")); setError(null); }}
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
                    <motion.div key="error"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400"
                    >
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA Button */}
                <button
                  id="payment-submit-btn" type="submit" disabled={loading}
                  className="group relative mt-5 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-[14px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_40px_rgba(204,242,68,0.3)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(204,242,68,0.55)] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                  {loading ? (
                    <>
                      <Loader2 className="relative h-4 w-4 animate-spin" />
                      <span className="relative">Redirecting to Checkout…</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">Proceed to Secure Checkout</span>
                      <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* Trust signals */}
                <div className="mt-4 flex items-center justify-center gap-4 text-zinc-600">
                  <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <Lock className="h-3 w-3" /> Secure Checkout
                  </span>
                  <span className="h-3 w-px bg-zinc-700" />
                  <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" /> 7-Day Money Back
                  </span>
                  <span className="h-3 w-px bg-zinc-700" />
                  <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <Zap className="h-3 w-3" /> Instant Access
                  </span>
                </div>
                <p className="mt-3 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                  Powered by Ziina · Encrypted · PCI Compliant
                </p>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
