import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { captureLead, initiateZiinaPayment } from "../lib/api";
import { trackBeginCheckout, trackLead } from "../lib/analytics";
import { AAA_COHORT, AAA_SEATS_LEFT, PRODUCTS, formatPrice } from "../lib/products";

/**
 * Two-step enrolment for the AAA Accelerator founding cohort.
 *
 * The page promised "enrolment is by short application" while every CTA went
 * straight to a payment on a different page. This keeps the qualifying step
 * the copy promises, captures the applicant either way (so a drop-off at the
 * payment step is still a lead), and then hands off to Ziina at the correct
 * $1,500 — without bouncing anyone to the homepage.
 */

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", dialCode: "+971" },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", dialCode: "+966" },
  { name: "Oman", code: "OM", flag: "🇴🇲", dialCode: "+968" },
  { name: "Qatar", code: "QA", flag: "🇶🇦", dialCode: "+974" },
  { name: "Kuwait", code: "KW", flag: "🇰🇼", dialCode: "+965" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { name: "United States", code: "US", flag: "🇺🇸", dialCode: "+1" },
  { name: "India", code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", dialCode: "+92" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", dialCode: "+234" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", dialCode: "+65" },
];

const STAGES = [
  { id: "nothing-built", label: "I've watched the masterclass but haven't built anything yet" },
  { id: "half-working", label: "I've built something that half-works and breaks" },
  { id: "can-build-cant-sell", label: "I can build it — I don't know how to find or close clients" },
  { id: "running-agency", label: "I'm already running an agency and want to add AI services" },
];

export function AAAApplicationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const product = PRODUCTS["aaa-accelerator"];

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stage, setStage] = useState(STAGES[0].id);
  const [canCommit, setCanCommit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setTimeout(() => nameRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function submitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return setError("Please tell us your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (!phone.trim()) return setError("A phone number is required — the 1-on-1 calls are scheduled on it.");
    if (!canCommit) return setError("The programme needs 8–10 hours a week. Please confirm you can commit.");

    setError(null);
    setLoading(true);
    try {
      /* capture first: someone who abandons at payment is still a warm lead */
      await captureLead({
        firstName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        countryCode: country.code,
        dialCode: country.dialCode,
        goal: "agency",
        source: "aaa-accelerator-application",
      });
      trackLead({ source: "aaa-accelerator-application", goal: "agency", value: product.priceCents / 100 });

      try {
        localStorage.setItem("afh_customer_name", fullName.trim());
        localStorage.setItem("afh_customer_email", email.trim());
        localStorage.setItem("afh_customer_phone", phone.trim());
      } catch {
        /* ignore — private browsing */
      }

      setStep(2);
    } catch {
      setError("Something went wrong saving your application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function goToPayment() {
    setError(null);
    setLoading(true);
    try {
      trackBeginCheckout({ product: product.code, value: product.priceCents / 100 });
      const result = await initiateZiinaPayment({
        fullName: fullName.trim(),
        email: email.trim(),
        amount: product.priceCents,
        message: product.checkoutMessage,
        productCode: product.code,
        cancelPath: product.cancelPath,
      });
      if (result?.ok && result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }
      setError(result?.error || "Could not start the payment. Please try again or message us on WhatsApp.");
    } catch {
      setError("Could not reach the payment provider. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-xl border bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:bg-white/[0.07] focus:ring-4 focus:ring-volt/10 border-edge focus:border-volt/60";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Apply for the AAA Accelerator"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-volt/25 bg-panel shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
          >
            {/* header */}
            <div className="border-b border-edge bg-void/60 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-volt">
                    {step === 1 ? "Step 1 of 2 · Application" : "Step 2 of 2 · Secure your seat"}
                  </span>
                  <h2 className="mt-1.5 font-display text-xl font-black uppercase tracking-tight text-white">
                    AAA Accelerator
                  </h2>
                  <p className="mt-1 font-mono text-[10.5px] text-zinc-500">
                    Cohort starts {AAA_COHORT.startDate} · {AAA_SEATS_LEFT} of {AAA_COHORT.seatsTotal} seats left
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-edge text-zinc-500 transition-colors hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-volt"
                  animate={{ width: step === 1 ? "50%" : "100%" }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={submitApplication} className="space-y-4 px-6 py-6" noValidate>
                <p className="text-[13px] leading-relaxed text-zinc-400">
                  Eight seats, because every build gets reviewed individually. Three short questions so the sessions are
                  aimed at the right level.
                </p>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    ref={nameRef}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="FULL NAME"
                    className={`${inputBase} pl-11`}
                  />
                </div>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL ADDRESS"
                    className={`${inputBase} pl-11`}
                  />
                </div>

                <div className="flex overflow-visible rounded-xl border border-edge bg-white/[0.04]">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="flex h-full items-center gap-1.5 border-r border-edge px-3.5 transition-colors hover:bg-white/5 cursor-pointer"
                    >
                      <span className="select-none text-xl leading-none">{country.flag}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute left-0 top-full z-50 mt-2 max-h-56 w-60 overflow-y-auto rounded-xl border border-edge bg-panel py-1.5 shadow-2xl"
                        >
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setCountry(c);
                                setDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                                country.code === c.code ? "bg-volt text-void" : "text-zinc-300 hover:bg-white/5"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <span className="text-base leading-none">{c.flag}</span>
                                {c.name}
                              </span>
                              <span className="font-mono text-[10px] opacity-70">{c.dialCode}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex flex-1 items-center">
                    <Phone className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9\- ()]/g, ""))}
                      placeholder="WHATSAPP NUMBER"
                      className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm font-semibold text-white placeholder-zinc-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block pl-1 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Where are you right now?
                  </label>
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
                        stage === s.id ? "border-volt/40 bg-volt/[0.07]" : "border-edge bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          stage === s.id ? "border-volt bg-volt" : "border-white/25"
                        }`}
                      >
                        {stage === s.id && <span className="h-1.5 w-1.5 rounded-full bg-void" />}
                      </span>
                      <span className="text-[12.5px] leading-relaxed text-zinc-300">{s.label}</span>
                    </button>
                  ))}
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-edge bg-white/[0.02] p-3">
                  <input
                    type="checkbox"
                    checked={canCommit}
                    onChange={(e) => setCanCommit(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-edge bg-void accent-[#ccf244]"
                  />
                  <span className="text-[12.5px] leading-relaxed text-zinc-300">
                    I can commit <strong className="text-white">8–10 hours a week for six weeks</strong>, including the
                    outreach in weeks 4–6.
                  </span>
                </label>

                {error && (
                  <p className="flex items-start gap-1.5 text-xs font-medium text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-4 font-display text-[14px] font-extrabold uppercase tracking-wide text-void transition hover:shadow-[0_0_40px_rgba(204,242,68,0.4)] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <div className="space-y-4 px-6 py-6">
                <div className="flex items-start gap-3 rounded-xl border border-volt/25 bg-volt/[0.06] p-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-volt" strokeWidth={3} />
                  <p className="text-[13px] leading-relaxed text-zinc-300">
                    Application saved, <strong className="text-white">{fullName.split(" ")[0]}</strong>. Secure your seat
                    below — you'll get the onboarding email and the WhatsApp group link straight after payment.
                  </p>
                </div>

                <div className="rounded-2xl border border-edge bg-void/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-[15px] font-extrabold uppercase text-white">
                        {product.label}
                      </h3>
                      <p className="mt-1 font-mono text-[10.5px] text-zinc-500">
                        {AAA_COHORT.weeks} weeks live · starts {AAA_COHORT.startDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 line-through">
                        {AAA_COHORT.nextCohortPrice}
                      </p>
                      <p className="font-display text-2xl font-black text-volt">{formatPrice(product.priceCents)}</p>
                      <p className="font-mono text-[8.5px] text-zinc-500">one-time · founding cohort</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-edge pt-4 font-mono text-[11px] text-zinc-400">
                    <p>
                      Includes {AAA_COHORT.freeCommunityMonths} months of community access. Continues at{" "}
                      {AAA_COHORT.monthlyAfter}/month from month {AAA_COHORT.freeCommunityMonths + 1} — cancel anytime.
                    </p>
                    <p>Tool costs (Retell AI, Twilio, Cal.com, Clay) are billed by those providers, not by us.</p>
                  </div>
                </div>

                {error && (
                  <p className="flex items-start gap-1.5 text-xs font-medium text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                  </p>
                )}

                <button
                  onClick={goToPayment}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-4 font-display text-[14px] font-extrabold uppercase tracking-wide text-void transition hover:shadow-[0_0_40px_rgba(204,242,68,0.4)] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Pay {formatPrice(product.priceCents)} · Secure my seat
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-500 transition-colors hover:text-white cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-volt" /> Secure checkout via Ziina
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
