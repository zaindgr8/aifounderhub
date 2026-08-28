/**
 * AuthModal — Premium authentication modal for AI Founder Hub
 *
 * Supports:
 * - Email + password login
 * - Email + password sign-up
 * - Google OAuth
 * - "Forgot password?" magic link
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, sendMagicLink } from "../lib/auth";

type AuthTab = "login" | "signup" | "magic";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when auth succeeds — caller decides what to do next */
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
    setLoading(false);
    setGoogleLoading(false);
    setShowPass(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setGoogleLoading(false);
    }
    // If no error, browser will redirect to Google OAuth — no need to stop loading
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (tab === "magic") {
      setLoading(true);
      const { error: err } = await sendMagicLink(email);
      setLoading(false);
      if (err) setError(err);
      else setSuccess("Magic link sent! Check your email to log in.");
      return;
    }

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    if (tab === "login") {
      const { user, error: err } = await signInWithEmail(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else if (user) {
        onSuccess?.();
        handleClose();
      }
    } else {
      const { user, error: err } = await signUpWithEmail(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else if (user) {
        // Supabase may require email confirmation
        if (!user.confirmed_at && !user.email_confirmed_at) {
          setSuccess("Account created! Check your email to confirm, then log in.");
          setTab("login");
        } else {
          onSuccess?.();
          handleClose();
        }
      }
    }
  };

  const tabLabels: { key: AuthTab; label: string; Icon: React.ElementType }[] = [
    { key: "login", label: "Login", Icon: LogIn },
    { key: "signup", label: "Sign Up", Icon: UserPlus },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md rounded-3xl border border-volt/25 bg-[#0d0d18] shadow-[0_0_80px_rgba(204,242,68,0.12)] overflow-hidden">
              {/* Glow blobs */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-volt/10 blur-[70px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-500/8 blur-[60px]" />

              {/* Header */}
              <div className="relative border-b border-white/8 px-7 pt-7 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-volt/30 bg-volt/10 text-volt">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-volt">
                        Member Authentication
                      </p>
                      <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
                        {tab === "magic" ? "Password-Free Login" : tab === "login" ? "Unlock Your Roadmap" : "Create Your Account"}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:border-white/20 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tabs */}
                {tab !== "magic" && (
                  <div className="mt-5 flex items-center gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/8">
                    {tabLabels.map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        onClick={() => { setTab(key); setError(null); setSuccess(null); }}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          tab === key
                            ? "bg-volt text-void shadow-[0_0_20px_rgba(204,242,68,0.3)]"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="relative px-7 py-6 space-y-4">
                {/* Error / success messages */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google OAuth button */}
                {tab !== "magic" && (
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={googleLoading || loading}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] py-3 font-mono text-sm font-semibold text-zinc-300 transition hover:border-white/25 hover:bg-white/8 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3c-2.019-1.823-4.703-2.937-7.91-2.937a12 12 0 0 0-10.73 6.638l4.096 3.064Z"/>
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c3.059 0 5.842-1.154 7.961-3.039l-3.921-2.948Z"/>
                        <path fill="#FBBC05" d="M19.961 20.961C22.056 19.012 23.4 16.097 23.4 12c0-.868-.1-1.72-.28-2.544H12v4.98h6.42c-.308 1.645-1.222 3.012-2.58 3.944l4.12 3.581Z"/>
                        <path fill="#4285F4" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.368-2.235L1.181 6.701A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>
                )}

                {/* Divider */}
                {tab !== "magic" && (
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/8" />
                    <span className="font-mono text-[10px] text-zinc-600">OR</span>
                    <div className="h-px flex-1 bg-white/8" />
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/50 focus:bg-white/6"
                      />
                    </div>
                  </div>

                  {/* Password (not shown for magic link) */}
                  {tab !== "magic" && (
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setError(null); }}
                          placeholder={tab === "signup" ? "Create a strong password" : "Your password"}
                          required
                          minLength={tab === "signup" ? 8 : undefined}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-4 pr-11 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-volt/50 focus:bg-white/6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition cursor-pointer"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {tab === "signup" && (
                        <p className="mt-1.5 font-mono text-[10px] text-zinc-600">Minimum 8 characters</p>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-volt py-3.5 font-display text-xs font-extrabold uppercase tracking-wider text-void shadow-[0_0_25px_rgba(204,242,68,0.3)] transition hover:shadow-[0_0_40px_rgba(204,242,68,0.5)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {tab === "login" && "Login & Unlock Stages"}
                    {tab === "signup" && "Create Account →"}
                    {tab === "magic" && "Send Magic Link →"}
                  </button>
                </form>

                {/* Footer links */}
                <div className="flex items-center justify-between pt-1">
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => { setTab("magic"); setError(null); setSuccess(null); }}
                      className="font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition cursor-pointer underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  )}
                  {tab === "magic" && (
                    <button
                      type="button"
                      onClick={() => { setTab("login"); setError(null); setSuccess(null); }}
                      className="font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                    >
                      ← Back to login
                    </button>
                  )}
                  {tab === "signup" && <div />}
                  <p className="font-mono text-[10px] text-zinc-600 ml-auto">
                    Not a member?{" "}
                    <a href="/#membership" className="text-volt underline underline-offset-2" onClick={handleClose}>
                      Join AAA
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
