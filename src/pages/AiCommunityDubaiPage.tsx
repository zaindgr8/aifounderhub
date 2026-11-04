import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Users, Calendar, MapPin, GraduationCap } from "lucide-react";
import { Wordmark } from "../components/shared";

const LIME = "#C6FF00";

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
            Dubai · AI community
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            The AI community in Dubai for founders who{" "}
            <span style={{ color: LIME }}>build, not just watch.</span>
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400">
            AI Founder Hub is Dubai&apos;s community for AI founders, builders, and enthusiasts.
            Connect. Build. Scale. We learn AI together — live, in plain English, by building real
            systems — and we meet in person in Dubai, not only online.
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
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400"
            >
              Read the AI blog
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { num: "Dubai", label: "Based · in-person meetups" },
              { num: "Weekly", label: "Free live masterclasses" },
              { num: "GCC", label: "Community across the Gulf" },
              { num: "10 only", label: "Master Course first intake" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-4">
                <p className="text-2xl font-bold text-white">{m.num}</p>
                <p className="mt-1 text-sm text-zinc-400">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            LEARN AI IN DUBAI
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Start free. Go deep when you are ready.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {OFFERS.map((o) => (
              <div key={o.title} className="rounded-2xl border border-zinc-800 bg-[#1A1A1D] p-6">
                <o.icon className="h-6 w-6" style={{ color: LIME }} />
                <h3 className="mt-4 text-xl font-bold text-white">{o.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{o.desc}</p>
                <a
                  href={o.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: LIME }}
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

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            IN PERSON IN DUBAI
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Meet the people building with AI</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <p className="leading-relaxed text-zinc-400">
              Online learning is useful, but it is not the same as sitting in a room with other
              founders. Our Dubai meetups bring together founders, builders, and enthusiasts to see
              real AI systems, pitch ideas, and find collaborators — with hands-on building, not
              just talks.
            </p>
            <p className="leading-relaxed text-zinc-400">
              <span className="inline-flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" style={{ color: LIME }} /> Dubai venues
              </span>
              <br />
              In-person sessions take place in Dubai, including at 25hours Hotel Dubai One Central
              and in the DIFC area. The next session is announced through the free masterclass page
              and community channels.
            </p>
          </div>
        </section>

        <section className="py-10">
          <p className="text-xs tracking-widest" style={{ color: LIME }}>
            WHAT MEMBERS BUILD
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">Real systems, not just theory</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">
            Members build AI lead management systems and AI call assistants — the same kind of
            systems our Dubai agency runs for real clients. In the weekly masterclass you watch it
            built live: calls, qualification, booking, and follow-up. In the Master Course you build
            your own, with outreach and pitching included, so you can land a first client.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-zinc-400">
            Member stories and results are shared on the AI Founder Hub homepage. If you want to see
            what builders in Dubai and across the GCC are doing with these systems, start there —
            and then join a free session to see it live yourself.
          </p>
        </section>

        <section className="py-10">
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
          <h2 className="text-3xl font-bold text-white">Join Dubai&apos;s AI founder community</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Start with a free weekly live masterclass. No card, no experience needed — just show up
            and build with us.
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
              href="/how-to-build-your-ai-agency"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white hover:border-zinc-400"
            >
              See the Master Course
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
