import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Calendar, User } from "lucide-react";
import { Wordmark } from "../components/shared";

const LIME = "#C6FF00";

const FAQS = [
  {
    q: "Does this mean nobody should build software anymore?",
    a: "No. It means the easy part — building a basic tool — is no longer the hard part. The hard part, and the part people pay for, is solving a real problem for a real customer, and doing the work around the tool: setup, support, and results.",
  },
  {
    q: "What is an AI agent, in simple words?",
    a: "An AI agent is software that does a job for you, not just answers a question. You give it a goal — for example, answer new leads and book them in — and it follows the steps to get that done, using your tools.",
  },
  {
    q: "I am not technical. Can I still use this shift?",
    a: "Yes. You do not need to build the tool yourself. You can use ready-made AI tools, or learn to set up AI systems for businesses in our free masterclass, where we build live on screen.",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Pick one painful, repeated job",
    desc: "Look at your own work or a client's work: answering the same questions, chasing leads, booking appointments, writing the same follow-ups. If it repeats every week, it is a candidate.",
  },
  {
    num: "2",
    title: "Try the free version first",
    desc: "Before you pay for anything, try the free tier of an AI tool that handles that one job. Judge it on one thing only: does it save you real time this week?",
  },
  {
    num: "3",
    title: "Sell the outcome, not the tool",
    desc: "If you offer this to a client, do not sell them a subscription. Sell them the result: leads answered in minutes, appointments booked, hours saved. That is what survives when tools get cheap.",
  },
];

export function SaasIsDeadArticle() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "SaaS is dead? What that actually means for your business",
      description:
        "AI has made building basic software cheap and fast, so charging per seat for a simple tool is getting harder. The money is moving to free tools with paid upsells to AI agents and human services.",
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
      datePublished: "2026-11-04",
      mainEntityOfPage: "https://aifounderhub.com/blog/saas-is-dead-what-it-means-for-your-business",
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
    const scripts = [article, faq].map((schema) => {
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
    <div className="min-h-screen w-full bg-[#0A0A0B] font-sans text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Wordmark />
        <a href="/blog" className="text-sm text-zinc-400 hover:text-white">
          Back to the blog
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <section className="py-12 md:py-16">
          <p
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide"
            style={{ borderColor: LIME, color: LIME }}
          >
            LATEST AI NEWS
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            SaaS is dead? What that actually means{" "}
            <span style={{ color: LIME }}>for your business.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-300">
            In plain English: building a basic piece of software used to be expensive and slow. Now
            AI can build it fast and cheap. So charging people a monthly fee just to use a simple
            tool is getting harder every month.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4" style={{ color: LIME }} /> By Zain Ul Abideen Baloch
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" style={{ color: LIME }} /> 4 November 2026
            </span>
          </div>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            WHAT HAPPENED
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">The idea, in one minute</h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            For years, the normal software business looked like this: a company builds a tool, then
            charges every user a monthly fee to use it. That model worked because building the tool
            was hard. Only a team of developers could do it, and it took months.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-400">
            AI changed the cost side of that equation. A single person with AI help can now build a
            working version of a simple tool in days, not months. When anyone can build the tool,
            the tool itself stops being the rare thing.
          </p>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            WHAT CHANGED
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">From selling tools to selling results</h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            The money is moving in a clear direction. The tool itself becomes free, or very cheap, so
            lots of people start using it. The business then earns from what sits on top of the free
            tool: an AI agent that does the work for you, or a human service that sets it up, runs
            it, and takes responsibility for the result.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Think of it this way. Nobody wants to pay a monthly fee for a hammer. People pay for the
            house being built. The tool is the hammer. The agent, and the service around it, is the
            house being built.
          </p>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            WHY IT MATTERS TO A NORMAL PERSON
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Three things change for you</h2>
          <div className="mt-5 space-y-4">
            <p className="leading-relaxed text-zinc-400">
              <strong className="text-white">1. You will pay less for basic tools.</strong> More
              free and cheap options will appear for everyday jobs, because building them is no
              longer expensive.
            </p>
            <p className="leading-relaxed text-zinc-400">
              <strong className="text-white">2. Knowing how to use AI matters more than knowing how to code.</strong>{" "}
              The valuable skill is telling AI clearly what you want, checking its work, and putting
              it into a real business process.
            </p>
            <p className="leading-relaxed text-zinc-400">
              <strong className="text-white">3. The winners sell outcomes.</strong> A business that
              promises &quot;leads answered and appointments booked&quot; is in a stronger position
              than a business that promises &quot;access to our software.&quot;
            </p>
          </div>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            WHAT TO TRY TODAY
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Three simple steps</h2>
          <div className="mt-6 grid gap-4">
            {STEPS.map((s) => (
              <div key={s.num} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-6">
                <p className="text-2xl font-bold" style={{ color: LIME }}>
                  Step {s.num}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            THE DUBAI AND GCC ANGLE
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">What this means for founders here</h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            For Dubai founders, agencies, and freelancers, this shift is good news if you read it
            right. Dubai businesses — real estate teams, clinics, restaurants, service companies —
            do not want another subscription to learn. They want leads answered, bookings made, and
            follow-ups handled.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-400">
            So instead of building yet another tool and charging a monthly fee for it, build an AI
            system around a real business problem and charge for the result it delivers. That is
            exactly what we teach and build at AI Founder Hub: AI lead management systems and AI call
            assistants, set up for real clients, with real bookings as the measure of success.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-400">
            If you are starting out, do not start by asking &quot;what tool should I build?&quot;
            Start by asking &quot;whose repeated, painful job can I take away this month?&quot;
          </p>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            SOURCES
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Where this idea came from</h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            This article was inspired by Greg Isenberg&apos;s video &quot;SaaS is dead?&quot;,
            published on 29 October 2026. The explanation above is written in our own words — it is
            not a copy of the video or its script. Watch the original for Greg&apos;s full take:
          </p>
          <a
            href="https://www.youtube.com/@GregIsenberg"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: LIME }}
          >
            Greg Isenberg on YouTube <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section className="py-8">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            COMMON QUESTIONS
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D]">
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-white"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    style={{ color: LIME }}
                  />
                </button>
                {openFaq === i && <p className="px-5 pb-5 leading-relaxed text-zinc-400">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-[#1A1A1D] p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold text-white">Learn to build AI systems that sell results</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Join our free weekly live masterclass, where we build AI lead systems and AI call
            assistants live on screen — and show how they are packaged and sold.
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
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Back to the blog
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
