import React from "react";
import { Wordmark } from "./shared";
import { Mail, Instagram } from "lucide-react";

export function Footer({ onOpenModal }: { onOpenModal: (m: "privacy" | "terms") => void }) {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-edge bg-[#050508] px-5 pb-10 pt-16 text-zinc-400">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center space-y-10">
        <div className="flex flex-col items-center gap-3">
          <Wordmark />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-volt/80">
            The place where founders build with AI
          </span>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 border-y border-white/5 py-6 w-full max-w-2xl text-[13px] font-mono font-medium text-zinc-400">
          <a
            href="https://wa.me/971542968754"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-volt transition-colors whitespace-nowrap"
          >
            <svg
              className="h-4 w-4 text-volt fill-current flex-shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.031 2a9.965 9.965 0 0 0-9.969 9.97c.002 1.905.5 3.702 1.443 5.277L2 22l4.905-1.288a9.96 9.96 0 0 0 5.122 1.408h.004a9.967 9.967 0 0 0 9.969-9.97A9.967 9.967 0 0 0 12.031 2zm0 18.286c-1.619 0-3.202-.433-4.58-1.252l-.328-.195-2.922.766.78-2.848-.214-.341a8.286 8.286 0 0 1-1.27-4.482 8.287 8.287 0 0 1 8.288-8.288 8.287 8.287 0 0 1 8.288 8.288 8.286 8.286 0 0 1-8.288 8.288zm4.542-6.196c-.249-.125-1.472-.727-1.7-.81-.228-.083-.393-.125-.558.125-.165.25-.639.81-.784.975-.145.166-.29.187-.539.062a7.11 7.11 0 0 1-2.001-1.233c-.78-.696-1.307-1.555-1.461-1.804-.153-.25-.016-.385.109-.509.112-.112.249-.291.373-.437.124-.145.166-.25.249-.415.083-.166.042-.311-.02-.436-.063-.125-.558-1.349-.764-1.849-.2-.482-.403-.415-.558-.423-.145-.008-.31-.008-.476-.008a.916.916 0 0 0-.663.311c-.228.25-.87.851-.87 2.076 0 1.225.891 2.41 1.015 2.576.125.166 1.753 2.678 4.247 3.753.593.256 1.056.408 1.417.523.596.19 1.138.163 1.567.099.478-.073 1.472-.602 1.679-1.183.207-.58.207-1.079.145-1.183-.063-.104-.228-.166-.477-.291z" />
            </svg>
            <span className="flex-shrink-0">+971 54 296 8754</span>
          </a>
          <span className="hidden sm:inline text-zinc-800">·</span>
          <a
            href="mailto:contact@devmatesolutions.com"
            className="flex items-center gap-2 hover:text-volt transition-colors"
          >
            <Mail className="h-4 w-4 text-volt" />
            <span>contact@devmatesolutions.com</span>
          </a>
          <span className="hidden sm:inline text-zinc-800">·</span>
          <a
            href="https://www.instagram.com/aifounderhub.me?igsh=eDFpOWl6OWpydjZx&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-volt transition-colors"
          >
            <Instagram className="h-4 w-4 text-volt" />
            <span>@aifounderhub.me</span>
          </a>
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

        {/* <div className="max-w-4xl border-t border-white/5 pt-8 text-center text-[10px] font-medium uppercase leading-relaxed tracking-wider text-zinc-600">
          Disclaimer: This is a free educational event. Results mentioned are not typical and your results may vary.
          Building a successful app requires effort, dedication, and the application of the strategies taught. This
          training shows what's possible with AI-powered app development; success depends on individual implementation
          and market conditions.
        </div> */}

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-zinc-500">© 2026 AI Founder Hub. All rights reserved.</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            Powered by{" "}
            <a
              href="https://devmatesolutions.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-400 hover:text-volt transition-colors"
            >
              Devmate Solutions
            </a>
          </p>
        </div>
      </div>

      {/* giant ghost wordmark at the very bottom */}
      <div className="pointer-events-none relative z-0 mt-12 select-none text-center font-display text-[12.5vw] font-extrabold uppercase leading-[0.8] tracking-tight text-white/[0.03] whitespace-nowrap">
        AI FOUNDER HUB
      </div>
    </footer>
  );
}
