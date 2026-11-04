import React from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./shared";

// One row linking to the blog. It stays static so the homepage bundle doesn't load
// the Markdown parser and every post.
export function BlogTeaser() {
  return (
    <section aria-label="Blog" className="relative border-t border-edge">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <Reveal>
          <a href="/blog" className="group flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-volt">Blog</span>
              <h2 className="mt-3 max-w-2xl font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                Practical guides on AI voice agents and starting an AI agency
              </h2>
            </div>
            <span className="inline-flex flex-shrink-0 items-center gap-2 text-sm font-bold text-zinc-300 transition-colors group-hover:text-volt">
              Read the blog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
