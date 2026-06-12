import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X } from "lucide-react";

export type ModalKind = "privacy" | "terms" | null;

export function PolicyModal({ active, onClose }: { active: ModalKind; onClose: () => void }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-edge bg-panel shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-edge bg-white/[0.02] p-5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-volt/10 p-1.5 text-volt">
                  <Lock className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
                  {active === "privacy" ? "Privacy Policy" : "Terms of Service"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* body */}
            <div className="max-h-[360px] space-y-4 overflow-y-auto p-6 text-xs leading-relaxed text-zinc-400">
              {active === "privacy" ? (
                <>
                  <p className="font-semibold text-zinc-200">Last updated: June 2026</p>
                  <p>
                    Your privacy is extremely important to us. Here is how your registration data is handled for the
                    AI Founder Hub.
                  </p>
                  <h4 className="pt-2 font-bold uppercase tracking-wide text-zinc-200 text-[13px]">
                    1. Information Collection
                  </h4>
                  <p>
                    We collect your name, email address, and phone number solely to issue your access pass, verify
                    credentials, and deliver training workbook materials and session updates from the Hub.
                  </p>
                  <h4 className="pt-2 font-bold uppercase tracking-wide text-zinc-200 text-[13px]">
                    2. Text (SMS) Notifications
                  </h4>
                  <p>
                    By checking the opt-in checkbox, you explicitly consent to receive automated promotional SMS
                    messages regarding speaker timings and live build sessions. Message frequency is limited to up to
                    4 texts per day during events. Msg & data rates may apply. Reply STOP at any moment to instantly
                    discontinue.
                  </p>
                  <h4 className="pt-2 font-bold uppercase tracking-wide text-zinc-200 text-[13px]">
                    3. Third-Party Sharing
                  </h4>
                  <p>
                    We guarantee zero sales or transfers of your contact data to unrelated marketing agencies. All
                    data is stored securely using validated end-to-end cloud database encryption.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-zinc-200">Last updated: June 2026</p>
                  <p>
                    Welcome to the AI Founder Hub registration process. By securing your seat, you agree to comply
                    with the general terms:
                  </p>
                  <h4 className="pt-2 font-bold uppercase tracking-wide text-zinc-200 text-[13px]">
                    1. Educational Disclaimer
                  </h4>
                  <p>
                    The training delivers live AI software demonstrations utilizing modern generative APIs, prompting
                    techniques, and frontend frameworks. Individual success depends on your implementation, active
                    participation, and project variables.
                  </p>
                  <h4 className="pt-2 font-bold uppercase tracking-wide text-zinc-200 text-[13px]">
                    2. Intellectual Property
                  </h4>
                  <p>
                    Slides, code files, and workbook content shared throughout the platform are owned by AI Founder
                    Hub. Standard usage grants a private, single-user license to implement the curriculum; copying or
                    reselling these resources is forbidden.
                  </p>
                  <h4 className="pt-2 font-bold uppercase tracking-wide text-zinc-200 text-[13px]">
                    3. Free Access Guidelines
                  </h4>
                  <p>
                    Your virtual pass provides live broadcast streaming links during scheduled event hours. Resource
                    access is maintained temporarily at the discretion of Hub administrators unless a premium VIP
                    recordings pass is acquired.
                  </p>
                </>
              )}
            </div>

            {/* footer */}
            <div className="flex justify-end border-t border-edge bg-white/[0.02] p-4">
              <button
                onClick={onClose}
                className="rounded-xl bg-volt px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-void transition-all hover:shadow-[0_0_24px_rgba(204,242,68,0.35)] active:scale-95 cursor-pointer"
              >
                I understand & accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
