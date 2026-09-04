import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Zap, Check, X, KeyRound, Sparkles, ArrowRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface LockedStageModalProps {
  open: boolean;
  onClose: () => void;
  stageNumber: number;
  stageTitle: string;
  stageTarget: string;
  user: User | null;
  onOpenAuth: () => void;
  onOpenPayment: () => void;
}

const UNLOCKED_BENEFITS = [
  "Production-Grade Retell AI & Vapi Voice Assistant Prompts",
  "Complete n8n & Make.com CRM Synchronization Blueprints",
  "High-Converting Cold Outreach Campaigns & Email Templates",
  "The Exact $2,000 Setup + $600/mo Retainer Contract Templates",
  "Franchise & Enterprise Multi-Location Scaling Frameworks",
  "Private Builders Community & Weekly Live Build Office Hours",
];

export function LockedStageModal({
  open,
  onClose,
  stageNumber,
  stageTitle,
  stageTarget,
  user,
  onOpenAuth,
  onOpenPayment,
}: LockedStageModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lock-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
            <motion.div
              key="lock-modal"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-lg rounded-3xl border border-volt/30 bg-[#0d0d18] p-6 sm:p-8 shadow-[0_0_80px_rgba(204,242,68,0.18)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effects */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-volt/12 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-emerald-500/8 blur-[70px]" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-500 hover:border-white/25 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header Badge */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-volt/30 bg-volt/10 text-volt shadow-[0_0_20px_rgba(204,242,68,0.25)]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-volt">
                      Stage {stageNumber} Locked
                    </span>
                    <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.2 font-mono text-[9.5px] font-bold text-emerald-400">
                      Target: {stageTarget}
                    </span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold uppercase text-white tracking-tight">
                    {stageTitle}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed mb-5">
                {user ? (
                  <>
                    You are logged in as <span className="text-volt font-bold">{user.email}</span>. Unlock Stages 2 through 6 with full blueprints, SOPs, and community access.
                  </>
                ) : (
                  <>
                    Stages 2 through 6 contain the exact system blueprints, outbound campaigns, and scaling frameworks to reach <span className="text-volt font-bold">$50,000/mo</span>.
                  </>
                )}
              </p>

              {/* Benefits Checklist */}
              <div className="space-y-2 rounded-2xl border border-white/8 bg-white/[0.03] p-4 mb-6">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-volt" />
                  <span>Everything Unlocked In Paid Membership:</span>
                </div>
                {UNLOCKED_BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-volt/15 text-volt mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* CTA Action */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenPayment();
                  }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_30px_rgba(204,242,68,0.35)] hover:shadow-[0_0_50px_rgba(204,242,68,0.6)] active:scale-95 transition cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>Unlock AAA Accelerator ($1,499) →</span>
                </button>

                {!user && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-2.5 font-display text-xs font-bold uppercase text-zinc-300 hover:border-volt/50 hover:text-white transition cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Already a paid member? Login Here</span>
                  </button>
                )}
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={onClose}
                  className="font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                >
                  Cancel & Return to Free Stage 1
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
