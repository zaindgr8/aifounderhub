import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  MessageCircle,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal, SectionTag } from "./shared";
import { CommunityApplyModal, LUMA_URL } from "./CommunityPanel";
import { useAuth } from "../hooks/useAuth";

type Media = { type: "image" | "video"; src: string; poster?: string; alt: string };

// Sources live in src/Gallery; web-optimised copies are in public/gallery.
const MEDIA: Media[] = [
  { type: "image", src: "/gallery/community-01.jpg", alt: "Founder circle at Dubai Founders HQ" },
  { type: "video", src: "/gallery/clip-01.mp4", poster: "/gallery/clip-01.jpg", alt: "Founders sharing their build stories" },
  { type: "video", src: "/gallery/clip-02.mp4", poster: "/gallery/clip-02.jpg", alt: "AI Founder Hub meetup moment" },
  { type: "image", src: "/gallery/community-02.jpg", alt: "AI Founder Hub community group photo" },
  { type: "video", src: "/gallery/clip-03.mp4", poster: "/gallery/clip-03.jpg", alt: "Open discussion at the meetup" },
  { type: "video", src: "/gallery/clip-04.mp4", poster: "/gallery/clip-04.jpg", alt: "AI Founder Hub meetup moment" },
  { type: "video", src: "/gallery/clip-05.mp4", poster: "/gallery/clip-05.jpg", alt: "AI Founder Hub meetup moment" },
  { type: "video", src: "/gallery/clip-06.mp4", poster: "/gallery/clip-06.jpg", alt: "AI Founder Hub meetup moment" },
  { type: "video", src: "/gallery/clip-07.mp4", poster: "/gallery/clip-07.jpg", alt: "AI Founder Hub meetup moment" },
];

/** Muted looping clip that only plays while on screen. */
function InViewVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
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
      className={className}
    />
  );
}

export function Community() {
  const [active, setActive] = useState<number | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % MEDIA.length));
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : (i - 1 + MEDIA.length) % MEDIA.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const step = (dir: 1 | -1) =>
    setActive((i) => (i === null ? i : (i + dir + MEDIA.length) % MEDIA.length));

  const scrollTrack = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const current = active !== null ? MEDIA[active] : null;

  return (
    <section id="community" className="relative overflow-hidden border-t border-edge py-12 sm:py-16 scroll-mt-24">
      {/* Subtle ambient backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-80 w-[600px] rounded-full bg-volt/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/3 h-64 w-64 rounded-full bg-lilac/[0.04] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        {/* Header Block */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Reveal>
              <SectionTag index="01" label="AI Founder Hub Community" />
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="mt-4 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl md:text-[44px]">
                Fastest Growing Community of{" "}
                <span className="text-volt">AI Founders</span>, Entrepreneurs and Enthusiasts in{" "}
                <span className="font-serif italic font-normal normal-case text-volt">Dubai &amp; GCC</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-volt">
                  <Sparkles className="h-3 w-3" />
                  Regular Events, Workshops &amp; Meetups
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <Users className="h-3 w-3 text-lilac" />
                  Connect. Build. Scale
                </span>
              </div>
            </Reveal>
          </div>

          {/* Action CTAs + Carousel Controls */}
          <Reveal delay={0.14} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setApplyModalOpen(true)}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-volt px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-void shadow-[0_0_24px_rgba(204,242,68,0.35)] transition-all hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Join WhatsApp</span>
            </button>

            <a
              href={LUMA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider text-zinc-300 transition-all hover:border-lilac/50 hover:bg-lilac/10 hover:text-lilac active:scale-95 cursor-pointer"
            >
              <CalendarDays className="h-4 w-4 text-lilac" />
              <span>Upcoming Events</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Slider arrows */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <button
                type="button"
                onClick={() => scrollTrack("left")}
                aria-label="Previous photos"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-volt/40 hover:text-volt cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack("right")}
                aria-label="Next photos"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 transition-colors hover:border-volt/40 hover:text-volt cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Minimalist Horizontal Reel (Clean image/video cards without text overlays) */}
        <div className="mt-8">
          <div
            ref={scrollContainerRef}
            className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {MEDIA.map((m, i) => (
              <div
                key={m.src}
                className="group relative shrink-0 w-[240px] sm:w-[280px] md:w-[310px] snap-start"
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Open: ${m.alt}`}
                  className="relative block aspect-[16/11] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] cursor-zoom-in transition-all duration-300 group-hover:border-volt/50 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                >
                  {m.type === "image" ? (
                    <img
                      src={m.src}
                      alt={m.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <InViewVideo
                      src={m.src}
                      poster={m.poster}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </div>
            ))}
          </div>

          {/* Subtext info bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              In-Person &amp; Virtual Meetups
            </span>
            <span className="font-mono text-[10px] text-zinc-600 hidden sm:inline">
              Scroll horizontally or click to inspect
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox for full screen media preview */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void/95 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full border border-edge bg-panel/80 p-2 text-zinc-300 transition-colors hover:text-volt cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-edge bg-panel/80 p-2 text-zinc-300 transition-colors hover:text-volt sm:left-6 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-edge bg-panel/80 p-2 text-zinc-300 transition-colors hover:text-volt sm:right-6 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div onClick={(e) => e.stopPropagation()} className="flex max-h-full max-w-full flex-col items-center">
            {current.type === "image" ? (
              <img src={current.src} alt={current.alt} className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl" />
            ) : (
              <video
                key={current.src}
                src={current.src}
                poster={current.poster}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
              />
            )}
            <span className="mt-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {current.type === "video" && <Play className="h-3 w-3 text-volt" />}
              {active! + 1} / {MEDIA.length} · {current.alt}
            </span>
          </div>
        </div>
      )}

      {/* Community Application Modal */}
      <CommunityApplyModal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        defaultName={user?.user_metadata?.full_name || ""}
        defaultEmail={user?.email || ""}
      />
    </section>
  );
}
