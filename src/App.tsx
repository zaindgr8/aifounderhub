import React, { useState, useEffect } from "react";
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
import { BookingModal, BookingMentor } from "./components/BookingModal";
import { PaymentReturn } from "./components/PaymentReturn";
import { BackToTop, CircuitDivider } from "./components/shared";

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [bookingMentor, setBookingMentor] = useState<BookingMentor | null>(null);

  // Mentors section dispatches "open-booking" with a mentor slug (avoids prop drilling)
  useEffect(() => {
    const handler = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (slug === "ahmed" || slug === "zain") setBookingMentor(slug);
    };
    window.addEventListener("open-booking", handler);
    return () => window.removeEventListener("open-booking", handler);
  }, []);

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
      <BookingModal mentor={bookingMentor} onClose={() => setBookingMentor(null)} />
      <PaymentReturn />
    </div>
  );
}
