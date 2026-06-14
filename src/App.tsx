import React, { useState } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { ToolsMarquee, TerminalShowcase, StatsBand } from "./components/TerminalShowcase";
import { Workshops } from "./components/Workshops";
import { Membership } from "./components/Membership";
import { Pathways } from "./components/Pathways";
import { Mentors } from "./components/Mentors";
import { Agenda } from "./components/Agenda";
import { Testimonials } from "./components/Testimonials";
import { Faq } from "./components/Faq";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { PolicyModal, ModalKind } from "./components/PolicyModal";
import { BackToTop, CircuitDivider } from "./components/shared";

// NOTE: Payment (Ziina) and the automated booking flow are intentionally not
// wired into the live site yet. Bookings/payments are handled manually for now;
// the backend scaffolding for them lives in supabase/functions for Zain to
// finish later. The CRM lead capture (Hero form -> capture-lead) is active.
export default function App() {
  const [activeModal, setActiveModal] = useState<ModalKind>(null);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-void font-sans text-zinc-100">
      {/* fixed film-grain texture over everything */}
      <div className="grain" aria-hidden="true" />

      <Nav />

      <main>
        <Hero onOpenModal={setActiveModal} />
        <ToolsMarquee />
        <TerminalShowcase />
        <StatsBand />
        <CircuitDivider />
        <Workshops />
        <Membership />
        <Agenda />
        <Pathways />
        <CircuitDivider flip />
        <Mentors />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>

      <Footer onOpenModal={setActiveModal} />

      <BackToTop />
      <PolicyModal active={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
