import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Users, GraduationCap, Calendar, Globe } from "lucide-react";
import { Wordmark } from "../components/shared";

const LIME = "#C6FF00";

const SAME_AS = [
  "https://www.linkedin.com/in/zainulabideenunicorn/",
  "https://www.instagram.com/zainulabideen.unicorn/",
  "https://www.instagram.com/devmatesolutions/",
  "https://www.instagram.com/aifounderhubofficial/",
  "https://www.youtube.com/channel/UC990B95EKNuVaCVcdo_-9Yg",
  "https://www.youtube.com/@zainulabideen.unicorn",
  "https://devmatesolutions.com",
  "https://aifounderhub.com",
  "https://sixty.devmatesolutions.com",
];

const FAQS = [
  {
    q: "Who is Zain Ul Abideen Baloch?",
    a: "Zain Ul Abideen Baloch is the co-founder of AI Founder Hub, alongside Ahmed Yahya, and the Founder and CEO of DevMate Solutions, a Dubai AI and software agency. He is based in Dubai, and he teaches founders how to build and sell AI lead management systems.",
  },
  {
    q: "What is AI Founder Hub?",
    a: "AI Founder Hub is an AI education platform for entrepreneurs. It runs free weekly live masterclasses, a monthly cohort, and the AAA Accelerator, which helps founders start an AI agency and land a first client in 90 days. It also runs a Dubai founder community and regular in-person meetups.",
  },
  {
    q: "What does the AAA Accelerator cover?",
    a: "The AAA Accelerator helps founders build a working AI Lead Management System, package it as a service, and run real outreach to land a first client. It includes weekly live builds and a private builders community, plus in-person Dubai meetups. Book a strategy call to discuss fit and pricing.",
  },
  {
    q: "Are the masterclasses free?",
    a: "Yes — AI Founder Hub runs free weekly live masterclasses, including sessions on building and selling AI call assistants. Register on the free masterclass page for the next live session.",
  },
  {
    q: "Where is Zain Ul Abideen Baloch based?",
    a: "Dubai, United Arab Emirates. AI Founder Hub is a Dubai community with a global online audience, and DevMate Solutions is headquartered in Business Bay, Dubai, with a presence in Muscat and New York.",
  },
  {
    q: "How can we book a call with Zain Ul Abideen Baloch?",
    a: "Book a meeting at https://cal.com/devmate/meet-zain. For an AI Founder Hub strategy call, book at https://cal.com/devmate/aaa-strategy-call.",
  },
  {
    q: "How much does AI Founder Hub cost?",
    a: "Contact us for pricing, or book a strategy call. Pricing depends on the programme you join, so we confirm it on a call rather than listing a fixed price on this page.",
  },
];

const OFFERS = [
  {
    icon: Calendar,
    title: "Free weekly live masterclasses",
    desc: "Live builds on screen — including how to build and sell AI call assistants — every week, free to join.",
    href: "/freemasterclass",
    linkText: "Register for a free masterclass",
  },
  {
    icon: GraduationCap,
    title: "Monthly cohort",
    desc: "A structured monthly cohort for founders learning to build AI systems, with live sessions and a builders community.",
    href: "/progress",
    linkText: "See the learning roadmap",
  },
  {
    icon: Users,
    title: "AAA Accelerator",
    desc: "A 90-day accelerator to start an AI agency and land a first client: build the system, package the offer, run outreach.",
    href: "/aaa-accelerator",
    linkText: "See the AAA Accelerator",
  },
];

const PROFILES = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/zainulabideenunicorn/", note: "Founder posts on AI tools and founder strategy" },
  { label: "Instagram — personal", href: "https://www.instagram.com/zainulabideen.unicorn/", note: "@zainulabideen.unicorn" },
  { label: "Instagram — AI Founder Hub", href: "https://www.instagram.com/aifounderhubofficial/", note: "@aifounderhubofficial" },
  { label: "Instagram — DevMate", href: "https://www.instagram.com/devmatesolutions/", note: "@devmatesolutions" },
  { label: "YouTube", href: "https://www.youtube.com/@zainulabideen.unicorn", note: "@zainulabideen.unicorn" },
  { label: "DevMate Solutions", href: "https://devmatesolutions.com", note: "devmatesolutions.com" },
  { label: "SIXTY", href: "https://sixty.devmatesolutions.com", note: "sixty.devmatesolutions.com" },
];

