import React, { useEffect } from "react";
import { ArrowRight, Newspaper, Wrench, Github, PlayCircle } from "lucide-react";
import { Wordmark } from "../components/shared";

const LIME = "#C6FF00";

const ARTICLES = [
  {
    title: "SaaS is dead? What that actually means for your business",
    desc: "Building basic software has become cheap and fast. We explain, in plain English, why charging per seat for a simple tool is getting harder — and where the money is moving instead.",
    href: "/blog/saas-is-dead-what-it-means-for-your-business",
    date: "4 November 2026",
    tag: "Latest AI news",
    status: "live",
  },
];

const COMING_SOON = [
  {
    icon: Wrench,
    title: "Top tools",
    desc: "The AI tools that actually matter this week — free vs paid, what changed, and what to try first.",
  },
  {
    icon: Github,
    title: "Top GitHub repos",
    desc: "The open-source projects builders are using right now — what each one does, and who it is for.",
  },
  {
    icon: PlayCircle,
    title: "Creator breakdowns",
    desc: "What the best AI builders on YouTube are teaching, recreated in our own words — with the source linked.",
  },
];

export function BlogHubPage() {
  useEffect(() => {
    const blog = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "AI Founder Hub Blog — AI, explained simply",
      url: "https://aifounderhub.com/blog",
      description:
        "Daily AI news in plain English for founders and normal people: latest AI updates, top tools, top GitHub repos, and creator breakdowns, written by Zain Ul Abideen.",
      author: {
        "@type": "Person",
        name: "Zain Ul Abideen Baloch",
        url: "https://aifounderhub.com/zain-ul-abideen-baloch",
      },
      publisher: {
        "@type": "Organization",
        name: "AI Founder Hub",
        url: "https://aifounderhub.com",
      },
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(blog);
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] font-sans text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Wordmark />
        <a href="/" className="text-sm text-zinc-400 hover:text-white">
          Back to AI Founder Hub
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="py-12 md:py-16">
          <p
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide"
            style={{ borderColor: LIME, color: LIME }}
          >
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: LIME }} />
            <Newspaper className="h-3 w-3" /> AI FOUNDER HUB BLOG
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            AI, <span style={{ color: LIME }}>explained simply.</span>
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400">
            This is AI Founder Hub&apos;s daily AI news, written for founders and normal people — not
            just engineers. We follow what is happening in the AI world every day, check the sources,
            and rewrite it in easy words: what happened, why it matters to you, and what you can try
            today. No jargon, no hype, no copied scripts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/freemasterclass"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black"
              style={{ backgroundColor: LIME }}
            >
              Join a free masterclass <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/ai-community-dubai"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Join the Dubai community
            </a>
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            LATEST ARTICLES
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Start here</h2>
          <div className="mt-6 grid gap-4">
            {ARTICLES.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-6 hover:border-zinc-600"
              >
                <p className="text-xs tracking-widest" style={{ color: LIME }}>
                  {a.tag.toUpperCase()} · {a.date}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-white">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{a.desc}</p>
                <span
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: LIME }}
                >
                  Read the article <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            WHAT IS COMING NEXT
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Four pillars, one blog</h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-zinc-400">
            We rotate through four kinds of article, so you always know what is new, what is useful,
            and what is worth your time.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {COMING_SOON.map((c) => (
              <div key={c.title} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-6">
                <c.icon className="h-6 w-6" style={{ color: LIME }} />
                <h3 className="mt-4 text-xl font-bold text-white">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{c.desc}</p>
                <p className="mt-4 text-xs font-semibold tracking-widest text-zinc-500">
                  COMING SOON
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-[#1A1A1D] p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold text-white">Want to learn it live, not just read it?</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Every week we build real AI systems live on screen in our free masterclass — the same
            systems we write about here. Join free, and join the community at the same time.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/freemasterclass"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black"
              style={{ backgroundColor: LIME }}
            >
              Join a free masterclass <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/ai-community-dubai"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400"
            >
              About the community
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
