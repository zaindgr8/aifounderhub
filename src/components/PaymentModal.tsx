import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShieldCheck, Lock, Zap, AlertCircle, Loader2 } from "lucide-react";
import { initiateZiinaPayment } from "../lib/api";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus name field when modal opens
  useEffect(() => {
    if (open) {
      setError(null);
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
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
      setError("Please fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await initiateZiinaPayment({ fullName: fullName.trim(), email: email.trim() });

      if (!result.ok || !result.redirect_url) {
        setError(result.error ?? "Payment initiation failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Ziina's hosted checkout page
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_32px_100px_rgba(0,0,0,0.8)]">
              {/* Volt glow top */}
              <div
                className="pointer-events-none absolute -top-16 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full blur-[60px]"
                style={{ background: "rgba(204,242,68,0.18)" }}
              />

              {/* Header */}
              <div className="relative border-b border-white/8 px-7 pb-5 pt-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                  id="payment-modal-close"
                >
                  <X className="h-4 w-4" />
                </button>

                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-volt">
                  ⚡ AI Founder Hub
                </span>
                <h2
                  id="payment-modal-title"
                  className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white"
                >
                  Get Instant Access
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Complete your details to proceed to secure checkout.
                </p>
              </div>

              {/* Price badge */}
              <div className="mx-7 mt-5 flex items-center justify-between rounded-xl border border-volt/20 bg-volt/5 px-4 py-3">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                    Idea to Live Product Course
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-zinc-200">
                    Lifetime access · Private community · All modules
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 line-through">$549</p>
                  <p className="font-display text-2xl font-black text-volt">$159</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-7 py-5" noValidate>
                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="payment-fullname"
                      className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500"
                    >
                      Full Name
                    </label>
                    <input
                      ref={nameRef}
                      id="payment-fullname"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setError(null); }}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none ring-0 transition-colors focus:border-volt/50 focus:bg-white/8"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="payment-email"
                      className="mb-1.5 block font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500"
                    >
                      Email Address
                    </label>
                    <input
                      id="payment-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none ring-0 transition-colors focus:border-volt/50 focus:bg-white/8"
                      required
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
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
                  id="payment-submit-btn"
                  type="submit"
                  disabled={loading}
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

                {/* Powered by Ziina */}
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
