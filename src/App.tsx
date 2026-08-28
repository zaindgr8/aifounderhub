import React, { useState, useEffect, Suspense, lazy } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { ToolsMarquee, TerminalShowcase } from "./components/TerminalShowcase";
import { Workshops } from "./components/Workshops";
import { Membership } from "./components/Membership";
import { Mentors } from "./components/Mentors";
import { Team } from "./components/Team";
import { Testimonials } from "./components/Testimonials";
import { Faq } from "./components/Faq";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { ModalKind } from "./components/PolicyModal";
import { BackToTop, CircuitDivider } from "./components/shared";

// Lazy-load dedicated secondary routes and heavy modals so initial home page payload is tiny & instant
const ProgressPage = lazy(() => import("./pages/ProgressPage").then(m => ({ default: m.ProgressPage })));
const FreeMasterclassPage = lazy(() => import("./pages/FreeMasterclassPage").then(m => ({ default: m.FreeMasterclassPage })));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
const PaymentModal = lazy(() => import("./components/PaymentModal").then(m => ({ default: m.PaymentModal })));
const PolicyModal = lazy(() => import("./components/PolicyModal").then(m => ({ default: m.PolicyModal })));
const ClaudeMasterclassPopupModal = lazy(() => import("./components/ClaudeMasterclassPopupModal").then(m => ({ default: m.ClaudeMasterclassPopupModal })));

// Loading fallback spinner
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070c] text-volt font-mono text-xs uppercase tracking-widest">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-volt border-t-transparent" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

// Simple path-based routing — no router lib needed
function useRoute() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  if (path === "/payment-success") return "payment-success";
  if (path === "/payment-failed") return "payment-failed";
  if (path === "/progress") return "progress";
  if (path === "/freemasterclass") return "freemasterclass";
  return "home";
}

export default function App() {
  const route = useRoute();
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [claudePopupOpen, setClaudePopupOpen] = useState(false);

  // Trigger Claude masterclass popup after 4 seconds on the site (only on home page)
  useEffect(() => {
    if (route !== "home") return;
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem("claude_popup_dismissed");
      if (!dismissed) {
        setClaudePopupOpen(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [route]);

  // Dedicated pages
  if (route === "payment-success" || route === "payment-failed") {
    return (
      <Suspense fallback={<PageLoader />}>
        <PaymentSuccess />
      </Suspense>
    );
  }

  if (route === "progress") {
    return (
      <Suspense fallback={<PageLoader />}>
        <ProgressPage />
      </Suspense>
    );
  }

  if (route === "freemasterclass") {
    return (
      <Suspense fallback={<PageLoader />}>
        <FreeMasterclassPage />
      </Suspense>
    );
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
      <Suspense fallback={null}>
        {activeModal && <PolicyModal active={activeModal} onClose={() => setActiveModal(null)} />}
        {paymentOpen && <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />}
        {claudePopupOpen && (
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
        )}
      </Suspense>
    </div>
  );
}

