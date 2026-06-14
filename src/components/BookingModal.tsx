import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CalendarClock, ArrowRight, Loader2, AlertCircle, Lock } from "lucide-react";
import { getAvailability, createPayment, backendEnabled, type Slot } from "../lib/api";

export type BookingMentor = "ahmed" | "zain";

const NAMES: Record<BookingMentor, string> = {
  ahmed: "Ahmed Al Kindi",
  zain: "Zain Ul Abaideen",
};

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "Asia/Dubai", weekday: "short", month: "short", day: "numeric",
  });
}
function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "Asia/Dubai", hour: "numeric", minute: "2-digit",
  });
}

export function BookingModal({
  mentor,
  onClose,
}: {
  mentor: BookingMentor | null;
  onClose: () => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!mentor) return;
    // reset on open
    setSlots([]); setSelected(null); setLoadError(null); setFormError(null);
    setName(""); setEmail(""); setPhone(""); setTopic("");

    if (!backendEnabled) {
      setLoadError("demo");
      return;
    }
    setLoading(true);
    getAvailability(mentor, 14)
      .then((res) => {
        setSlots(res.slots);
        const major = (res.mentor.priceFils / 100).toLocaleString("en-US", { maximumFractionDigits: 2 });
        setPrice(`${res.mentor.currency} ${major}`);
      })
      .catch(() => setLoadError("Could not load availability. Please try again."))
      .finally(() => setLoading(false));
  }, [mentor]);

  const handlePay = async () => {
    if (!mentor || !selected) return;
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Please enter your name and a valid email.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await createPayment({
        purpose: "booking",
        customer: { name: name.trim(), email: email.trim(), phone: phone || undefined },
        mentorSlug: mentor,
        startsAt: selected,
        topic: topic || undefined,
      });
      window.location.href = res.redirectUrl; // off to Ziina
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not start checkout. Please try again.");
      setSubmitting(false);
    }
  };

  // group slots by day for a cleaner picker
  const byDay: Record<string, Slot[]> = {};
  for (const s of slots) {
    const k = dayLabel(s.start);
    (byDay[k] ||= []).push(s);
  }

  return (
    <AnimatePresence>
      {mentor && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-edge bg-panel shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-edge bg-white/[0.02] p-5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-volt/10 p-1.5 text-volt">
                  <CalendarClock className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
                  Book a 1:1 with {NAMES[mentor]}
                </h3>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6">
              {loadError === "demo" ? (
                <div className="flex items-start gap-3 rounded-xl border border-edge bg-white/[0.03] p-4 text-sm text-zinc-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-volt" />
                  <span>
                    Booking goes live once the backend is connected. The full flow (pick a slot, pay {price || "$299"} via
                    Ziina, get a calendar invite) is built and ready. For now, email{" "}
                    <a href="mailto:hello@aifounderhub.com" className="font-bold text-volt underline">hello@aifounderhub.com</a> to book.
                  </span>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-zinc-400">
                  <Loader2 className="h-5 w-5 animate-spin text-volt" /> Loading availability...
                </div>
              ) : loadError ? (
                <div className="flex items-center gap-2 py-8 text-rose-400"><AlertCircle className="h-5 w-5" /> {loadError}</div>
              ) : slots.length === 0 ? (
                <div className="py-10 text-center text-sm text-zinc-400">No open slots in the next two weeks. Check back soon.</div>
              ) : (
                <>
                  {price && (
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-volt/25 bg-volt/[0.06] px-4 py-2.5">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-300">60-min private session</span>
                      <span className="font-display text-lg font-extrabold text-volt">{price}</span>
                    </div>
                  )}
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pick a time (Dubai / GST)</p>
                  <div className="space-y-4">
                    {Object.entries(byDay).map(([day, daySlots]) => (
                      <div key={day}>
                        <div className="mb-1.5 text-xs font-bold text-zinc-400">{day}</div>
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map((s) => (
                            <button
                              key={s.start}
                              onClick={() => setSelected(s.start)}
                              className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                                selected === s.start
                                  ? "border-volt bg-volt text-void"
                                  : "border-edge bg-white/[0.03] text-zinc-300 hover:border-volt/40"
                              }`}
                            >
                              {timeLabel(s.start)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selected && (
                    <div className="mt-6 space-y-3 border-t border-edge pt-5">
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                        className="w-full rounded-xl border border-edge bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white placeholder-zinc-500 outline-none focus:border-volt/60" />
                      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email for the calendar invite"
                        className="w-full rounded-xl border border-edge bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white placeholder-zinc-500 outline-none focus:border-volt/60" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)"
                        className="w-full rounded-xl border border-edge bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white placeholder-zinc-500 outline-none focus:border-volt/60" />
                      <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to cover? (optional)" rows={2}
                        className="w-full resize-none rounded-xl border border-edge bg-white/[0.04] px-4 py-3 text-sm font-medium text-white placeholder-zinc-500 outline-none focus:border-volt/60" />

                      {formError && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-rose-400"><AlertCircle className="h-3.5 w-3.5" /> {formError}</p>
                      )}

                      <button onClick={handlePay} disabled={submitting}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-volt py-4 font-display text-sm font-extrabold uppercase tracking-wide text-void transition-all hover:shadow-[0_0_30px_rgba(204,242,68,0.4)] active:scale-[0.98] disabled:opacity-60 cursor-pointer">
                        {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Opening secure checkout...</>) : (<>Pay {price} & confirm <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
                      </button>
                      <p className="flex items-center justify-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-500">
                        <Lock className="h-3 w-3" /> Secure payment via Ziina
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
