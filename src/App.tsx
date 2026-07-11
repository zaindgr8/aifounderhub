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
import { PaymentModal } from "./components/PaymentModal";
import { BackToTop, CircuitDivider } from "./components/shared";
import { PaymentSuccess } from "./pages/PaymentSuccess";

// Simple path-based routing — no router lib needed
function useRoute() {
  const path = window.location.pathname;
  if (path === "/payment-success") return "payment-success";
  if (path === "/payment-failed") return "payment-failed";
  return "home";
}

export default function App() {
  const route = useRoute();
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Dedicated pages
  if (route === "payment-success" || route === "payment-failed") {
    return <PaymentSuccess />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-void font-sans text-zinc-100">
      {/* fixed film-grain texture over everything */}
      <div className="grain" aria-hidden="true" />

      <Nav />

      <main>
        <Hero onOpenModal={setActiveModal} />
        <ToolsMarquee />
        <TerminalShowcase />
        {/* <StatsBand /> */}
        <CircuitDivider />
        <Workshops />
        <Membership onPay={() => setPaymentOpen(true)} />
        {/* <Agenda /> */}
        {/* <Pathways /> */}
        <CircuitDivider flip />
        <Mentors />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>

      <Footer onOpenModal={setActiveModal} />

      <BackToTop />
      <PolicyModal active={activeModal} onClose={() => setActiveModal(null)} />
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