export function FounderHubPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Zain Ul Abideen Baloch",
      alternateName: "Zain Ul Abideen",
      jobTitle: "Co-founder, AI Founder Hub",
      description:
        "Co-founder of AI Founder Hub, an AI education platform for entrepreneurs, and Founder and CEO of DevMate Solutions, a Dubai AI and software agency.",
      url: "https://aifounderhub.com/zain-ul-abideen-baloch",
      address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
      worksFor: [
        { "@type": "Organization", name: "AI Founder Hub", url: "https://aifounderhub.com" },
        { "@type": "Organization", name: "DevMate Solutions", url: "https://devmatesolutions.com" },
      ],
      sameAs: SAME_AS,
      knowsAbout: ["AI Lead Management", "AI Call Assistants", "AI Automation", "AI Agency Building"],
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
    const scripts = [person, faq].map((schema) => {
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
        <a href="/" className="text-sm text-zinc-400 hover:text-white">Back to AI Founder Hub</a>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="py-12 md:py-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide" style={{ borderColor: LIME, color: LIME }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: LIME }} />
            Dubai · Co-founder, AI Founder Hub
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Zain Ul Abideen Baloch — <span style={{ color: LIME }}>building AI founders, not just AI tools.</span>
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400">
            Zain Ul Abideen Baloch is the co-founder of AI Founder Hub, alongside Ahmed Yahya, and the Founder and CEO of DevMate Solutions. We teach founders how to build AI lead management systems, package them as a service, and land a first client — using the same systems we sell commercially in Dubai.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://cal.com/devmate/aaa-strategy-call" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black" style={{ backgroundColor: LIME }}>
              Book a strategy call <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/freemasterclass" className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400">
              Join a free masterclass
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { num: "Dubai", label: "Based · global online community" },
              { num: "Weekly", label: "Free live masterclasses" },
              { num: "90 days", label: "AAA Accelerator to a first client" },
              { num: "2019", label: "DevMate operating since" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-4">
                <p className="text-2xl font-bold text-white">{m.num}</p>
                <p className="mt-1 text-sm text-zinc-400">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>CO-FOUNDER STORY</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Learn it by building it, live</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <p className="leading-relaxed text-zinc-400">
              AI Founder Hub was built for founders who want a real skill, not another course of slides. In the weekly live masterclasses, we build an AI system on screen — calls, qualification, booking, and CRM logging — and show exactly how it is packaged and sold.
            </p>
            <p className="leading-relaxed text-zinc-400">
              The same operator experience sits behind DevMate Solutions, our Dubai agency, and SIXTY, our AI lead-response product. That is why the teaching stays practical: every system taught here is one we run for real clients, with real leads, real bookings, and real follow-up.
            </p>
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>WHAT WE OFFER</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Start free. Go deep when you are ready.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {OFFERS.map((o) => (
              <div key={o.title} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-6">
                <o.icon className="h-6 w-6" style={{ color: LIME }} />
                <h3 className="mt-4 text-xl font-bold text-white">{o.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{o.desc}</p>
                <a href={o.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: LIME }}>
                  {o.linkText} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            For pricing, book a strategy call — we confirm programme pricing on a call rather than listing a fixed price on this page. For the agency side, see{" "}
            <a href="https://devmatesolutions.com" className="underline" style={{ color: LIME }}>DevMate Solutions</a> and{" "}
            <a href="https://sixty.devmatesolutions.com" className="underline" style={{ color: LIME }}>SIXTY</a>.
          </p>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>FIND US EVERYWHERE</p>
          <h2 className="mt-2 text-3xl font-bold text-white">The official profiles for Zain Ul Abideen Baloch</h2>
          <p className="mt-2 text-zinc-400">These are the profiles linked from this page. If a profile is not listed here, it is not the official one.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {PROFILES.map((p) => (
              <a key={p.label} href={p.href} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-5 hover:border-zinc-600">
                <p className="flex items-center gap-2 font-bold text-white"><Globe className="h-4 w-4" style={{ color: LIME }} /> {p.label}</p>
                <p className="mt-1 text-sm text-zinc-400">{p.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>COMMON QUESTIONS</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D]">
                <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-white" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} style={{ color: LIME }} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 leading-relaxed text-zinc-400">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-[#1A1A1D] p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold text-white">Book a call with Zain Ul Abideen Baloch</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">For a personal meeting, book at cal.com/devmate/meet-zain. For an AI Founder Hub strategy call, book at cal.com/devmate/aaa-strategy-call.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="https://cal.com/devmate/meet-zain" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-black" style={{ backgroundColor: LIME }}>
              Book a meeting <ArrowRight className="h-4 w-4" />
            </a>
            <a href="https://cal.com/devmate/aaa-strategy-call" className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400">
              Book a strategy call
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
