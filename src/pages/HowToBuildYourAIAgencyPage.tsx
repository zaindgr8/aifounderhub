import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CalendarHeart,
  CalendarDays,
  CheckCircle2,
  Download,
  Car,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Facebook,
  Handshake,
  Globe,
  GraduationCap,
  Headphones,
  HeartPulse,
  Home,
  Instagram,
  LayoutDashboard,
  Landmark,
  Mail,
  Linkedin,
  Loader2,
  Lock,
  Magnet,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mic,
  Pause,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Play,
  Scale,
  ShieldCheck,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { Reveal, SectionTag, Wordmark, BackToTop, CountUp, LogoMark } from "../components/shared";
import { initiateZiinaPayment } from "../lib/api";

/* ────────────────────────────────────────────────────────
   SOURCES — every number on this page points at one of these
──────────────────────────────────────────────────────── */

const SOURCES = [
  {
    id: 1,
    label: "Grand View Research — AI Voice Agents Market Report (2025 base, 2026–2033 forecast)",
    url: "https://www.grandviewresearch.com/industry-analysis/ai-voice-agents-market-report",
  },
  {
    id: 2,
    label: "Gartner press release (Aug 2022) — conversational AI to cut contact-center agent labor costs by $80B in 2026",
    url: "https://www.cxtoday.com/workforce-engagement-management/gartner-bots-cut-agent-labor-costs-80bn/",
  },
  {
    id: 3,
    label: "U.S. Bureau of Labor Statistics — Occupational Outlook Handbook: Receptionists (May 2025 pay)",
    url: "https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm",
  },
  {
    id: 4,
    label: "Retell AI — AI voice agent pricing breakdown (from $0.07/min)",
    url: "https://www.retellai.com/blog/ai-voice-agent-pricing-full-cost-breakdown-platform-comparison-roi-analysis",
  },
  {
    id: 5,
    label: "Quo analysis of 16.7M missed business calls (via Carly)",
    url: "https://www.usecarly.com/blog/missed-call-statistics/",
  },
  {
    id: 6,
    label: "AWS Startups — share of Y Combinator batches building with voice (W24 → F24)",
    url: "https://aws.amazon.com/startups/learn/ai-has-found-its-voice-and-startups-are-listening",
  },
  {
    id: 7,
    label: "IMARC Group — Saudi Arabia Conversational AI Market (2024 base, 2025–2033 forecast)",
    url: "https://www.imarcgroup.com/saudi-arabia-conversational-ai-market",
  },
  {
    id: 8,
    label: "Vapi raises $50M Series B after passing 1 billion calls",
    url: "https://www.shopifreaks.com/vapi-raises-50m-series-b-for-its-enterprise-voice-ai-platform-after-passing-1-billion-calls/",
  },
] as const;

function Cite({ n }: { n: number }) {
  return (
    <a
      href="#sources"
      className="ml-0.5 align-super font-mono text-[9px] font-bold text-zinc-500 hover:text-volt"
      aria-label={`Source ${n}`}
    >
      [{n}]
    </a>
  );
}

/* ────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────── */

const PRICE = { aed: "1,500 AED", omr: "158 OMR", usd: "$408", was: "8,000 AED", save: "81%" };

const TICKER = [
  "AI voice agents: $2.54B market in 2025 → $35.2B by 2033 [1]",
  "39% yearly growth forecast, 2026–2033 [1]",
  "Gartner: conversational AI cuts contact-center labor costs by $80B in 2026 [2]",
  "U.S. receptionist median pay: $38,010 a year [3]",
  "AI voice agents run from $0.07 a minute [4]",
  "69% of missed business calls get no callback within 48 hours [5]",
  "Voice startups went from 13% to 22% of a Y Combinator batch in one year [6]",
  "Saudi conversational AI: 29.7% yearly growth forecast to 2033 [7]",
];

// Grand View: $2.54B in 2025, 39.0% CAGR 2026–2033 → $35.24B. In-between years are implied by the CAGR.
const GROWTH = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033].map((year, i) => ({
  year,
  value: i === 8 ? 35.24 : 2.54 * Math.pow(1.39, i),
  reported: i === 0 || i === 8,
}));

const VERTICALS = [
  { icon: HeartPulse, name: "Clinics & Dental", pain: "Bookings, reschedules and insurance questions, most of them outside office hours." },
  { icon: Home, name: "Real Estate", pain: "Speed-to-lead wins the deal. A portal lead that waits 10 minutes has already called another agent." },
  { icon: Smile, name: "Aesthetics & Spas", pain: "High-ticket treatments. One missed call can be a 2,000 AED package walking out the door." },
  { icon: Landmark, name: "Banks & Finance", pain: "BFSI is the largest buyer of voice agents today: reminders, verification, tier-1 support.", cite: 1 },
  { icon: Scale, name: "Law Firms", pain: "New-client intake is urgent and valuable. Whoever answers first usually gets the case." },
  { icon: Wrench, name: "Home Services", pain: "Plumbers, AC, roofing: the job goes to whoever picks up while the customer is still worried." },
  { icon: Car, name: "Automotive", pain: "Service bookings, test drives and recall follow-ups at a volume a front desk can't keep up with." },
  { icon: Building2, name: "Hotels & Hospitality", pain: "Reservations and guest questions 24/7, in multiple languages, without night-shift staff." },
];

const SESSIONS = [
  {
    num: "01",
    title: "The Opportunity & Market Selection",
    outcome: "You leave with a market and a reason it will buy.",
    points: [
      "Why phone systems and front desks are being rebuilt around AI right now",
      "The economics a business owner cares about: staff cost vs AI cost, missed-call revenue",
      "Choosing your market (local GCC, USA, worldwide) with structured research",
      "Green flags and red flags for a niche worth building in",
    ],
  },
  {
    num: "02",
    title: "Industry Selection & Global Client Acquisition",
    outcome: "You leave with one industry, one offer and a list of who to contact.",
    points: [
      "Picking the highest-pain, highest-paying vertical inside your market",
      "Validating demand before you build anything",
      "PR and authority: getting inbound enquiries instead of only cold outreach",
      "Email outreach that reaches clients outside your city",
    ],
  },
  {
    num: "03",
    title: "Your Outreach Engine — Guided Setup",
    outcome: "You leave with a working outreach machine, set up live with us.",
    points: [
      "Business domain and email, warmed up for deliverability",
      "Brevo campaigns plus n8n automated follow-ups",
      "A landing page that captures and converts leads",
      "A Next.js dashboard to manage your list and pipeline",
    ],
  },
  {
    num: "04",
    title: "Build Your First AI Voice Agent — Production Level",
    outcome: "You leave with a real agent on a real phone number.",
    points: [
      "The full stack: voice platform, n8n, Google Sheets, CRM and MCP tools",
      "A real phone number, real calls, recordings and transcripts",
      "A client dashboard with its own sign-in",
      "Your demo weapon: a form that triggers an instant AI callback in front of a prospect",
    ],
  },
  {
    num: "05",
    title: "Close Your First Deal & The $10K/Month Roadmap",
    outcome: "You leave with a pitch, a price and a plan for the next 90 days.",
    points: [
      "Booking meetings: from outreach reply to sales call",
      "The pitch: presenting the agent and its ROI in the owner's language",
      "Pricing, objections and closing: scripts you can use the same week",
      "The roadmap from first client to $10K/month (a roadmap, not a guarantee)",
    ],
  },
];

const BUILT = [
  { icon: PhoneCall, label: "A live AI voice agent", sub: "Real number, recordings, transcripts" },
  { icon: Zap, label: "Instant-callback demo", sub: "Prospect fills a form, your AI calls them" },
  { icon: TrendingUp, label: "Outreach engine", sub: "Domain, Brevo, n8n, landing page" },
  { icon: Target, label: "Offer & pitch", sub: "Pricing, scripts, objection handling" },
];

const STACK = ["n8n", "Voice AI platform", "Twilio numbers", "Google Sheets", "CRM", "MCP tools", "Brevo", "Next.js", "Supabase"];

const VALUE_STACK = [
  { item: "5 live master sessions over 1 month", value: "5,000 AED" },
  { item: "All recordings and resources", value: "2,000 AED" },
  { item: "Guided outreach setup (domain, Brevo, n8n, dashboard)", value: "3,000 AED" },
  { item: "Full AI voice agent build kit", value: "3,000 AED" },
  { item: "AFH MasterMind Group — 60 days", value: "2,000 AED" },
  { item: "Direct access to the founders, Zain & Ahmed — 30 days", value: "1,500 AED" },
  { item: "Sales pitch and first-deal closing playbook", value: "2,000 AED" },
  { item: "Instant-callback demo form template", value: "500 AED" },
  { item: "Client portal: call recordings, intent & sentiment scoring", value: "Included" },
  { item: "Advanced n8n automations: voice → CRM and AI email nurture", value: "Included" },
  { item: "Lead generation & client targeting system", value: "Included" },
  { item: "Hands-on help onboarding your first client", value: "Included" },
  { item: "Invitations to private in-person founder events", value: "Included" },
  { item: "AI Founder Hub certificate of completion", value: "Included" },
];

const FAQS = [
  {
    q: "When does the course start?",
    a: "The start date will be confirmed and shared with enrolled students first. There are 10 places, given in the order payments are confirmed.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. The build uses visual and low-code tools (n8n, Google Sheets, a voice AI platform, a CRM). You need to follow technical steps carefully and be comfortable testing real calls. We build alongside you.",
  },
  {
    q: "What will the tools cost me?",
    a: "Third-party costs are yours and billed by the providers: a phone number, voice minutes (voice platforms start around $0.07 a minute), email sending and a domain. We show you how to start lean and pass usage costs on to clients.",
  },
  {
    q: "Is the $2,000 setup + $700/month offer real?",
    a: "It's the example offer structure we teach, set against what a business already pays for front-desk staff. It's an illustration, not a promise of what any client will pay. You set your own prices.",
  },
  {
    q: "Is $10K a month guaranteed?",
    a: "No. $10K/month is a roadmap for a solo agency, not a promise. The course goal is your first client within 90 days, and that depends on the outreach you actually do.",
  },
  {
    q: "Can I sell this in the GCC, or only abroad?",
    a: "Both. The course covers choosing between local (UAE, KSA, Oman, Qatar), USA and worldwide markets. In the GCC the market is earlier, so competition is thinner. In the USA, buyers already understand the product.",
  },
  {
    q: "What do I get to give my clients?",
    a: "A client portal where your clients see their calls, leads, campaigns and spend, plus the n8n automations that connect the voice agent to their CRM or sheet. You leave with a product you can demo and hand over, not just knowledge.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. Everyone who completes the course receives an AI Founder Hub certificate of completion.",
  },
  {
    q: "Why only 10 places?",
    a: "Because the setup sessions are hands-on. With 10 people we can look at every build, fix every broken workflow and review every pitch.",
  },
];

