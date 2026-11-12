import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Users, Calendar, MapPin, GraduationCap } from "lucide-react";
import { Wordmark } from "../components/shared";

const MASTERCLASS = "/freemasterclass";
const COURSE = "/how-to-build-your-ai-agency";

const FAQS = [
  {
    q: "What is AI Founder Hub?",
    a: "AI Founder Hub is a Dubai AI community for founders, builders, and enthusiasts. We run free weekly live masterclasses, in-person Dubai meetups, and programmes that teach you to build and sell AI systems. Our tagline is Connect. Build. Scale.",
  },
  {
    q: "How do I join the AI community in Dubai?",
    a: "Start with a free weekly live masterclass — register on the free masterclass page. That is the easiest way in: you learn live, meet other builders, and get invited to community sessions and in-person Dubai meetups.",
  },
  {
    q: "Is the free masterclass really free?",
    a: "Yes — the weekly live masterclass is free to join, with no card required. Paid programmes exist for people who want to go deeper, but they are always your choice.",
  },
  {
    q: "Do I need coding skills to join or learn AI in Dubai with AFH?",
    a: "No. Our sessions start from ground level. You direct the AI in plain language and it writes the code. The curriculum is built for founders and professionals, not only for developers.",
  },
  {
    q: "Are sessions in person or online?",
    a: "Virtual-first, with regular in-person sessions in Dubai — including meetups at venues such as 25hours Hotel Dubai One Central. Online sessions are open to the wider GCC and global audience.",
  },
  {
    q: "Where in Dubai does AI Founder Hub meet?",
    a: "Our in-person meetups take place in Dubai, including at 25hours Hotel Dubai One Central and in the DIFC area. Check the free masterclass page and our community announcements for the next session.",
  },
  {
    q: "What is the difference between the Master Course and the AAA Accelerator?",
    a: "The Master Course — How to Build Your AI Agency: Build and Sell AI Voice Agents — is a one-month programme of five live classes, open now for the first 10 students only at 1,500 AED / $408. The AAA Accelerator is a 90-day programme to start an AI agency and land a first client; applications for the AAA Accelerator are currently locked.",
  },
];

const OFFERS = [
  {
    icon: Calendar,
    title: "Free weekly live masterclasses",
    desc: "Live builds on screen — AI voice agents, chatbots, and automations — every week, free to join.",
    href: "/freemasterclass",
    linkText: "Register for a free masterclass",
  },
  {
    icon: Users,
    title: "Dubai founder community",
    desc: "Founders, builders, and enthusiasts learning together, sharing real builds, and collaborating — in Dubai and online across the GCC.",
    href: "/freemasterclass",
    linkText: "Join through a free masterclass",
  },
  {
    icon: GraduationCap,
    title: "Master Course — first 10 only",
    desc: "How to Build Your AI Agency: Build and Sell AI Voice Agents. Five live classes in one month, taught by Zain Ul Abideen. 1,500 AED / $408 for the first 10 students.",
    href: "/how-to-build-your-ai-agency",
    linkText: "See the Master Course",
  },
];

const KEEP_READING = [
  {
    href: "/blog/how-to-start-an-ai-automation-agency",
    title: "How to Start an AI Automation Agency in 2026 (Step-by-Step)",
    meta: "AI agency guides",
  },
  {
    href: "/blog/ai-voice-agent-cost",
    title: "How Much Does an AI Voice Agent Cost in 2026?",
    meta: "Costs & pricing",
  },
  {
    href: "/blog/vincenzo-picciuolo-founder-story",
    title: "I Had Bills to Pay and a Dream I Could Not Switch Off",
    meta: "AI trends",
  },
];

