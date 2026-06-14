import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { verifyPayment, backendEnabled } from "../lib/api";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; status: string; amount: string; purpose: string; name?: string }
  | { kind: "cancel" }
  | { kind: "error" };

const PURPOSE_LABEL: Record<string, string> = {
  booking: "1:1 session",
  bootcamp: "AI Builder Bootcamp",
  membership: "Courses Membership",
};

export function PaymentReturn() {
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pay = params.get("pay");
    const paymentId = params.get("p");
    if (!pay) return;

    // clean the URL so a refresh doesn't re-trigger
    const clean = () => window.history.replaceState({}, "", window.location.pathname + window.location.hash);

    if (pay === "cancel") {
      setState({ kind: "cancel" });
      clean();
      return;
    }
    if (pay === "success" && paymentId && backendEnabled) {
      setState({ kind: "loading" });
      verifyPayment(paymentId)
        .then((r) => setState({ kind: "done", status: r.status, amount: r.amount, purpose: r.purpose, name: r.customerName }))
        .catch(() => setState({ kind: "error" }))
        .finally(clean);
    } else if (pay === "success") {
      // backend not wired in this environment; acknowledge gracefully
      setState({ kind: "done", status: "completed", amount: "", purpose: "booking" });
      clean();
    }
  }, []);

  const close = () => setState({ kind: "idle" });
  if (state.kind === "idle") return null;

  const success = state.kind === "done" && state.status === "completed";
  const failed = state.kind === "done" && state.status !== "completed";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        onClick={close}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm overflow-hidden rounded-3xl border border-edge bg-panel p-8 text-center shadow-2xl"
        >
          <button onClick={close} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>

          {state.kind === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4 text-zinc-300">
              <Loader2 className="h-8 w-8 animate-spin text-volt" />
              <span className="text-sm font-semibold">Confirming your payment...</span>
            </div>
          )}

          {success && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-volt/15 ring-1 ring-volt/40">
                <Check className="h-7 w-7 text-volt" strokeWidth={3} />
              </div>
              <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">You're confirmed!</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {state.purpose === "booking"
                  ? "Your 1:1 session is booked. The calendar invite and details are on the way to your inbox."
                  : `Your ${PURPOSE_LABEL[state.purpose] ?? "purchase"} is confirmed. Check your inbox for next steps.`}
                {state.amount ? <><br /><span className="mt-1 inline-block font-mono text-xs text-volt">Paid {state.amount}</span></> : null}
              </p>
              <button onClick={close} className="mt-6 w-full rounded-xl bg-volt py-3 font-display text-sm font-extrabold uppercase tracking-wide text-void cursor-pointer">Done</button>
            </>
          )}

          {(failed || state.kind === "error") && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-500/40">
                <AlertCircle className="h-7 w-7 text-rose-400" />
              </div>
              <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">Payment not completed</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">We couldn't confirm this payment. If you were charged, email hello@aifounderhub.com and we'll sort it immediately.</p>
              <button onClick={close} className="mt-6 w-full rounded-xl border border-edge bg-white/[0.04] py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white cursor-pointer">Close</button>
            </>
          )}

          {state.kind === "cancel" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 ring-1 ring-edge">
                <X className="h-7 w-7 text-zinc-400" />
              </div>
              <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">Checkout cancelled</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">No payment was taken. You can pick a time again whenever you're ready.</p>
              <button onClick={close} className="mt-6 w-full rounded-xl border border-edge bg-white/[0.04] py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white cursor-pointer">Close</button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
