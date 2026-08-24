import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, Loader2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { confirmZiinaPayment } from "../lib/api";

type PageState = "loading" | "success" | "failed";

export function PaymentSuccess() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Ziina appends payment_intent_id to the success_url
    const paymentIntentId =
      params.get("payment_intent_id") ||
      params.get("paymentIntentId") ||
      params.get("id");

    if (!paymentIntentId) {
      setErrorMsg("No payment ID found in the URL. Please contact support.");
      setPageState("failed");
      return;
    }

    confirmZiinaPayment(paymentIntentId)
      .then((result) => {
        if (result.ok) {
          setPageState("success");
        } else {
          setErrorMsg(result.error ?? `Payment status: ${result.status}`);
          setPageState("failed");
        }
      })
      .catch(() => {
        setErrorMsg("Could not verify your payment. Please contact support.");
        setPageState("failed");
      });
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden font-sans text-zinc-100"
      style={{ background: "#07070b" }}
    >
      {/* Grain texture */}
      <div className="grain" aria-hidden="true" />

      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(204,242,68,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Nav bar */}
      <header className="relative z-10 border-b border-white/5 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline">
            <Zap className="h-5 w-5 text-volt" />
            <span className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
              AI Founder Hub
            </span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex min-h-[calc(100vh-65px)] items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg text-center">
          <AnimatePresence mode="wait">
            {/* ── LOADING ── */}
            {pageState === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-volt/20 bg-volt/5">
                  <Loader2 className="h-8 w-8 animate-spin text-volt" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">
                    Verifying Payment…
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500">
                    Please wait while we confirm your purchase.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS ── */}
            {pageState === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-8"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
                  className="relative flex h-24 w-24 items-center justify-center"
                >
                  {/* Pulsing ring */}
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt/20" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-volt/50 bg-volt/10">
                    <CheckCircle className="h-12 w-12 text-volt" />
                  </div>
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-volt">
                    ⚡ Payment Confirmed
                  </span>
                  <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-5xl">
                    You're In! 🎉
                  </h1>
                  <p className="mt-3 text-base leading-relaxed text-zinc-400">
                    Your payment was successful. A confirmation email is on its way to your inbox with access details.
                  </p>
                </motion.div>

                {/* Receipt card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="w-full rounded-2xl border border-volt/15 bg-gradient-to-br from-volt/5 to-transparent p-6 text-left"
                >
                  <p className="mb-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    What you unlocked
                  </p>
                  <div className="space-y-3">
                    {[
                      "AI Lead Management System — Complete Build & Setup Blueprint",
                      "AI Call Assistant — Retell AI + Cal.com Voice Agent Suite",
                      "AAA Agency Launch — Niche, Offer & Outreach Playbook",
                      "Private Builders Community — Online & Dubai Meetups",
                      "Sales & Closing Playbook — Scripts to Land Your First $2,000 Client",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-volt/20">
                          <CheckCircle className="h-2.5 w-2.5 text-volt" />
                        </span>
                        <span className="text-[13px] font-semibold text-zinc-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Trust + CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-volt" />
                    Secured by Ziina · PCI Compliant
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <a
                      href="/progress"
                      id="payment-success-progress-btn"
                      className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-volt px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-void shadow-[0_0_40px_rgba(204,242,68,0.3)] transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(204,242,68,0.55)] no-underline w-full sm:w-auto cursor-pointer"
                    >
                      <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/30 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
                      <span className="relative">Track My Progress Game →</span>
                    </a>

                    <a
                      href="/"
                      id="payment-success-home-btn"
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/10 hover:text-white transition w-full sm:w-auto"
                    >
                      Return Home
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ── FAILED ── */}
            {pageState === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">
                    Payment Issue
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {errorMsg || "Something went wrong with your payment."}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    If you were charged, please contact{" "}
                    <a
                      href="mailto:support@aifounderhub.com"
                      className="text-volt underline"
                    >
                      support@aifounderhub.com
                    </a>
                  </p>
                </div>
                <a
                  href="/"
                  id="payment-failed-home-btn"
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-white/10 no-underline"
                >
                  Try Again
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