export function AiCommunityDubaiPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AI Founder Hub",
      url: "https://aifounderhub.com",
      slogan: "Connect. Build. Scale.",
      description:
        "AI Founder Hub is a Dubai AI community for founders, builders, and enthusiasts, offering free weekly live masterclasses, in-person Dubai meetups, and AI agency training.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dubai",
        addressCountry: "AE",
      },
      areaServed: ["Dubai", "United Arab Emirates", "GCC"],
      sameAs: [
        "https://www.instagram.com/aifounderhubofficial/",
        "https://www.linkedin.com/company/ai-founder-hub-uae",
        "https://www.youtube.com/@zainulabideen.unicorn",
      ],
    };
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const scripts = [org, faq].map((schema) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.textContent = JSON.stringify(schema);
      document.head.appendChild(el);
      return el;
    });
    return () => {
      scripts.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-void font-sans text-zinc-100">
      <header className="border-b border-edge/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <a href="/" className="flex items-center" aria-label="AI Founder Hub home">
            <Wordmark />
          </a>
          <nav className="flex items-center gap-5 text-[13.5px] font-medium">
            <a href="/blog" className="text-zinc-300 transition-colors hover:text-white">Blog</a>
            <a href={MASTERCLASS} className="hidden text-zinc-400 transition-colors hover:text-white sm:inline">Free masterclass</a>
            <a href={COURSE} className="rounded-full bg-volt px-4 py-2 text-[13px] font-semibold text-void transition-opacity hover:opacity-90">
              The course
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 md:px-8">
        <header className="mx-auto max-w-3xl pb-10 pt-10 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-[13px] text-zinc-500">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-zinc-300">Dubai community</span>
          </nav>
          <div className="mt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              <span className="text-volt">Dubai · AI community</span>
              <span className="mx-2 text-zinc-700">/</span>
              Free meetups
            </p>
          </div>
          <h1 className="mt-4 font-display text-[36px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[52px]">
            The AI community in Dubai for founders who{" "}
            <span className="text-volt">build, not just watch.</span>
          </h1>
          <p className="mt-5 text-[19px] leading-relaxed text-zinc-400">
            AI Founder Hub is Dubai&apos;s community for AI founders, builders, and enthusiasts.
            Connect. Build. Scale. We learn AI together — live, in plain English, by building real
            systems — and we meet in person in Dubai, not only online.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/freemasterclass"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-volt px-6 py-3 text-[14px] font-semibold text-void transition-opacity hover:opacity-90"
            >
              Join a free masterclass <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-edge px-6 py-3 text-[14px] font-semibold text-zinc-200 transition-colors hover:border-zinc-500"
            >
              Read the AI blog
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-3xl lg:max-w-5xl">
          <aside className="rounded-2xl border border-volt/25 bg-volt/[0.05] p-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-volt">Short answer</p>
            <p className="mt-2.5 text-[16.5px] leading-relaxed text-white">
              Dubai&apos;s AI community for founders, builders, and enthusiasts — free weekly live
              masterclasses, in-person meetups in Dubai, and programmes that teach you to build and
              sell AI systems.
            </p>
          </aside>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { num: "Dubai", label: "Based · in-person meetups" },
              { num: "Weekly", label: "Free live masterclasses" },
              { num: "GCC", label: "Community across the Gulf" },
              { num: "10 only", label: "Master Course first intake" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-edge bg-panel p-4">
                <p className="font-display text-2xl font-bold tracking-tight text-white">{m.num}</p>
                <p className="mt-1 text-sm text-zinc-400">{m.label}</p>
              </div>
            ))}
          </div>

          <section className="pt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt">Learn AI in Dubai</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Start free. Go deep when you are ready.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {OFFERS.map((o) => (
                <div key={o.title} className="rounded-2xl border border-edge bg-panel p-6">
                  <o.icon className="h-6 w-6 text-volt" />
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-white">{o.title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-zinc-400">{o.desc}</p>
                  <a
                    href={o.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-volt"
                  >
                    {o.linkText} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              The AAA Accelerator is a 90-day programme to start an AI agency and land a first client.
              Applications for the AAA Accelerator are currently locked — the open programme right now
              is the Master Course, first 10 students only.
            </p>
          </section>

          <section className="pt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt">In person in Dubai</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Meet the people building with AI
            </h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <p className="text-[17.5px] leading-relaxed text-zinc-400">
                Online learning is useful, but it is not the same as sitting in a room with other
                founders. Our Dubai meetups bring together founders, builders, and enthusiasts to see
                real AI systems, pitch ideas, and find collaborators — with hands-on building, not
                just talks.
              </p>
              <p className="text-[17.5px] leading-relaxed text-zinc-400">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  <MapPin className="h-4 w-4 text-volt" /> Dubai venues
                </span>
                <br />
                In-person sessions take place in Dubai, including at 25hours Hotel Dubai One Central
                and in the DIFC area. The next session is announced through the free masterclass page
                and community channels.
              </p>
            </div>
          </section>

          <section className="pt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt">What members build</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Real systems, not just theory
            </h2>
            <p className="mt-4 max-w-3xl text-[17.5px] leading-relaxed text-zinc-400">
              Members build AI lead management systems and AI call assistants — the same kind of
              systems our Dubai agency runs for real clients. In the weekly masterclass you watch it
              built live: calls, qualification, booking, and follow-up. In the Master Course you build
              your own, with outreach and pitching included, so you can land a first client.
            </p>
            <p className="mt-4 max-w-3xl text-[17.5px] leading-relaxed text-zinc-400">
              Member stories and results are shared on the AI Founder Hub homepage. If you want to see
              what builders in Dubai and across the GCC are doing with these systems, start there —
              and then join a free session to see it live yourself.
            </p>
          </section>

          <section className="pt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-volt">Common questions</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-6 space-y-3">
              {FAQS.map((faq, i) => (
                <div key={faq.q} className="rounded-2xl border border-edge bg-panel">
                  <button
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-white"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-volt transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && <p className="px-5 pb-5 leading-relaxed text-zinc-400">{faq.a}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 rounded-2xl border border-edge bg-panel/60 p-7 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Join Dubai&apos;s AI founder community, <span className="font-serif font-normal italic text-volt">for free.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-zinc-400">
              Start with a free weekly live masterclass. No card, no experience needed — just show up
              and build with us.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={MASTERCLASS} className="inline-flex items-center justify-center gap-2 rounded-full bg-volt px-6 py-3 text-[14px] font-semibold text-void transition-opacity hover:opacity-90">
                Join a free masterclass <ArrowRight className="h-4 w-4" />
              </a>
              <a href={COURSE} className="inline-flex items-center justify-center gap-2 rounded-full border border-edge px-6 py-3 text-[14px] font-semibold text-zinc-200 transition-colors hover:border-zinc-500">
                See the Master Course
              </a>
            </div>
          </section>

          <section className="pb-20 pt-16">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Keep reading</h2>
            <div className="mt-2">
              {KEEP_READING.map((p) => (
                <a key={p.href} href={p.href} className="group block border-b border-edge py-5">
                  <h3 className="font-display text-[20px] font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-volt">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">{p.meta}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-edge/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-[13px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© AI Founder Hub, Dubai</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="/blog" className="hover:text-white">Blog</a>
            <a href={COURSE} className="hover:text-white">AI agency course</a>
            <a href={MASTERCLASS} className="hover:text-white">Free masterclass</a>
            <a href="/ai-community-dubai" className="hover:text-white">Dubai community</a>
            <a href="/rss.xml" className="hover:text-white">RSS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