/* ────────────────────────────────────────────────────────
   HERO — live call mock
──────────────────────────────────────────────────────── */

const CALL_SCRIPT: { who: "caller" | "ai"; text: string }[] = [
  { who: "caller", text: "Hi, do you have anything for a cleaning this week?" },
  { who: "ai", text: "We do! Thursday at 4:30 PM or Saturday at 11 AM. Which works better?" },
  { who: "caller", text: "Thursday please." },
  { who: "ai", text: "Done. You're booked for Thursday 4:30 PM. I've sent a confirmation by WhatsApp." },
];

function LiveCallCard() {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const done = step >= CALL_SCRIPT.length;

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const delay = done ? 4500 : step === 0 ? 900 : 1900;
    const t = setTimeout(() => {
      if (done) setSeconds(0);
      setStep((s) => (s >= CALL_SCRIPT.length ? 0 : s + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [step, done]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="conic-frame shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
      <div className="rounded-[25px] bg-panel p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-volt/15 text-volt">
              <PhoneIncoming className="h-4.5 w-4.5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-volt pulse-glow-dot" />
            </div>
            <div>
              <p className="font-display text-[14px] font-bold text-white">Smile Dental · AI Receptionist</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Live call · {mm}:{ss} · 2:47 AM
              </p>
            </div>
          </div>
          <span className="rounded-full border border-volt/30 bg-volt/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-volt">
            AI
          </span>
        </div>

        {/* waveform */}
        <div className="mt-5 flex h-8 items-center gap-[3px]" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, i) => (
            <span
              key={i}
              className="w-full rounded-full bg-volt/70"
              style={{
                height: `${20 + Math.abs(Math.sin((i + seconds) * 0.9)) * 80}%`,
                opacity: done ? 0.25 : 0.4 + Math.abs(Math.cos(i * 0.5)) * 0.6,
                transition: "height 0.6s ease",
              }}
            />
          ))}
        </div>

        <div className="mt-5 min-h-[200px] space-y-2.5" aria-live="polite">
          {CALL_SCRIPT.slice(0, Math.min(step, CALL_SCRIPT.length)).map((line, i) => (
            <div key={i} className={`flex ${line.who === "ai" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                  line.who === "ai"
                    ? "rounded-br-md bg-volt text-void font-medium"
                    : "rounded-bl-md border border-edge bg-void/70 text-zinc-200"
                }`}
              >
                {line.text}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${
            done ? "border-volt/40 bg-volt/10 opacity-100" : "border-edge bg-void/40 opacity-50"
          }`}
        >
          <CalendarCheck className={`h-5 w-5 flex-shrink-0 ${done ? "text-volt" : "text-zinc-600"}`} />
          <div className="min-w-0">
            <p className="font-display text-[13px] font-bold text-white">
              {done ? "Appointment booked · CRM updated" : "Listening…"}
            </p>
            <p className="font-mono text-[10px] text-zinc-500">Recording + transcript saved · no staff on shift</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MARKET GROWTH CHART
──────────────────────────────────────────────────────── */

function GrowthChart() {
  const max = 36;
  return (
    <div className="rounded-2xl border border-edge bg-panel/50 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            AI voice agents market, $ billions
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
            14× in 8 years<Cite n={1} />
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-volt" />Reported</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-volt/35" />Implied by 39% CAGR</span>
        </div>
      </div>
      <div className="mt-8 flex h-56 items-end gap-1.5 sm:gap-3" role="img" aria-label="Market grows from $2.54 billion in 2025 to $35.24 billion in 2033">
        {GROWTH.map((g, i) => (
          <div key={g.year} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className={`font-mono text-[9px] sm:text-[10px] font-bold ${g.reported ? "text-volt" : "text-zinc-500"}`}>
              {g.value < 10 ? g.value.toFixed(1) : Math.round(g.value)}
            </span>
            <Reveal delay={i * 0.03} y={0} className="w-full" >
              <div
                className={`w-full rounded-t-md ${g.reported ? "bg-volt shadow-[0_0_24px_rgba(204,242,68,0.35)]" : "bg-volt/35"}`}
                style={{ height: `${(g.value / max) * 190}px` }}
              />
            </Reveal>
            <span className="font-mono text-[9px] sm:text-[10px] text-zinc-500">
              <span className="sm:hidden">'{String(g.year).slice(2)}</span>
              <span className="hidden sm:inline">{g.year}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   AGENCY REVENUE CALCULATOR
──────────────────────────────────────────────────────── */

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  const id = `calc-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] text-zinc-300">{label}</label>
        <span className="font-display text-[15px] font-extrabold text-white">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer accent-[#ccf244]"
      />
    </div>
  );
}

const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;

function RevenueCalculator() {
  const [clients, setClients] = useState(5);
  const [setup, setSetup] = useState(2000);
  const [retainer, setRetainer] = useState(700);
  const [minutes, setMinutes] = useState(1000);
  const costPerMin = 0.2; // mid-range production cost, see source [4]

  const mrr = clients * retainer;
  const usage = clients * minutes * costPerMin;
  const monthlyProfit = mrr - usage;
  const firstYear = clients * setup + monthlyProfit * 12;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-2xl border border-edge bg-panel/50 p-5 sm:p-7 space-y-6">
        <Slider label="Clients you sign" value={clients} min={1} max={30} step={1} onChange={setClients} format={(v) => `${v}`} />
        <Slider label="One-time setup fee per client" value={setup} min={500} max={5000} step={250} onChange={setSetup} format={usd} />
        <Slider label="Monthly retainer per client" value={retainer} min={200} max={2500} step={50} onChange={setRetainer} format={usd} />
        <Slider label="Call minutes per client / month" value={minutes} min={200} max={5000} step={100} onChange={setMinutes} format={(v) => v.toLocaleString("en-US")} />
        <p className="border-t border-edge/60 pt-4 font-mono text-[10px] leading-relaxed text-zinc-500">
          Usage cost assumes $0.20 per minute, mid-range for a production voice agent (platforms start at $0.07)<Cite n={4} />.
          Illustrative only: your prices, your clients, your results.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-volt/30 bg-volt/[0.07] p-5 sm:p-7">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">Monthly recurring revenue</p>
          <p className="mt-2 font-display text-5xl font-black text-white sm:text-6xl">{usd(mrr)}</p>
          <p className="mt-1 text-[13px] text-zinc-400">
            {usd(monthlyProfit)} after voice usage costs of {usd(usage)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-edge bg-panel/50 p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">Setup fees</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-white">{usd(clients * setup)}</p>
          </div>
          <div className="rounded-2xl border border-edge bg-panel/50 p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">First 12 months</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-volt">{usd(firstYear)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-void/60 p-5">
          <p className="text-[13px] leading-relaxed text-zinc-400">
            For context: one U.S. receptionist costs a business a median <strong className="text-white">$38,010 a year</strong> in wages alone<Cite n={3} />.
            At {usd(retainer)}/month your client pays <strong className="text-white">{usd(retainer * 12)} a year</strong> for a line that never sleeps.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   ENROLLMENT FORM (Ziina checkout)
──────────────────────────────────────────────────────── */

function EnrollmentForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const result = await initiateZiinaPayment({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        amount: 150_000, // 1,500 AED in fils
        message: "AI Founder Hub — AI Agency Master Course (1,500 AED)",
        cancelPath: "/how-to-build-your-ai-agency",
        productCode: "ai-agency-mastercourse",
      });
      if (result.ok && result.redirect_url) {
        window.location.href = result.redirect_url;
      } else {
        setError(result.error || "Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-edge bg-void/80 px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 outline-none focus:border-volt/60 focus:ring-1 focus:ring-volt/20 transition-all disabled:opacity-50";

  return (
    <form onSubmit={handleEnroll} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="enroll-name" className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Full name</label>
        <input id="enroll-name" type="text" autoComplete="name" placeholder="Your full name" value={fullName}
          onChange={(e) => setFullName(e.target.value)} disabled={loading} required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="enroll-email" className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</label>
        <input id="enroll-email" type="email" autoComplete="email" placeholder="you@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} disabled={loading} required className={inputClass} />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">{error}</p>
      )}

      <button
        id="enroll-submit-btn"
        type="submit"
        disabled={loading}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-volt px-8 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_50px_rgba(204,242,68,0.4)] transition-all hover:shadow-[0_0_90px_rgba(204,242,68,0.7)] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        <span className="absolute inset-0 w-1/2 -translate-x-full bg-white/20 [transform:skewX(-25deg)] transition-transform duration-700 group-hover:translate-x-[250%]" />
        {loading ? (
          <>
            <Loader2 className="relative h-4 w-4 animate-spin" />
            <span className="relative">Redirecting to checkout…</span>
          </>
        ) : (
          <>
            <Lock className="relative h-4 w-4" />
            <span className="relative">Secure my place — {PRICE.aed}</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
        {[
          { icon: ShieldCheck, text: "Secured by Ziina" },
          { icon: Zap, text: "Apple Pay · Google Pay · Card" },
          { icon: Lock, text: "PCI compliant" },
        ].map((b) => (
          <span key={b.text} className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            <b.icon className="h-3 w-3 text-volt" />
            {b.text}
          </span>
        ))}
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────
   SMALL PIECES
──────────────────────────────────────────────────────── */

function EnrollButton({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href="#enroll"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-volt px-8 py-4 font-display text-[15px] font-extrabold uppercase tracking-wide text-void shadow-[0_0_60px_rgba(204,242,68,0.35)] transition-shadow hover:shadow-[0_0_100px_rgba(204,242,68,0.65)] ${className}`}
    >
      {children ?? <>Enroll — {PRICE.aed}</>}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-5 font-display text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
      {children}
    </h2>
  );
}

function StickyMobileCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const enroll = document.getElementById("enroll");
      const pastHero = window.scrollY > 600;
      const atEnroll = enroll ? enroll.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
      setShow(pastHero && !atEnroll);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-void/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="leading-tight">
          <p className="font-display text-[15px] font-extrabold text-white">
            {PRICE.aed} <span className="text-[12px] font-semibold text-zinc-500 line-through">{PRICE.was}</span>
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-volt">First 10 only · accepting now</p>
        </div>
        <a href="#enroll" className="flex items-center gap-1.5 rounded-full bg-volt px-5 py-3 font-display text-[13px] font-extrabold uppercase text-void">
          Enroll <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   LIVE DEMO CALLS — real recordings
──────────────────────────────────────────────────────── */

const VIDEO_CAPTURE = [
  { k: "Intent", v: "Invest" },
  { k: "Area", v: "Meydan One" },
  { k: "Budget", v: "2M AED" },
  { k: "Timeline", v: "ASAP" },
  { k: "Outcome", v: "Meeting booked", hot: true },
];

type Line = { t: number; who: "ai" | "lead"; text: string };

// Cleaned excerpts of the 5-minute recording; times match the audio file.
const ESTATE_LINES: Line[] = [
  { t: 0, who: "ai", text: "Hi Elvira, it's Dana from DevMate Real Estate in Business Bay. And before you hang up: yes, this is a property call. I know you've had 11 this week. Give me 90 seconds." },
  { t: 20, who: "lead", text: "I don't really remember reaching out." },
  { t: 24, who: "ai", text: "Totally fair. You probably filled in a form online, maybe while dodging ads or waiting for your coffee." },
  { t: 68, who: "ai", text: "When you filled in that form, were you actually looking, or just curious what things cost now?" },
  { t: 73, who: "lead", text: "I think I was curious. How is the market doing? Are developers giving any discounts?" },
  { t: 89, who: "ai", text: "Is this more about investing for returns, or a place to actually live in?" },
  { t: 95, who: "lead", text: "I'm thinking to invest." },
  { t: 111, who: "ai", text: "What kind of number were you thinking? Be honest. If it's below what's realistic, I'd rather tell you now than waste your Saturday." },
  { t: 120, who: "lead", text: "About one million to one and a half million." },
  { t: 133, who: "lead", text: "I was looking at JVC. I really love this area." },
  { t: 143, who: "ai", text: "JVC, good call. It's genuinely the best cash return in the city: one-bedrooms around 950K, yields up to 8.5%." },
  { t: 175, who: "lead", text: "Don't tell me about JVC. I hate the traffic there." },
  { t: 185, who: "ai", text: "Honestly, you're not wrong. Let's pivot. Would you rather focus on long-term growth, like Business Bay or Dubai Creek Harbour?" },
  { t: 203, who: "lead", text: "Tell me about Dubai Creek Harbour." },
  { t: 206, who: "ai", text: "Newer area, more of a growth play. One-bedrooms run 1.7 to 2.3 million, yields around 6 to 6.5%." },
  { t: 232, who: "lead", text: "Okay. I'd love to talk in person." },
  { t: 237, who: "ai", text: "I'm not going to sell you an apartment over the phone. Give me 30 minutes and I'll bring three options in your range with the real numbers. Thursday at 4, or Saturday morning?" },
  { t: 260, who: "ai", text: "Done. Saturday at 10:30, our office in Business Bay. Your reference is 3184." },
  { t: 286, who: "lead", text: "Where are you from, by the way?" },
  { t: 289, who: "ai", text: "Ah, you caught me. I'm actually an AI. I'm from the cloud: no passport, no traffic." },
];

const ESTATE_MOMENTS = [
  { t: 20, label: "Cold open" },
  { t: 175, label: "Objection" },
  { t: 260, label: "Booked" },
  { t: 286, label: "“Are you AI?”" },
];

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

function AudioDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(311);

  const active = ESTATE_LINES.reduce((idx, l, i) => (l.t <= time ? i : idx), -1);

  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-line="${active}"]`);
    if (list && el && playing) list.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
  }, [active, playing]);

  const seek = (t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setTime(t);
    a.play().catch(() => {});
  };
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div className="grid overflow-hidden rounded-3xl border border-edge bg-panel/60 md:grid-cols-[0.9fr_1.1fr]">
      <audio
        ref={audioRef}
        src="/demos/ai-call-real-estate.mp3"
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 311)}
      />

      {/* left: player */}
      <div className="flex flex-col justify-between gap-8 border-b border-edge p-6 sm:p-8 md:border-b-0 md:border-r">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-lilac">Demo 02 · Outbound · 5 min</p>
          <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white">A cold lead books a viewing</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">She doesn't remember signing up. The AI books her anyway.</p>
        </div>

        <div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              aria-label={playing ? "Pause recording" : "Play recording"}
              className="flex h-14 w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-volt text-void shadow-[0_0_30px_rgba(204,242,68,0.3)] transition-transform hover:scale-105"
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="relative h-1.5 rounded-full bg-edge">
                <div className="absolute inset-y-0 left-0 rounded-full bg-volt" style={{ width: `${pct}%` }} />
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.5}
                  value={time}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label="Seek recording"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-500">
                <span>{fmt(time)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {ESTATE_MOMENTS.map((m) => (
              <button
                key={m.t}
                onClick={() => seek(m.t)}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-edge bg-void/40 px-3 py-2.5 text-left transition-colors hover:border-volt/40"
              >
                <span className="text-[12.5px] text-zinc-300">{m.label}</span>
                <span className="font-mono text-[10px] text-volt">{fmt(m.t)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* right: transcript */}
      <div className="relative">
        <div ref={listRef} className="h-[380px] space-y-1 overflow-y-auto p-4 sm:p-5" aria-label="Call transcript">
          {ESTATE_LINES.map((l, i) => {
            const isActive = i === active;
            const isAi = l.who === "ai";
            return (
              <button
                key={l.t}
                data-line={i}
                onClick={() => seek(l.t)}
                className={`block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors ${isActive ? "bg-volt/10" : "hover:bg-white/[0.03]"}`}
              >
                <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${isAi ? "text-volt" : "text-zinc-500"}`}>
                  {isAi ? "AI" : "Lead"} · {fmt(l.t)}
                </span>
                <span className={`mt-1 block text-[13.5px] leading-relaxed ${isActive ? "text-white" : isAi ? "text-zinc-300" : "text-zinc-500"}`}>
                  {l.text}
                </span>
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-panel to-transparent" />
      </div>
    </div>
  );
}

function VideoDemo() {
  return (
    <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-edge bg-panel/60 p-6 sm:p-8 md:grid-cols-[260px_1fr] md:gap-12">
      <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-2xl border border-edge bg-void">
        <video
          src="/demos/ai-call-property-lead.mp4"
          poster="/demos/ai-call-property-lead.jpg"
          controls
          playsInline
          preload="none"
          className="aspect-[9/16] w-full bg-void object-cover"
        >
          Your browser can't play this video.
        </video>
      </div>

      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">Demo 01 · Inbound · 1:45</p>
        <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          A property lead, qualified in one call
        </h3>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-zinc-400">
          The AI asks the questions, fills the CRM live, and books the consultant.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VIDEO_CAPTURE.map((r) => (
            <div
              key={r.k}
              className={`rounded-xl border px-4 py-3 ${r.hot ? "col-span-2 border-volt/35 bg-volt/[0.07]" : "border-edge bg-void/40"}`}
            >
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">{r.k}</p>
              <p className={`mt-1 font-display text-[15px] font-bold ${r.hot ? "text-volt" : "text-white"}`}>{r.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveDemos() {
  return (
    <section id="demos" className="relative scroll-mt-20 overflow-hidden border-b border-edge/40 py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] max-w-full -translate-x-1/2 rounded-full bg-volt/[0.05] blur-[160px]" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-10">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-400" /> Real calls
            </span>
            <H2>
              Hear what you'll <span className="text-volt">sell</span>
            </H2>
          </div>
        </Reveal>

        <div className="mt-14 space-y-6">
          <Reveal>
            <VideoDemo />
          </Reveal>
          <Reveal delay={0.06}>
            <AudioDemo />
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            You build one in{" "}
            <a href="#curriculum" className="text-volt underline underline-offset-4">session 4</a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   FREE ON YOUTUBE — classes + real comments
──────────────────────────────────────────────────────── */

const YT_CHANNEL = "https://www.youtube.com/@zainulabideen.unicorn";

const FREE_RESOURCES = [
  "AI cold calling resources: qualify 10,000+ leads a day",
  "Sales masterclass deck: build & sell AI call assistants",
  "Retell AI × Claude: your first AI caller in 5 minutes",
  "AI-personalized emails to 1,000+ leads",
  "3-second AI callback: never lose a lead",
];

const YT_VIDEOS = [
  { id: "_k0cc-vSe0c", title: "Build a $7,500 AI Call Assistant for Dental Clinics", tools: "Retell AI · n8n · free template", views: "9.5K views" },
  { id: "IpT7fiOZc7I", title: "Build Your First AI Call Assistant in Minutes", tools: "Vapi · Twilio · Make.com", views: "4.6K views" },
  { id: "GPfR2tHZl5M", title: "LIVE Masterclass: Build an AI Call Assistant & Sell It for $2,000+", tools: "Retell AI · Make.com · Claude", views: "Live masterclass" },
  { id: "hxDVydAMc-Q", title: "How to Sell AI & Get Clients: AI Call Assistant Sales Masterclass", tools: "Sales · outreach · closing", views: "Live masterclass" },
  { id: "dJxcHaSa54A", title: "Never Lose a Lead: Build & Sell 5-Second AI Callbacks", tools: "Retell AI · Make.com", views: "Live masterclass" },
  { id: "kj8-Vgnu7z4", title: "Build an AI Call Assistant in 5 Minutes", tools: "Claude × Retell AI MCP", views: "Tutorial" },
];

// Verbatim from the comments under the two tutorials above (trimmed where marked …).
const YT_COMMENTS = [
  { a: "@MohibBuildsAI", t: "We Need More of these videos!!!! One of the Most impressive handsdown Voice ai agent videos i have seen !" },
  { a: "@sarwagyapatwa3390", t: "Thats Very Impressive Tutorial Buddy Keep it UP make more like videos this is SUPER Helpful for everyone" },
  { a: "@mursleenjutt9121", t: "World best toutrial" },
  { a: "@AslaneHamdar", t: "Hey man, that video is amazing thank you …" },
  { a: "@nicodangond9603", t: "Amazing, thank you so much!" },
  { a: "@joelmaundu4528", t: "Top video brother!" },
  { a: "@beautybyfaith01", t: "more content like this! Don't give up!!!" },
  { a: "@mimetrickster", t: "Love the video. Can you add a follow-up video …" },
  { a: "@arslanabid2245", t: "Greate video man. …" },
  { a: "@aliayed3169", t: "Great video mate. …" },
  { a: "@kevinrono3808", t: "Impressive" },
  { a: "@hafsahassan8367", t: "Superb" },
  { a: "@mohammedraheel7957", t: "Thank you!" },
  { a: "@Shubham-v1z9g", t: "thanks bro" },
];

const YT_QUESTIONS = [
  { a: "@aliayed3169", t: "Does it support Arabic speaking assistance?" },
  { a: "@arslanabid2245", t: "Do you know any Twilio alternative that provides UAE based numbers, to make calling agents?" },
  { a: "@habibaf3875", t: "Can you make a video on how to do batch calling like 100-200 dials a day, automatically, not manually" },
  { a: "@AslaneHamdar", t: "Have you tried to connect these automations with other dental softwares like eaglesoft, dentrix, cleardent?" },
];

function CommentCard({ a, t }: { a: string; t: string }) {
  return (
    <figure className="w-[290px] flex-shrink-0 rounded-2xl border border-edge bg-panel/70 p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-volt/30 to-lilac/30 font-display text-[12px] font-extrabold text-white">
          {a.replace("@", "").charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-white">{a}</span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            <Youtube className="h-3 w-3 text-red-500" /> YouTube comment
          </span>
        </span>
      </div>
      <blockquote className="mt-3 text-[13px] leading-snug text-zinc-300">{t}</blockquote>
    </figure>
  );
}

function FreeOnYouTube() {
  const half = Math.ceil(YT_COMMENTS.length / 2);
  const rowA = YT_COMMENTS.slice(0, half);
  const rowB = YT_COMMENTS.slice(half);
  return (
    <section id="free-classes" className="relative scroll-mt-20 overflow-hidden border-b border-edge/40 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionTag index="09" label="Free first" />
            <H2>
              Try his teaching <span className="text-volt">for free</span>
            </H2>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-zinc-400">
              Zain publishes full builds and live masterclasses on YouTube for free, and runs free weekly live classes through AI Founder Hub.
              Watch one before you enroll. The course is where we go deeper, build it with you, and get you to a paying client.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="grid grid-cols-3 gap-2 lg:w-[360px]">
              {[
                { v: "14K+", l: "views on 2 tutorials" },
                { v: "127", l: "comments" },
                { v: "1.99K", l: "subscribers" },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl border border-edge bg-panel/60 p-3 text-center">
                  <p className="font-display text-2xl font-black text-white">{x.v}</p>
                  <p className="mt-0.5 font-mono text-[9px] font-bold uppercase leading-tight tracking-widest text-zinc-500">{x.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {YT_VIDEOS.map((v, i) => (
            <Reveal key={v.id} delay={0.03 + i * 0.04}>
              <a
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full overflow-hidden rounded-2xl border border-edge bg-panel/60 transition-colors hover:border-volt/35"
              >
                <div className="relative aspect-video overflow-hidden bg-void">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </span>
                  </span>
                  <span className="absolute left-2 top-2 rounded-md bg-void/85 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-volt">Free</span>
                </div>
                <div className="p-4">
                  <p className="font-display text-[14.5px] font-bold leading-snug text-white">{v.title}</p>
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-500">{v.tools} · {v.views}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.06}>
          <div className="mt-5 grid items-center gap-6 rounded-3xl border border-edge bg-panel/60 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2 text-volt">
                <Download className="h-5 w-5" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest">Free resources</p>
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white">Templates, guides and workflows. Free.</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">The same material we use, shared openly with the community.</p>
              <a
                href="/progress#resources"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-volt px-5 py-2.5 font-display text-[12px] font-extrabold uppercase tracking-wide text-void"
              >
                Get the free resources <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <ul className="grid gap-2">
              {FREE_RESOURCES.map((r) => (
                <li key={r}>
                  <a href="/progress#resources" className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-void/50 px-4 py-3 text-[13.5px] text-zinc-200 transition-colors hover:border-volt/40">
                    <span>{r}</span>
                    <span className="flex-shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-volt">Free</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={YT_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 font-display text-[13px] font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-red-500"
            >
              <Youtube className="h-4 w-4" /> Watch free on YouTube
            </a>
            <a
              href="/freemasterclass"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-edge px-6 py-3 font-display text-[13px] font-bold uppercase tracking-wide text-zinc-200 transition-colors hover:border-volt/40 hover:text-volt"
            >
              Join a free live class <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>

      {/* comment wall */}
      <div className="relative z-10 mt-14">
        <Reveal>
          <p className="mx-auto max-w-6xl px-4 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 md:px-10">
            <MessageCircle className="mr-1.5 inline h-3.5 w-3.5 text-volt" />
            What viewers say under the tutorials
          </p>
        </Reveal>
        <div className="marquee-paused mt-4 space-y-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track gap-3">
            {[...rowA, ...rowA].map((c, i) => <CommentCard key={`a${i}`} {...c} />)}
          </div>
          <div className="marquee-track marquee-reverse gap-3">
            {[...rowB, ...rowB].map((c, i) => <CommentCard key={`b${i}`} {...c} />)}
          </div>
        </div>
      </div>

      {/* questions */}
      <div className="relative z-10 mx-auto mt-14 max-w-6xl px-4 md:px-10">
        <Reveal>
          <div className="rounded-3xl border border-lilac/25 bg-lilac/[0.05] p-6 sm:p-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-lilac">And what they keep asking</p>
            <p className="mt-2 max-w-2xl font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
              A YouTube video can't answer your exact setup. A live cohort of 10 can.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {YT_QUESTIONS.map((q) => (
                <figure key={q.t} className="rounded-2xl border border-edge bg-void/60 p-4">
                  <blockquote className="text-[13.5px] leading-snug text-zinc-200">“{q.t}”</blockquote>
                  <figcaption className="mt-2 font-mono text-[10px] text-zinc-500">{q.a}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   TOOLKIT — what students get beyond the classes
──────────────────────────────────────────────────────── */

const CALL_INTEL = [
  { icon: Target, label: "Intent & lead score on every call" },
  { icon: Smile, label: "Sentiment from post-call analysis" },
  { icon: Mic, label: "Recording of every call" },
  { icon: Clock, label: "Transcripts, best time to call, spend" },
];

const AUTOMATIONS = [
  {
    icon: PhoneCall,
    tone: "text-volt",
    tag: "Voice → CRM",
    title: "Lead reactivation sync",
    sub: "The agent looks up the lead mid-call and writes every answer to the CRM, live.",
    img: "/demos/n8n-lead-workflow.jpg",
    alt: "n8n workflow syncing Retell voice agent answers to a Google Sheet by phone number",
  },
  {
    icon: Mail,
    tone: "text-lilac",
    tag: "Email marketing",
    title: "AI email nurture",
    sub: "Gemini writes a personal email for every lead, Brevo sends it daily, replies and unsubscribes sync back.",
    img: "/demos/n8n-email-nurture.jpg",
    alt: "n8n workflow: Google Sheets leads personalised by Gemini and sent through Brevo",
  },
];

const TOOLKIT_EXTRAS = [
  { icon: Magnet, title: "Lead generation & targeting", sub: "Who to target, where to find them, and how to reach them at scale." },
  { icon: Handshake, title: "First-client onboarding", sub: "We help you set up and launch your first paying client." },
];

const FOUNDER_PERKS = [
  { icon: Users, title: "30 days with the founders", sub: "Direct help from Zain and Ahmed whenever you're stuck." },
  { icon: CalendarHeart, title: "Private founder events", sub: "Invitations to in-person founder events in Dubai." },
  { icon: Award, title: "Certificate", sub: "AI Founder Hub certificate of completion." },
];

function Toolkit() {
  return (
    <section id="toolkit" className="relative scroll-mt-20 overflow-hidden border-b border-edge/40 py-16 sm:py-24">
      <div className="pointer-events-none absolute right-[-10%] top-[10%] h-[460px] w-[460px] rounded-full bg-volt/[0.05] blur-[160px]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10">
        <Reveal>
          <SectionTag index="08" label="Your toolkit" />
          <H2>
            You don't start from zero.
            <br />
            <span className="text-volt">You start with our stack.</span>
          </H2>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-zinc-400">
            The same tools our agency uses with paying clients, handed to you.
          </p>
        </Reveal>

        {/* portal */}
        <Reveal>
          <div className="mt-12 grid items-center gap-8 rounded-3xl border border-edge bg-panel/60 p-6 sm:p-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <div className="flex items-center gap-2 text-volt">
                <LayoutDashboard className="h-5 w-5" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest">Client portal · call intelligence</p>
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">Every call, measured</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                The AI scores intent and sentiment after every call. Your clients log in and see exactly what they're paying for.
              </p>
              <ul className="mt-6 space-y-3">
                {CALL_INTEL.map((c) => (
                  <li key={c.label} className="flex items-center gap-3 text-[14px] text-zinc-200">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-volt/10 text-volt">
                      <c.icon className="h-4 w-4" />
                    </span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
            <figure>
              <div className="overflow-hidden rounded-2xl border border-edge bg-white shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-white px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="ml-2 truncate rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-500">portal.devmatesolutions.com</span>
                </div>
                <img src="/demos/portal-overview.jpg" alt="Sixty portal: best time to call, customer sentiment and agent performance" loading="lazy" className="w-full" />
              </div>
              <figcaption className="mt-3 font-mono text-[10px] text-zinc-600">Live workspace, last 30 days.</figcaption>
            </figure>
          </div>
        </Reveal>

        {/* automations */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {AUTOMATIONS.map((w, i) => (
            <Reveal key={w.title} delay={0.04 + i * 0.06}>
              <div className="flex h-full flex-col rounded-3xl border border-edge bg-panel/60 p-6 sm:p-8">
                <div className={`flex items-center gap-2 ${w.tone}`}>
                  <w.icon className="h-5 w-5" />
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest">{w.tag}</p>
                </div>
                <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white">{w.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{w.sub}</p>
                <div className="mt-6 aspect-[16/10] overflow-hidden rounded-2xl border border-edge bg-void">
                  <img src={w.img} alt={w.alt} loading="lazy" className="h-full w-full object-cover object-left-top" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {TOOLKIT_EXTRAS.map((t, i) => (
            <Reveal key={t.title} delay={0.04 + i * 0.05}>
              <div className="flex h-full items-start gap-4 rounded-3xl border border-edge bg-panel/60 p-6">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-volt/10 text-volt">
                  <t.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-[17px] font-bold text-white">{t.title}</span>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-zinc-400">{t.sub}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* founders */}
        <Reveal delay={0.08}>
          <div className="mt-5 overflow-hidden rounded-3xl border border-volt/25 bg-gradient-to-br from-volt/[0.08] to-transparent p-6 sm:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr]">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  <img src="/me.svg" alt="Zain Ul Abideen" className="h-20 w-20 rounded-full border-2 border-void bg-panel object-cover" loading="lazy" />
                  <img src="/ay2.png" alt="Ahmed Yahya" className="h-20 w-20 rounded-full border-2 border-void bg-panel object-cover" loading="lazy" />
                </div>
                <div>
                  <p className="font-display text-lg font-extrabold leading-tight text-white">Zain & Ahmed</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Founders, AI Founder Hub</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {FOUNDER_PERKS.map((f) => (
                  <div key={f.title} className="rounded-2xl border border-edge bg-void/50 p-4">
                    <f.icon className="h-5 w-5 text-volt" />
                    <p className="mt-3 font-display text-[15px] font-bold text-white">{f.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-400">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   ON THE GROUND — real sessions in Dubai
──────────────────────────────────────────────────────── */

type Tile =
  | { kind: "img"; src: string; alt: string; caption?: string; span: string }
  | { kind: "clip"; src: string; poster: string; alt: string; caption?: string; span: string }
  | { kind: "cta"; span: string };

const ONSITE: Tile[] = [
  { kind: "img", src: "/gallery/community-03.jpg", alt: "AI Founder Hub members after a session in Dubai", caption: "AI Founder Hub, Dubai", span: "col-span-2 row-span-2" },
  { kind: "clip", src: "/gallery/clip-01.mp4", poster: "/gallery/clip-01.jpg", alt: "Live session at Dubai Founders HQ", span: "row-span-2" },
  { kind: "img", src: "/gallery/community-01.jpg", alt: "Founder circle at Dubai Founders HQ", caption: "Founder circle · Dubai Founders HQ", span: "row-span-2" },
  { kind: "clip", src: "/gallery/clip-04.mp4", poster: "/gallery/clip-04.jpg", alt: "Founders sharing their builds", span: "row-span-2" },
  { kind: "clip", src: "/gallery/clip-03.mp4", poster: "/gallery/clip-03.jpg", alt: "Open discussion at the meetup", span: "row-span-2" },
  { kind: "img", src: "/gallery/community-02.jpg", alt: "AI Founder Hub community group photo", caption: "Community night", span: "row-span-2" },
  { kind: "clip", src: "/gallery/clip-05.mp4", poster: "/gallery/clip-05.jpg", alt: "Q&A with founders", span: "row-span-2 hidden md:block" },
  { kind: "clip", src: "/gallery/clip-02.mp4", poster: "/gallery/clip-02.jpg", alt: "AI Founder Hub meetup moment", span: "row-span-2 hidden md:block" },
  { kind: "clip", src: "/gallery/clip-06.mp4", poster: "/gallery/clip-06.jpg", alt: "AI Founder Hub meetup moment", span: "row-span-2 hidden md:block" },
  { kind: "clip", src: "/gallery/clip-07.mp4", poster: "/gallery/clip-07.jpg", alt: "AI Founder Hub meetup moment", span: "row-span-2 hidden md:block" },
  { kind: "cta", span: "row-span-2" },
];

// Muted loop that only plays while on screen.
function AutoClip({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={alt}
      className="h-full w-full object-cover"
    />
  );
}

function OnSiteGallery() {
  return (
    <section id="on-site" className="relative scroll-mt-20 overflow-hidden border-b border-edge/40 py-16 sm:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionTag index="02" label="On the ground" />
            <H2>
              Not a faceless course.
              <br />
              <span className="text-volt">A real room in Dubai.</span>
            </H2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="max-w-sm text-[15px] leading-relaxed text-zinc-400 md:text-right">
              Live founder circles and build sessions at Dubai Founders HQ, run by AI Founder Hub.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[170px] md:grid-cols-4">
          {ONSITE.map((t, i) => (
            <Reveal key={i} delay={Math.min(i * 0.03, 0.2)} className={t.span}>
              {t.kind === "cta" ? (
                <a
                  href="/freemasterclass"
                  className="group flex h-full flex-col justify-between rounded-2xl bg-volt p-5 text-void transition-transform hover:-translate-y-0.5"
                >
                  <Users className="h-6 w-6" />
                  <span>
                    <span className="block font-display text-xl font-extrabold leading-tight">Come to the next one</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest">
                      Free live class <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </a>
              ) : (
                <figure className="group relative h-full overflow-hidden rounded-2xl border border-edge bg-panel">
                  {t.kind === "img" ? (
                    <img src={t.src} alt={t.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  ) : (
                    <AutoClip src={t.src} poster={t.poster} alt={t.alt} />
                  )}
                  {t.kind === "clip" && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-void/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Live
                    </span>
                  )}
                  {t.caption && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 to-transparent p-4 pt-10 font-display text-[13px] font-bold text-white">
                      {t.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   INSTRUCTOR — Zain Ul Abideen
──────────────────────────────────────────────────────── */

const ZAIN_SOCIALS = [
  { label: "LinkedIn", handle: "zainulabideenunicorn", url: "https://www.linkedin.com/in/zainulabideenunicorn/", icon: Linkedin },
  { label: "Instagram", handle: "@zainulabideen.unicorn", url: "https://www.instagram.com/zainulabideen.unicorn/", icon: Instagram },
  { label: "YouTube", handle: "@zainulabideen.unicorn", url: "https://www.youtube.com/@zainulabideen.unicorn", icon: Youtube },
  { label: "DevMate Solutions", handle: "devmatesolutions.com", url: "https://devmatesolutions.com/", icon: Globe },
];

const ZAIN_CREDENTIALS = [
  {
    title: "Founder & CEO, DevMate Solutions",
    sub: "AI agency registered in Dubai, Muscat and NYC. AI voice and call agents are one of its core services.",
  },
  {
    title: "Founder, AI Founder Hub",
    sub: "Dubai's community for AI founders: live builds, masterclasses and founder circles.",
  },
  {
    title: "Ships voice AI products of his own",
    sub: "Sixty (AI WhatsApp and voice agent for lead response, UAE & USA) and Reveal AI.",
  },
];

const DEVMATE_REGISTERED = ["Dubai", "Muscat", "NYC"];

const AHMED = {
  name: "Ahmed Yahya",
  role: "Co-founder · AI Founder Hub",
  photo: "/ay2.png",
  points: ["GCC Top 20 Entrepreneur", "Published author", "Featured on Gulf News, Times of Oman, Oman TV & Smashi TV"],
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/ahmedyahyak/", icon: Linkedin },
    { label: "Website", url: "https://www.ahmedyahyak.com/", icon: Globe },
  ],
};
const DEVMATE_BRANDS = ["Vodafone", "Revio", "Finaxe", "Alwalaa Real Estate", "Maison Serdoun", "Procope AI", "Senioriser", "KoCoach"];


function Instructor() {
  return (
    <section id="instructor" className="relative scroll-mt-20 overflow-hidden border-b border-edge/40 py-16 sm:py-24">
      <div className="pointer-events-none absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-lilac/[0.06] blur-[150px]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* portrait */}
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-edge bg-panel lg:max-w-none">
                <img src="/me.svg" alt="Zain Ul Abideen, Founder & CEO of DevMate Solutions" className="aspect-[4/5] w-full object-cover" loading="lazy" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-void/70 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-200 backdrop-blur-md">
                  <MapPin className="h-3 w-3 text-volt" /> Dubai, UAE
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/85 to-transparent p-5 pt-16">
                  <p className="flex items-center gap-2 font-display text-2xl font-extrabold text-white">
                    Zain Ul Abideen <BadgeCheck className="h-5 w-5 text-volt" />
                  </p>
                  <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                    Founder & CEO · DevMate Solutions
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">Founder · AI Founder Hub</p>
                </div>
              </div>

              <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-2 lg:max-w-none">
                {ZAIN_SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 rounded-xl border border-edge bg-panel/60 px-3 py-2.5 transition-colors hover:border-volt/40"
                  >
                    <s.icon className="h-4 w-4 flex-shrink-0 text-zinc-400 transition-colors group-hover:text-volt" />
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold text-white">{s.label}</span>
                      <span className="block truncate font-mono text-[10px] text-zinc-500">{s.handle}</span>
                    </span>
                  </a>
                ))}
              </div>

              {/* co-founder */}
              <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-edge bg-panel/60 p-4 lg:max-w-none">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">Co-founded AI Founder Hub with</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={AHMED.photo} alt={AHMED.name} loading="lazy" className="h-14 w-14 flex-shrink-0 rounded-full border border-edge bg-void object-cover" />
                  <div className="min-w-0">
                    <p className="font-display text-[16px] font-extrabold text-white">{AHMED.name}</p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">{AHMED.role}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {AHMED.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[12.5px] leading-snug text-zinc-400">
                      <BadgeCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-volt" /> {pt}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  {AHMED.socials.map((so) => (
                    <a
                      key={so.label}
                      href={so.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-edge bg-void/50 px-3 py-1.5 text-[12px] text-zinc-300 transition-colors hover:border-volt/40 hover:text-white"
                    >
                      <so.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-volt" /> {so.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* story */}
          <div>
            <Reveal>
              <SectionTag index="01" label="Your coach" />
              <H2>
                Learn from someone who <span className="text-volt">sells this every week</span>
              </H2>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-6 text-[15.5px] leading-relaxed text-zinc-300">
                Zain Ul Abideen is the founder and CEO of <strong className="text-white">DevMate Solutions</strong>, an AI agency
                registered in Dubai, Muscat and NYC, with clients across the GCC, Europe and North America. Since 2019 he has
                worked with 40+ brands in 25+ industries, and today DevMate builds and sells AI voice agents, WhatsApp agents and
                lead systems to real businesses.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-zinc-400">
                This course isn't theory from a blog. It's the process his team runs: pick the market, build the agent, demo it on a
                live call, close the deal, then support the client every month.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { v: <CountUp to={40} suffix="+" />, l: "Brands served" },
                  { v: <CountUp to={25} suffix="+" />, l: "Industries" },
                  { v: <CountUp to={3} />, l: "Countries registered" },
                  { v: "2019", l: "Building since" },
                ].map((x) => (
                  <div key={x.l} className="rounded-2xl border border-edge bg-panel/50 p-4">
                    <p className="font-display text-3xl font-black text-volt">{x.v}</p>
                    <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">{x.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <ul className="mt-8 space-y-3">
                {ZAIN_CREDENTIALS.map((c) => (
                  <li key={c.title} className="flex gap-3.5 rounded-2xl border border-edge bg-panel/40 p-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-volt" />
                    <span>
                      <span className="block font-display text-[15px] font-bold text-white">{c.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-zinc-400">{c.sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">DevMate is registered in</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DEVMATE_REGISTERED.map((o) => (
                      <span key={o} className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-panel/60 px-3 py-1 text-[12px] text-zinc-300">
                        <MapPin className="h-3 w-3 text-volt" /> {o}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">Brands in DevMate's portfolio</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DEVMATE_BRANDS.map((b) => (
                      <span key={b} className="rounded-full border border-edge bg-panel/60 px-3 py-1 font-display text-[12px] font-semibold text-zinc-300">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.22}>
              <a
                href="https://cal.com/devmate/meet-zain"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-widest text-zinc-300 underline decoration-volt/50 underline-offset-4 hover:text-volt"
              >
                Questions first? Book a call with Zain <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   TALK TO THE TEAM — minimal enquiry form → /api/course-enquiry
──────────────────────────────────────────────────────── */

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/FBrasZIfmvLAZxcR2Yjcho";
const EVENTS_URL = "https://luma.com/aifounderhub";

function EnquiryForm({ placement, compact = false }: { placement: string; compact?: boolean }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || !whatsapp.trim()) {
      setError("Please fill in all three fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/course-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), whatsapp: whatsapp.trim(), placement }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-volt/30 bg-volt/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2.5 text-[14px] text-white">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-volt" />
          Thanks, {fullName.split(" ")[0]}. Our team will reach out on WhatsApp within 24 hours.
        </p>
        <a href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 font-mono text-[11px] font-bold uppercase tracking-widest text-volt underline underline-offset-4">
          Join the WhatsApp group
        </a>
      </div>
    );
  }

  const input =
    "w-full min-w-0 rounded-xl border border-edge bg-void/80 px-4 py-3 text-[14.5px] text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-volt/60 disabled:opacity-50";

  return (
    <form onSubmit={submit} noValidate>
      <div className={`grid gap-2.5 ${compact ? "" : "md:grid-cols-[1fr_1fr_1fr_auto]"}`}>
        <input aria-label="Full name" autoComplete="name" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={state === "loading"} className={input} />
        <input aria-label="Email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={state === "loading"} className={input} />
        <input aria-label="WhatsApp number" type="tel" autoComplete="tel" placeholder="WhatsApp, e.g. +971…" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={state === "loading"} className={input} />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-volt px-6 py-3 font-display text-[13px] font-extrabold uppercase tracking-wide text-void transition-shadow hover:shadow-[0_0_40px_rgba(204,242,68,0.45)] disabled:opacity-70"
        >
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Call me back <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-red-400">{error}</p>}
      <p className="mt-2.5 font-mono text-[10px] text-zinc-600">No spam. One of the team will contact you personally.</p>
    </form>
  );
}

function TalkToTeam({ placement, eyebrow, title, sub }: { placement: string; eyebrow: string; title: string; sub: string }) {
  return (
    <section className="border-b border-edge/40 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-10">
        <Reveal>
          <div className="rounded-3xl border border-edge bg-panel/60 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-volt">
              <MessageSquare className="h-4 w-4" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest">{eyebrow}</p>
            </div>
            <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">{title}</h3>
            <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-zinc-400">{sub}</p>
            <div className="mt-6">
              <EnquiryForm placement={placement} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CommunityBand() {
  return (
    <section className="border-b border-edge/40 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">Not ready for the course? Join the community first</p>
        </Reveal>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full items-center gap-5 rounded-3xl border border-edge bg-panel/60 p-6 transition-colors hover:border-[#25D366]/50"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#25D366]">
                <MessageCircle className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[18px] font-extrabold text-white">WhatsApp community</span>
                <span className="mt-0.5 block text-[13.5px] text-zinc-400">Updates, free classes and founders building with AI.</span>
              </span>
              <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-[#25D366]" />
            </a>
          </Reveal>
          <Reveal delay={0.05}>
            <a
              href={EVENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full items-center gap-5 rounded-3xl border border-edge bg-panel/60 p-6 transition-colors hover:border-volt/50"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-volt/10 text-volt">
                <CalendarDays className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[18px] font-extrabold text-white">Next event</span>
                <span className="mt-0.5 block text-[13.5px] text-zinc-400">See upcoming founder meetups and live sessions in Dubai.</span>
              </span>
              <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-volt" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   FOLLOW US — brand socials
──────────────────────────────────────────────────────── */

const BRANDS = [
  {
    name: "AI Founder Hub",
    sub: "Community · classes · events",
    logo: <LogoMark size={40} />,
    links: [
      { label: "Instagram", handle: "@aifounderhubofficial", url: "https://www.instagram.com/aifounderhubofficial/", icon: Instagram },
      { label: "YouTube", handle: "@zainulabideen.unicorn", url: "https://www.youtube.com/@zainulabideen.unicorn", icon: Youtube },
      { label: "WhatsApp", handle: "Community group", url: WHATSAPP_COMMUNITY_URL, icon: MessageCircle },
      { label: "Events", handle: "luma.com/aifounderhub", url: EVENTS_URL, icon: CalendarDays },
      { label: "Website", handle: "aifounderhub.com", url: "https://aifounderhub.com", icon: Globe },
    ],
  },
  {
    name: "DevMate Solutions",
    sub: "AI-powered agency · Dubai · Muscat · NYC",
    logo: (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-display text-[17px] font-black text-void">D</span>
    ),
    links: [
      { label: "Instagram", handle: "@devmatesolutions", url: "https://www.instagram.com/devmatesolutions/", icon: Instagram },
      { label: "LinkedIn", handle: "devmate-solutions", url: "https://www.linkedin.com/company/devmate-solutions", icon: Linkedin },
      { label: "Facebook", handle: "devmatesolutions", url: "https://www.facebook.com/devmatesolutions", icon: Facebook },
      { label: "Website", handle: "devmatesolutions.com", url: "https://devmatesolutions.com/", icon: Globe },
    ],
  },
];

function FollowUs() {
  return (
    <section className="border-t border-edge/40 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-10">
        <Reveal>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">Follow along</p>
        </Reveal>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {BRANDS.map((b, i) => (
            <Reveal key={b.name} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-edge bg-panel/60 p-6">
                <div className="flex items-center gap-3">
                  {b.logo}
                  <div>
                    <p className="font-display text-[18px] font-extrabold text-white">{b.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{b.sub}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {b.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-xl border border-edge bg-void/50 px-3 py-2.5 transition-colors hover:border-volt/40"
                    >
                      <l.icon className="h-4 w-4 flex-shrink-0 text-zinc-400 transition-colors group-hover:text-volt" />
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-semibold text-white">{l.label}</span>
                        <span className="block truncate font-mono text-[10px] text-zinc-500">{l.handle}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   PAGE
──────────────────────────────────────────────────────── */

export function HowToBuildYourAIAgencyPage() {
  const [openSession, setOpenSession] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-void font-sans text-zinc-100">
      <div className="grain" aria-hidden="true" />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-edge/60 bg-void/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-10">
          <a href="/" className="flex items-center gap-2 text-white transition-colors hover:text-volt" aria-label="Back to AI Founder Hub">
            <ArrowLeft className="h-4 w-4" />
            <Wordmark />
          </a>
          <div className="hidden items-center gap-7 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-400 lg:flex">
            <a href="#demos" className="hover:text-white">Live demos</a>
            <a href="#market" className="hover:text-white">Market</a>
            <a href="#calculator" className="hover:text-white">Calculator</a>
            <a href="#curriculum" className="hover:text-white">Curriculum</a>
            <a href="#instructor" className="hover:text-white">Coach</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <a
            href="#enroll"
            className="hidden items-center gap-2 rounded-full bg-volt px-5 py-2.5 font-display text-[12px] font-extrabold uppercase tracking-wide text-void transition-shadow hover:shadow-[0_0_40px_rgba(204,242,68,0.5)] sm:flex"
          >
            Enroll — {PRICE.aed}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </nav>

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="relative overflow-hidden border-b border-edge/40">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />
          <div className="pointer-events-none absolute -top-40 left-[10%] h-[620px] w-[620px] rounded-full bg-volt/[0.08] blur-[170px]" />
          <div className="pointer-events-none absolute bottom-[-20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-lilac/[0.07] blur-[160px]" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:py-20 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:py-28">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/[0.08] px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-volt">
                  <span className="h-2 w-2 rounded-full bg-volt pulse-glow-dot" />
                  Accepting now · First 10 students only
                </div>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="mt-7 font-display text-[44px] font-extrabold uppercase leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-[86px]">
                  Build an AI
                  <br />
                  <span className="text-shimmer">Voice Agency</span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl font-serif text-2xl italic leading-snug text-zinc-300 sm:text-[28px]">
                  Every business has a phone that rings when nobody's there. You'll sell the thing that answers it.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-zinc-400">
                  In one month and five live sessions, you build a production AI voice agent on a real phone number,
                  set up an outreach engine, and learn the pitch that closes your first client. Taught by{" "}
                  <a href="#instructor" className="font-semibold text-white underline decoration-volt/50 underline-offset-4 hover:text-volt">Zain Ul Abideen</a>,
                  founder of DevMate Solutions, who sells AI voice agents to businesses across the UAE, Oman and the USA.
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <EnrollButton />
                  <a
                    href="#demos"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-edge px-7 py-4 font-display text-[14px] font-bold uppercase tracking-wide text-zinc-300 transition hover:border-volt/40 hover:text-white"
                  >
                    <Play className="h-4 w-4 text-volt" /> Hear a real AI call
                  </a>
                </div>
                <p className="mt-4 font-mono text-[11px] text-zinc-500">
                  Instead of <span className="line-through">{PRICE.was}</span>, it's <span className="font-bold text-volt">{PRICE.aed}</span> for the first 10 students only · {PRICE.omr} · {PRICE.usd}
                </p>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-10 grid max-w-xl grid-cols-2 overflow-hidden rounded-2xl border border-edge bg-panel/60 backdrop-blur-md sm:grid-cols-4">
                  {[
                    { icon: Clock, label: "Duration", value: "1 month" },
                    { icon: GraduationCap, label: "Live classes", value: "5" },
                    { icon: Users, label: "Places", value: "10 only" },
                    { icon: Target, label: "Goal", value: "Client in 90d" },
                  ].map((s, i) => (
                    <div key={s.label} className={`flex flex-col gap-1 px-4 py-4 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b sm:border-b-0" : ""} sm:border-r border-edge/60 last:border-r-0`}>
                      <s.icon className="h-4 w-4 text-volt" />
                      <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">{s.label}</span>
                      <span className="font-display text-[15px] font-extrabold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div className="relative mx-auto w-full max-w-md">
                <LiveCallCard />
                <div className="absolute -bottom-6 -left-4 hidden rounded-xl border border-edge bg-void/90 px-4 py-3 backdrop-blur-md sm:block">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500">You build this in session 4</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ FACT TICKER ══════════ */}
        <div className="marquee-paused overflow-hidden border-b border-edge/40 bg-panel/40 py-3.5" aria-label="Market facts">
          <div className="marquee-track gap-10">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                {t}
                <span className="text-volt">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ LIVE DEMOS ══════════ */}
        <LiveDemos />

        {/* ══════════ CTA: TALK TO TEAM ══════════ */}
        <TalkToTeam
          placement="after-demos"
          eyebrow="Talk to our team"
          title="Want one of these built for your niche?"
          sub="Leave your details and we'll call you to walk through how it works and whether the course is right for you."
        />

        {/* ══════════ COACH + ON SITE ══════════ */}
        <Instructor />
        <OnSiteGallery />
        <CommunityBand />

        {/* ══════════ 01 MARKET ══════════ */}
        <section id="market" className="relative scroll-mt-20 border-b border-edge/40 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="03" label="Why now" />
              <H2>
                The phone is the last thing <span className="text-volt">AI hasn't eaten.</span> Yet.
              </H2>
              <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-zinc-400">
                Voice AI crossed the line in the last two years: agents now sound human, answer in under a second, and
                cost cents a minute. The businesses that need them still mostly don't have them. That gap is the business.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { big: <CountUp to={35} prefix="$" suffix="B" />, label: "AI voice agents market by 2033", sub: "Up from $2.54B in 2025, growing 39% a year", cite: 1 },
                { big: <CountUp to={80} prefix="$" suffix="B" />, label: "Labor costs cut by conversational AI", sub: "Gartner's forecast for contact centers in 2026", cite: 2 },
                { big: <CountUp to={69} suffix="%" />, label: "Missed calls never called back", sub: "Within 48 hours, across 16.7M missed business calls", cite: 5 },
                { big: <><CountUp to={22} suffix="%" /></>, label: "Of a Y Combinator batch building voice", sub: "Up from 13% one year earlier", cite: 6 },
              ].map((s, i) => (
                <Reveal key={s.label} delay={0.05 + i * 0.06}>
                  <div className="h-full rounded-2xl border border-edge bg-panel/50 p-6 transition-colors hover:border-volt/30">
                    <p className="font-display text-5xl font-black text-volt">{s.big}</p>
                    <p className="mt-3 font-display text-[14px] font-bold uppercase leading-tight text-white">
                      {s.label}<Cite n={s.cite} />
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-500">{s.sub}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <Reveal delay={0.1}>
                <GrowthChart />
              </Reveal>
              <Reveal delay={0.16}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-lilac/25 bg-lilac/[0.05] p-6 sm:p-7">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-lilac">The GCC window</p>
                    <p className="mt-3 font-display text-2xl font-extrabold leading-tight text-white">
                      Saudi conversational AI is forecast to grow <span className="text-lilac">29.7% a year</span> to 2033<Cite n={7} />.
                    </p>
                    <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">
                      In the USA, buyers already understand voice agents. In the UAE, Saudi Arabia, Qatar and Oman, most clinics,
                      agencies and showrooms have never been pitched one. Early sellers set the price.
                    </p>
                  </div>
                  <p className="mt-6 border-t border-lilac/15 pt-4 font-mono text-[11px] text-zinc-500">
                    Infrastructure is ready too: Vapi alone has passed 1 billion calls<Cite n={8} />.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════ 02 THE MATH ══════════ */}
        <section className="relative overflow-hidden border-b border-edge/40 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-volt/[0.03] to-transparent" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="04" label="The math" />
              <H2>Why owners say yes</H2>
              <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-zinc-400">
                You're not selling "AI". You're selling a front desk that never misses a call, at a fraction of a salary.
              </p>
            </Reveal>

            <div className="mt-12 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              <Reveal>
                <div className="h-full rounded-2xl border border-edge bg-panel/50 p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <PhoneMissed className="h-4 w-4 text-zinc-500" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">Human receptionist</span>
                  </div>
                  <p className="mt-4 font-display text-5xl font-black text-zinc-300">$38,010</p>
                  <p className="text-[13px] text-zinc-500">U.S. median a year, wages only<Cite n={3} /></p>
                  <ul className="mt-6 space-y-2.5">
                    {["~40 hours a week, one call at a time", "Nights, weekends and holidays go to voicemail", "Sick days, training, turnover"].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-zinc-400">
                        <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" strokeWidth={3} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <div className="flex items-center justify-center">
                <span className="rounded-full border border-edge bg-void px-4 py-2 font-display text-sm font-extrabold uppercase text-zinc-500">vs</span>
              </div>

              <Reveal delay={0.08}>
                <div className="h-full rounded-2xl border border-volt/35 bg-volt/[0.06] p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-volt" />
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">AI voice agent</span>
                  </div>
                  <p className="mt-4 font-display text-5xl font-black text-white">$0.07<span className="text-2xl text-zinc-400">/min</span></p>
                  <p className="text-[13px] text-zinc-400">Starting platform cost; ~$0.13–0.31 in production<Cite n={4} /></p>
                  <ul className="mt-6 space-y-2.5">
                    {["24/7/365, many calls at once", "Books, qualifies, follows up, updates the CRM", "Every call recorded and transcribed"].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-zinc-200">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-edge bg-void/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">The offer you'll learn to sell</p>
                  <p className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
                    ~$2,000 setup <span className="text-zinc-500">+</span> ~$700 / month
                  </p>
                </div>
                <p className="max-w-sm text-[13px] leading-relaxed text-zinc-500">
                  Example structure taught in session 5. Under a quarter of a salary for the client, with healthy margins for you. You set your own prices.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ 03 CALCULATOR ══════════ */}
        <section id="calculator" className="scroll-mt-20 border-b border-edge/40 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="05" label="Calculator" />
              <H2>
                What a small agency <span className="text-volt">can look like</span>
              </H2>
              <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-zinc-400">
                Recurring revenue compounds: every client you sign keeps paying while you sign the next one. Move the sliders.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <RevenueCalculator />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ CTA: CALLBACK ══════════ */}
        <TalkToTeam
          placement="after-calculator"
          eyebrow="Not sure yet?"
          title="Get a callback and run the numbers with us"
          sub="Tell us where you are. We'll help you pick a market and an offer, even before you enroll."
        />

        {/* ══════════ 04 WHO BUYS ══════════ */}
        <section className="relative overflow-hidden border-b border-edge/40 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-30" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="06" label="Who buys" />
              <H2>Every business with a phone</H2>
              <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-zinc-400">
                The best clients have high call volume, high value per call, and staff who can't answer everything. These are the ones we start with.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {VERTICALS.map((v, i) => (
                <Reveal key={v.name} delay={0.04 + i * 0.04}>
                  <div className="group h-full rounded-2xl border border-edge bg-panel/50 p-5 transition-colors hover:border-volt/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-volt/10 text-volt transition-colors group-hover:bg-volt/20">
                      <v.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-display text-[15px] font-bold uppercase text-white">{v.name}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
                      {v.pain}
                      {v.cite && <Cite n={v.cite} />}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ 05 CURRICULUM ══════════ */}
        <section id="curriculum" className="scroll-mt-20 border-b border-edge/40 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <Reveal>
                  <SectionTag index="07" label="Curriculum" />
                  <H2>5 classes. 1 month. A real business.</H2>
                  <p className="mt-5 text-[15.5px] leading-relaxed text-zinc-400">
                    Each class ends with something built, not just something learned. Recordings and resources for every session.
                  </p>
                </Reveal>
                <Reveal delay={0.08}>
                  <div className="mt-8 rounded-2xl border border-edge bg-panel/50 p-5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">By the last class you'll have</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {BUILT.map((b) => (
                        <div key={b.label} className="flex items-start gap-3">
                          <b.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-volt" />
                          <div>
                            <p className="text-[13.5px] font-semibold text-white">{b.label}</p>
                            <p className="text-[12px] text-zinc-500">{b.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {STACK.map((t) => (
                      <span key={t} className="rounded-full border border-edge bg-panel/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">{t}</span>
                    ))}
                  </div>
                </Reveal>
              </div>

              <div className="relative space-y-3">
                <div className="pointer-events-none absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-volt/50 via-edge to-transparent" aria-hidden="true" />
                {SESSIONS.map((s, i) => {
                  const open = openSession === i;
                  return (
                    <Reveal key={s.num} delay={0.04 + i * 0.04}>
                      <div className={`relative rounded-2xl border bg-panel/50 transition-colors ${open ? "border-volt/35" : "border-edge hover:border-zinc-700"}`}>
                        <button
                          onClick={() => setOpenSession(open ? null : i)}
                          aria-expanded={open}
                          className="flex w-full cursor-pointer items-start gap-4 p-5 text-left sm:p-6"
                        >
                          <span className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display text-[12px] font-extrabold ${open ? "bg-volt text-void" : "border border-edge bg-void text-volt"}`}>
                            {s.num}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-[16px] font-bold uppercase leading-tight text-white">{s.title}</span>
                            <span className="mt-1.5 block text-[13px] text-zinc-400">{s.outcome}</span>
                          </span>
                          <ChevronDown className={`mt-1 h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-volt" : "text-zinc-500"}`} />
                        </button>
                        {open && (
                          <ul className="space-y-2.5 border-t border-edge/50 px-5 py-5 pl-[68px] sm:px-6 sm:pl-[72px]">
                            {s.points.map((p) => (
                              <li key={p} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-200">
                                <Check className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
                                {p}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TOOLKIT ══════════ */}
        <Toolkit />

        {/* ══════════ FREE ON YOUTUBE ══════════ */}
        <FreeOnYouTube />

        {/* ══════════ 06 VALUE ══════════ */}
        <section className="relative overflow-hidden border-b border-edge/40 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-volt/[0.04] via-void to-void" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="10" label="Everything included" />
              <H2>What you get</H2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-10 overflow-hidden rounded-2xl border border-edge bg-panel/50">
                {VALUE_STACK.map((row) => (
                  <div key={row.item} className="flex items-center justify-between gap-4 border-b border-edge/50 px-5 py-4 sm:px-6">
                    <span className="flex items-start gap-3 text-[14px] text-zinc-200">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-volt" strokeWidth={3} />
                      {row.item}
                    </span>
                    <span className="flex-shrink-0 font-mono text-[12px] font-bold text-zinc-500">{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 border-b border-volt/20 bg-volt/[0.05] px-5 py-4 sm:px-6">
                  <span className="font-display text-[14px] font-extrabold uppercase text-zinc-300">Total value</span>
                  <span className="font-display text-xl font-black text-zinc-500 line-through">19,000 AED</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-volt/20 bg-volt/[0.05] px-5 py-4 sm:px-6">
                  <span className="font-display text-[14px] font-extrabold uppercase text-zinc-300">Regular price</span>
                  <span className="font-display text-xl font-black text-zinc-500 line-through">{PRICE.was}</span>
                </div>
                <div className="flex flex-col gap-4 bg-volt/10 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <span className="font-display text-[16px] font-extrabold uppercase text-volt">First 10 students only</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-zinc-400">{PRICE.omr} · {PRICE.usd} · save {PRICE.save} · accepting now</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-4xl font-black text-white">{PRICE.aed}</span>
                    <EnrollButton className="!px-6 !py-3 !text-[13px]">Enroll</EnrollButton>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>


        {/* ══════════ 08 STRAIGHT TALK ══════════ */}
        <section className="border-b border-edge/40 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="11" label="Straight talk" />
              <H2>What we promise, and what we don't</H2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-volt/25 bg-panel/50 p-6 sm:p-8">
                  <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                    <Check className="h-4 w-4" strokeWidth={3} /> Promised
                  </p>
                  <ul className="mt-5 space-y-3">
                    {[
                      "5 live classes over 1 month, with recordings and resources",
                      "A production AI voice agent built on a real phone number",
                      "An instant-callback demo you can show a prospect live",
                      "A working outreach system, set up with us",
                      "A pitch, pricing and first-deal closing playbook",
                      "A 90-day roadmap to your first client",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-200">
                        <Check className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="h-full rounded-2xl border border-red-500/20 bg-panel/50 p-6 sm:p-8">
                  <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
                    <X className="h-4 w-4" strokeWidth={3} /> Not promised
                  </p>
                  <ul className="mt-5 space-y-3">
                    {[
                      "Any specific income. $10K/month is a roadmap, not a guarantee",
                      "A guaranteed client. That depends on the outreach you do",
                      "That it's passive. Selling takes calls, follow-ups and rejection",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-zinc-200">
                        <X className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-red-400" strokeWidth={3} />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-red-500/10 pt-4 text-[13px] leading-relaxed text-zinc-500">
                    The market is real and growing fast. What you earn from it depends on the work you put into your outreach.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════ 09 FAQ ══════════ */}
        <section id="faq" className="scroll-mt-20 border-b border-edge/40 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 md:px-10">
            <Reveal>
              <SectionTag index="12" label="FAQ" />
              <H2>Questions</H2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={f.q} delay={0.03 + i * 0.03}>
                    <div className={`overflow-hidden rounded-2xl border bg-panel/50 ${open ? "border-volt/30" : "border-edge"}`}>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left"
                      >
                        <span className="font-display text-[15px] font-bold text-white">{f.q}</span>
                        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-volt" : "text-zinc-500"}`} />
                      </button>
                      {open && <p className="border-t border-edge/50 px-5 py-4 text-[14px] leading-relaxed text-zinc-300">{f.a}</p>}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════ 10 ENROLL ══════════ */}
        <section id="enroll" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-volt/[0.06] via-transparent to-void" />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[700px] max-w-full -translate-x-1/2 rounded-full bg-volt/[0.08] blur-[160px]" />
          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-10 lg:grid-cols-2">
            <div>
              <Reveal>
                <SectionTag index="13" label="Enroll" />
                <h2 className="mt-5 font-display text-[44px] font-extrabold uppercase leading-[0.9] tracking-tight text-white sm:text-6xl">
                  Ten places.
                  <br />
                  <span className="text-volt">One cohort.</span>
                </h2>
                <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-zinc-300">
                  Instead of {PRICE.was}, it's {PRICE.aed} for the first 10 students only. We're accepting enrolments now, and places go in the order payments are confirmed.
                  The start date is announced to enrolled students first.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="mt-8 grid max-w-md grid-cols-2 gap-x-4 gap-y-2.5">
                  {["5 live classes + recordings", "Client portal + automations", "First-client onboarding help", "Lead generation system", "30 days with the founders", "Certificate + founder events"].map((t) => (
                    <span key={t} className="flex items-center gap-2 text-[13px] text-zinc-400">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-volt" strokeWidth={3} />
                      {t}
                    </span>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="mt-10 max-w-md rounded-2xl border border-edge bg-panel/50 p-5">
                  <p className="font-display text-[16px] font-bold text-white">Prefer to talk first?</p>
                  <p className="mt-1 mb-4 text-[13px] text-zinc-400">Leave your details and we'll call you back.</p>
                  <EnquiryForm placement="enroll" compact />
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <div className="conic-frame mx-auto w-full max-w-md">
                <div className="rounded-[25px] bg-panel p-6 sm:p-8">
                  <div className="mb-6 flex items-end justify-between border-b border-edge pb-5">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-volt">First 10 only · accepting now</p>
                      <p className="mt-1 font-display text-4xl font-black text-white">{PRICE.aed}</p>
                      <p className="font-mono text-[11px] text-zinc-500">{PRICE.omr} · {PRICE.usd}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-zinc-600 line-through">{PRICE.was}</p>
                      <p className="font-mono text-[10px] font-bold uppercase text-volt">Save {PRICE.save}</p>
                    </div>
                  </div>
                  <EnrollmentForm />
                  <p className="mt-4 text-center font-mono text-[10px] text-zinc-600">You'll be redirected to Ziina's secure checkout</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ FOLLOW US ══════════ */}
        <FollowUs />

        {/* ══════════ SOURCES ══════════ */}
        <section id="sources" className="scroll-mt-20 border-t border-edge/40 bg-panel/30 py-12 pb-28 md:pb-12">
          <div className="mx-auto max-w-4xl px-4 md:px-10">
            <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <Sparkles className="h-3.5 w-3.5 text-volt" /> Sources
            </p>
            <ol className="mt-5 space-y-2">
              {SOURCES.map((s) => (
                <li key={s.id} className="flex gap-3 text-[12.5px] leading-relaxed text-zinc-500">
                  <span className="font-mono text-zinc-600">[{s.id}]</span>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 hover:text-volt">
                    {s.label}
                    <ExternalLink className="mt-1 h-3 w-3 flex-shrink-0" />
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[11.5px] leading-relaxed text-zinc-600">
              Market forecasts are third-party estimates and vary by publisher. Revenue examples and the calculator are illustrations, not income claims.
            </p>
          </div>
        </section>
      </main>

      <StickyMobileCta />
      <div className="hidden md:block">
        <BackToTop />
      </div>
    </div>
  );
}
