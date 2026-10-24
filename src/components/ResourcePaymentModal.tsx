import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle2,
  FolderOpen,
  Database,
  Sparkles,
} from "lucide-react";
import { initiateZiinaPayment } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { PRODUCTS } from "../lib/products";

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

export interface ResourceItemForCheckout {
  id: string;
  title: string;
  price?: number;
  productCode?: string;
  highlights?: string[];
}

interface ResourcePaymentModalProps {
  open: boolean;
  onClose: () => void;
  resource: ResourceItemForCheckout | null;
}

export function ResourcePaymentModal({
  open,
  onClose,
  resource,
}: ResourcePaymentModalProps) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
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
      } catch {
        /* ignore */
      }

      const authEmail = user?.email || savedEmail;
      const authName =
        (user?.user_metadata?.full_name as string) ||
        (user?.user_metadata?.name as string) ||
        savedName;

      setEmail(authEmail);
      setFullName(authName);
      if (savedPhone) setPhone(savedPhone);

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
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  if (!resource) return null;

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

    try {
      localStorage.setItem("afh_customer_name", fullName.trim());
      localStorage.setItem("afh_customer_email", email.trim());
      localStorage.setItem("afh_customer_phone", phone.trim());
    } catch {
      /* ignore */
    }

    setError(null);
    setLoading(true);

    try {
      const productCode = resource?.productCode || "supabase-email-leads";
      const productCfg = PRODUCTS[productCode as keyof typeof PRODUCTS];
      const amountCents = (resource?.price ?? 25) * 100;
      const message =
        productCfg?.checkoutMessage ||
        `AI Founder Hub — ${resource?.title || "(SupaBase) AI-Personalized Emails → 1000+ Leads"} ($${resource?.price ?? 25})`;

      const result = await initiateZiinaPayment({
        fullName: fullName.trim(),
        email: email.trim(),
        amount: amountCents,
        message,
        productCode,
        cancelPath: "/progress#resources",
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_32px_100px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto">
              {/* Radial glow */}
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-36 w-80 -translate-x-1/2 rounded-full blur-[70px]"
                style={{ background: "rgba(52,211,153,0.18)" }}
              />

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 sm:p-7 relative z-10">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400 mb-4">
                  <Database className="h-3 w-3" />
                  <span>PREMIUM RESOURCE · ONE-TIME ${resource.price ? `$${resource.price}` : '$25'}</span>
                </div>

                {/* Title */}
                <h2 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">
                  {resource.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                  Unlock instant Google Drive access to the production Supabase database architecture, automated email pipelines, and lead workflows.
                </p>

                {/* Price Box */}
                <div className="mt-5 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 to-[#0e0e18] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 font-bold">
                      One-Time Payment
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Lifetime access linked to your account
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-3xl font-black text-emerald-400">
                      ${resource.price ?? 25}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block">USD</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-4 space-y-2 border-t border-b border-white/[0.06] py-3.5">
                  {(resource.highlights || [
                    "Full Supabase SQL database schema & leads management table",
                    "Automated AI email personalization webhook & database triggers",
                    "1,000+ leads outbound infrastructure & tracking integration",
                    "Permanent access unlocked in your AI Founder Hub dashboard",
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Checkout Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <input
                        ref={nameRef}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Zain Ul Abideen"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-mono font-medium text-zinc-400">
                        Email Address
                      </label>
                      {user && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Logged In Account
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* Phone + Country dropdown */}
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-zinc-400 mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white hover:border-white/20 transition cursor-pointer"
                        >
                          <span>{country.flag}</span>
                          <span className="font-mono text-zinc-300">{country.dialCode}</span>
                          <ChevronDown className="h-3 w-3 text-zinc-500" />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute top-full left-0 z-50 mt-1 max-h-56 w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#12121e] py-1 shadow-2xl">
                            {COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setCountry(c);
                                  setDropdownOpen(false);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
                              >
                                <span>{c.flag}</span>
                                <span className="font-mono text-zinc-400">{c.dialCode}</span>
                                <span className="truncate">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="50 123 4567"
                          required
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 px-4 font-display text-xs sm:text-sm font-extrabold uppercase tracking-wide text-void shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:brightness-110 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Redirecting to Ziina…</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ${resource.price ?? 25} with Ziina</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Trust Footer */}
                  <div className="pt-2 text-center">
                    <p className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-zinc-500">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>Secured by Ziina · Apple Pay, Cards & Google Pay</span>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
