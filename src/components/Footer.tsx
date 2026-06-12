import React from "react";
import { Wordmark } from "./shared";

export function Footer({ onOpenModal }: { onOpenModal: (m: "privacy" | "terms") => void }) {
  return (
    <footer className="relative overflow-hidden border-t border-edge bg-[#050508] px-5 pb-10 pt-16 text-zinc-400">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center space-y-10">
        <div className="flex flex-col items-center gap-3">
          <Wordmark />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-volt/80">
            The place where founders build with AI
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] font-bold">
          <button
            type="button"
            onClick={() => onOpenModal("privacy")}
            className="transition-colors hover:text-volt cursor-pointer"
          >
            Privacy Policy
          </button>
          <span className="text-zinc-700">·</span>
          <button
            type="button"
            onClick={() => onOpenModal("terms")}
            className="transition-colors hover:text-volt cursor-pointer"
          >
            Terms of Service
          </button>
          <span className="text-zinc-700">·</span>
          <a href="mailto:support@aifounderhub.com" className="transition-colors hover:text-volt">
            Contact
          </a>
        </div>

        <div className="max-w-4xl border-t border-white/5 pt-8 text-center text-[10px] font-medium uppercase leading-relaxed tracking-wider text-zinc-600">
          Disclaimer: This is a free educational event. Results mentioned are not typical and your results may vary.
          Building a successful app requires effort, dedication, and the application of the strategies taught. This
          training shows what's possible with AI-powered app development; success depends on individual implementation
          and market conditions.
        </div>

        <p className="text-xs font-semibold text-zinc-500">© 2026 AI Founder Hub. All rights reserved.</p>
      </div>

      {/* giant ghost wordmark at the very bottom */}
      <div className="pointer-events-none relative z-0 mt-12 select-none text-center font-display text-[12.5vw] font-extrabold uppercase leading-[0.8] tracking-tight text-white/[0.03] whitespace-nowrap">
        AI FOUNDER HUB
      </div>
    </footer>
  );
}
