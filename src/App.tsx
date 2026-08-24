import React, { useState, useEffect } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { ToolsMarquee, TerminalShowcase, StatsBand } from "./components/TerminalShowcase";
import { Workshops } from "./components/Workshops";
import { Membership } from "./components/Membership";
import { Pathways } from "./components/Pathways";
import { Mentors } from "./components/Mentors";
import { Team } from "./components/Team";
import { Agenda } from "./components/Agenda";
import { Testimonials } from "./components/Testimonials";
import { Faq } from "./components/Faq";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { PolicyModal, ModalKind } from "./components/PolicyModal";
import { PaymentModal } from "./components/PaymentModal";
import { ClaudeMasterclassPopupModal } from "./components/ClaudeMasterclassPopupModal";
import { BackToTop, CircuitDivider } from "./components/shared";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { ProgressPage } from "./pages/ProgressPage";

// Simple path-based routing — no router lib needed
function useRoute() {
  const path = window.location.pathname;
  if (path === "/payment-success") return "payment-success";
  if (path === "/payment-failed") return "payment-failed";
  if (path === "/progress" || path === "/progress/") return "progress";
  return "home";
}

export default function App() {
  const route = useRoute();
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [claudePopupOpen, setClaudePopupOpen] = useState(false);

  // Trigger Claude masterclass popup after 4 seconds on the site
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("claude_popup_dismissed");
      if (!dismissed) {
        setClaudePopupOpen(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Dedicated pages
  if (route === "payment-success" || route === "payment-failed") {
    return <PaymentSuccess />;
  }

  if (route === "progress") {
    return <ProgressPage />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-void font-sans text-zinc-100">
      {/* fixed film-grain texture over everything */}
      <div className="grain" aria-hidden="true" />

      <Nav onOpenClaudeModal={() => setClaudePopupOpen(true)} />

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
        <Team />
        <CircuitDivider />
        <Mentors />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>

      <Footer onOpenModal={setActiveModal} />

      <BackToTop />
      <PolicyModal active={activeModal} onClose={() => setActiveModal(null)} />
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <ClaudeMasterclassPopupModal
        open={claudePopupOpen}
        onClose={() => {
          setClaudePopupOpen(false);
          try {
            sessionStorage.setItem("claude_popup_dismissed", "true");
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
}

