import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import {
  Users,
  CalendarDays,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  User,
  Mail,
  Globe,
  X,
  Sparkles,
} from "lucide-react";

export const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/FBrasZIfmvLAZxcR2Yjcho";
export const LUMA_URL = "https://luma.com/aifounderhub";

const JOINED_KEY = "afh_community_joined";

export function hasJoinedCommunity(): boolean {
  try {
    return localStorage.getItem(JOINED_KEY) === "true";
  } catch {
    return false;
  }
}

type FormState = "idle" | "loading" | "success";

/* ─────────────────────────────────────────────────────────────────────────────
   Application modal — shared by the landing-page nav dropdown and the
   /progress Community tab.
───────────────────────────────────────────────────────────────────────────── */

interface CommunityApplyModalProps {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  defaultEmail?: string;
  onJoined?: () => void;
}

export function CommunityApplyModal({
  open,
  onClose,
  defaultName = "",
  defaultEmail = "",
  onJoined,
}: CommunityApplyModalProps) {
  const [fullName, setFullName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [about, setAbout] = useState("");
  const [reason, setReason] = useState("");
  const [social, setSocial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>("idle");
  const [emailSent, setEmailSent] = useState(true);

  // Reset + prefill each time it opens
  useEffect(() => {
    if (!open) return;
    setError(null);
    setState("idle");
    if (defaultName && !fullName) setFullName(defaultName);
    if (defaultEmail && !email) setEmail(defaultEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultName, defaultEmail]);

  // Escape closes, body scroll locked while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && state !== "loading" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, state]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email.");
    if (!reason.trim()) return setError("Tell us briefly why you want to join.");

    setError(null);
    setState("loading");

    let dispatched = false;

    try {
      const res = await fetch("/api/join-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          about: about.trim(),
          reason: reason.trim(),
          social: social.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        dispatched = true;
        setEmailSent(Boolean(data.emailSent));
      }
    } catch {
      // Backend request error
    }

    // If serverless endpoint couldn't be reached directly, record lead to Supabase directly
    if (!dispatched) {
      try {
        await supabase.from("leads").upsert(
          {
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            source: "community_application",
            metadata: {
              about: about.trim(),
              reason: reason.trim(),
              social: social.trim(),
              applied_at: new Date().toISOString(),
            },
          },
          { onConflict: "email" },
        );
      } catch {
        // Continue to grant access
      }
      setEmailSent(false);
    }

    try { localStorage.setItem(JOINED_KEY, "true"); } catch { /* ignore */ }
    onJoined?.();
    setState("success");
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-600 focus:border-volt/60 focus:outline-none focus:ring-1 focus:ring-volt/40 transition";
  const areaCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-volt/60 focus:outline-none focus:ring-1 focus:ring-volt/40 transition resize-none";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="community-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
            onClick={() => state !== "loading" && onClose()}
          />
          <motion.div
            key="community-modal"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
          >
            <div className="pointer-events-auto relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d14] shadow-[0_32px_100px_rgba(0,0,0,0.85)]">
              <div className="pointer-events-none absolute -top-16 left-1/2 h-36 w-80 -translate-x-1/2 rounded-full blur-[70px]" style={{ background: "rgba(204,242,68,0.15)" }} />
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-6 sm:p-7 text-left">
                {state === "success" ? (
                  <div className="text-center py-4">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-volt/50 bg-volt/10">
                      <CheckCircle2 className="h-8 w-8 text-volt" />
                    </div>
                    <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white">You're In! 🎉</h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                      {emailSent
                        ? <>We've sent a welcome email to <span className="text-volt">{email}</span>. Jump straight into the community below.</>
                        : <>Your application is saved. Jump straight into the community below.</>}
                    </p>
                    <div className="mt-6 flex flex-col gap-2.5">
                      <a
                        href={WHATSAPP_COMMUNITY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-display text-xs font-extrabold uppercase tracking-wider text-void hover:brightness-110 transition"
                      >
                        <MessageCircle className="h-4 w-4" /> Join WhatsApp Community
                      </a>
                      {/* <a
                        href={LUMA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition"
                      >
                        <CalendarDays className="h-4 w-4" /> See Upcoming Events
                      </a> */}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-volt mb-4">
                      <Sparkles className="h-3 w-3" /> Community Access
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight">Tell us about yourself</h3>
                    <p className="mt-1.5 text-xs text-zinc-500">Takes under a minute. Your WhatsApp invite arrives by email.</p>

                    {error && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input id="community-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className={inputCls} />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input id="community-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="community-about" className="block text-[11px] font-mono text-zinc-400 mb-1">About you</label>
                        <textarea id="community-about" rows={2} maxLength={600} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="e.g. Agency owner in Dubai, running a small marketing team" className={areaCls} />
                      </div>

                      <div>
                        <label htmlFor="community-reason" className="block text-[11px] font-mono text-zinc-400 mb-1">Why do you want to join? <span className="text-volt">*</span></label>
                        <textarea id="community-reason" rows={2} maxLength={600} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Want to add AI services and meet other builders" className={areaCls} />
                      </div>

                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input id="community-social" value={social} onChange={(e) => setSocial(e.target.value)} placeholder="LinkedIn / Instagram / website (optional)" className={inputCls} />
                      </div>

                      <button
                        id="community-submit"
                        type="submit"
                        disabled={state === "loading"}
                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] hover:bg-[#d4fa4c] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {state === "loading" ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                        ) : (
                          <>Join WhatsApp <ArrowRight className="h-4 w-4" /></>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Dashboard panel — two option cards (/progress#community)
───────────────────────────────────────────────────────────────────────────── */

interface CommunityPanelProps {
  defaultName?: string;
  defaultEmail?: string;
}

export function CommunityPanel({ defaultName = "", defaultEmail = "" }: CommunityPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    setAlreadyJoined(hasJoinedCommunity());
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">Join The Community</h2>
        <p className="text-xs text-zinc-500 mt-1">Build alongside other founders — online and at our live events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Option 1: Get Access ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="group relative overflow-hidden rounded-3xl border border-volt/25 bg-[#0d0d16]/90 p-7 shadow-[0_0_40px_rgba(204,242,68,0.06)] hover:shadow-[0_0_60px_rgba(204,242,68,0.13)] transition-all duration-300"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-volt/10 blur-[60px]" />
          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">Option 01</span>
              {alreadyJoined && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Joined
                </span>
              )}
            </div>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-volt/30 bg-volt/10 text-volt">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white leading-tight">
              Get <span className="text-volt">Access</span>
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Tell us a little about yourself. We'll send your welcome pack and invite you to the private WhatsApp community.
            </p>

            <ul className="mt-5 space-y-2.5">
              {[
                "Private WhatsApp group with fellow builders",
                "Early invites to live builds & meetups",
                "Welcome pack: AI Founder Hub + AAA Accelerator",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-volt mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>

            {alreadyJoined ? (
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-display text-xs font-extrabold uppercase tracking-wider text-void hover:brightness-110 transition cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" /> Open WhatsApp Community
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-3 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] hover:bg-[#d4fa4c] transition cursor-pointer"
              >
                Apply To Join <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Option 2: Join Upcoming Event ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="group relative overflow-hidden rounded-3xl border border-lilac/25 bg-[#0d0d16]/90 p-7 hover:shadow-[0_0_60px_rgba(181,161,255,0.12)] transition-all duration-300"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-lilac/10 blur-[60px]" />
          <div className="relative flex h-full flex-col">
            <div className="mb-5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-lilac">Option 02</span>
            </div>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-lilac/30 bg-lilac/10 text-lilac">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white leading-tight">
              Join An <span className="text-lilac">Upcoming Event</span>
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Free live masterclasses and in-person meetups in Dubai. Pick a date and RSVP on Luma.
            </p>

            <ul className="mt-5 space-y-2.5">
              {[
                "Live build sessions — watch real systems get made",
                "Dubai founder meetups & networking",
                "Q&A with the AI Founder Hub team",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-lilac mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>

            <a href={LUMA_URL} target="_blank" rel="noopener noreferrer" className="mt-auto pt-7">
              <span className="flex w-full items-center justify-center gap-2 rounded-xl border border-lilac/40 bg-lilac/10 py-3 font-display text-xs font-extrabold uppercase tracking-wider text-lilac hover:bg-lilac hover:text-void transition cursor-pointer">
                View Events On Luma <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </motion.div>
      </div>

      <CommunityApplyModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultName={defaultName}
        defaultEmail={defaultEmail}
        onJoined={() => setAlreadyJoined(true)}
      />
    </div>
  );
}
