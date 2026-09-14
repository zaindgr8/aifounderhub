import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code2,
  Users,
  Compass,
  Linkedin,
  Youtube,
  Instagram,
  Globe,
} from "lucide-react";
import { Reveal, SectionTag, Magnetic, scrollToMembership, scrollToWorkshops } from "./shared";
import { ModalKind } from "./PolicyModal";

interface FounderStoryProps {
  onOpenModal?: (kind: ModalKind) => void;
  onOpenClaudeModal?: () => void;
}

export function FounderStory({ onOpenModal, onOpenClaudeModal }: FounderStoryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(94.9);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
          resetControlsTimeout();
        })
        .catch(() => {
          // If unmuted autoplay blocked, mute and retry
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              setHasStarted(true);
              resetControlsTimeout();
            });
          }
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const restartVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      id="founder-story"
      className="relative overflow-hidden border-b border-edge bg-void py-16 sm:py-24 scroll-mt-20"
      aria-label="A message from the founder"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-35" />
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-[450px] w-[450px] rounded-full blur-[140px] opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(204,242,68,0.2) 0%, rgba(181,161,255,0.1) 60%, transparent 80%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-[500px] w-[500px] rounded-full blur-[150px] opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(181,161,255,0.25) 0%, rgba(204,242,68,0.1) 60%, transparent 80%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        {/* Section Tag & Eyebrow */}
        <div className="mb-10 sm:mb-12">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <SectionTag index="01" label="AUTHENTICITY &amp; PROOF" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-volt/30 bg-volt/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-volt">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-volt" />
                Direct From The Founder
              </span>
            </div>
          </Reveal>
        </div>

        {/* 2-Column Content Grid: Left Story/Proof + Right Video Player */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          
          {/* Left Column: Authentic Story, Philosophy & Credentials (7 cols) */}
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-black uppercase leading-[0.96] tracking-tight text-white">
                Why I Built{" "}
                <span className="font-serif italic font-normal normal-case text-volt">
                  AI Founder Hub.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-300 font-normal">
                The internet is flooded with "AI gurus" selling slide decks who have never
                written a production workflow or closed a real retainer.
              </p>
            </Reveal>

            {/* Founder Quote Card */}
            <Reveal delay={0.15}>
              <div className="mt-6 relative rounded-2xl border border-volt/20 bg-panel/80 p-5 sm:p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="absolute -left-1 top-6 h-10 w-1.5 rounded-r-full bg-volt" />
                <p className="font-serif text-lg sm:text-xl italic text-zinc-100 leading-relaxed">
                  "I don’t teach from textbooks. I run Devmate Solutions from Dubai daily, building
                  real AI automations and SaaS architectures for 40+ brands worldwide. AI Founder Hub
                  exists so you can bypass tutorial hell and start shipping real systems that clients
                  pay $2k to $5k a month for."
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-edge/60 pt-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/me.svg"
                      alt="Zain Ul Abideen"
                      className="h-10 w-10 rounded-full border border-volt/40 object-cover bg-[#13131c]"
                    />
                    <div>
                      <h4 className="font-display text-sm font-bold text-white tracking-tight">
                        Zain Ul Abideen
                      </h4>
                      <p className="font-mono text-[10.5px] text-zinc-400">
                        Founder &amp; CEO · AI Founder Hub | Devmate Solutions
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-volt bg-volt/10 border border-volt/25 rounded-md px-2.5 py-1">
                    <span>🇦🇪 Dubai, UAE</span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* 3 Pillars of Authenticity */}
            <div className="mt-8 space-y-3.5">
              <Reveal delay={0.2}>
                <div className="group flex items-start gap-3.5 rounded-xl border border-edge bg-panel/40 p-3.5 transition-colors hover:border-volt/30 hover:bg-panel/70">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-volt/10 text-volt transition-transform group-hover:scale-105">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold uppercase tracking-tight text-white">
                      Active Agency Operator, Not a Theorist
                    </h5>
                    <p className="mt-0.5 text-xs sm:text-[13px] leading-relaxed text-zinc-400">
                      Every prompt, subagent hook, Make scenario, and Voice AI flow comes straight from working client systems.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="group flex items-start gap-3.5 rounded-xl border border-edge bg-panel/40 p-3.5 transition-colors hover:border-volt/30 hover:bg-panel/70">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-lilac/10 text-lilac transition-transform group-hover:scale-105">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold uppercase tracking-tight text-white">
                      Idea ➔ Build ➔ Launch Velocity
                    </h5>
                    <p className="mt-0.5 text-xs sm:text-[13px] leading-relaxed text-zinc-400">
                      From zero to signed client in 90 days. You get copy-paste proposals, pricing sheets, and technical blueprints.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="group flex items-start gap-3.5 rounded-xl border border-edge bg-panel/40 p-3.5 transition-colors hover:border-volt/30 hover:bg-panel/70">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 transition-transform group-hover:scale-105">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-display text-sm font-bold uppercase tracking-tight text-white">
                      Direct 1-on-1 Founder Working Sessions
                    </h5>
                    <p className="mt-0.5 text-xs sm:text-[13px] leading-relaxed text-zinc-400">
                      Private 40-minute deep-dives with Zain to unblock your build, validate your offer, and position your agency.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* CTAs & Social Links */}
            <Reveal delay={0.35}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Magnetic strength={0.2}>
                  <button
                    onClick={scrollToMembership}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-volt px-6 py-3.5 font-display text-sm font-extrabold uppercase tracking-tight text-void transition-all hover:bg-volt-deep hover:shadow-[0_0_30px_rgba(204,242,68,0.4)] active:scale-95 cursor-pointer"
                  >
                    <span>Start Your AI Agency</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Magnetic>

                {onOpenClaudeModal && (
                  <button
                    onClick={onOpenClaudeModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-edge bg-panel/60 px-5 py-3.5 font-display text-sm font-bold uppercase tracking-tight text-zinc-200 transition-colors hover:border-volt/40 hover:text-volt cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-volt" />
                    <span>Free Live Masterclass</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    document.getElementById("mentors")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer ml-1"
                >
                  <span>Book 1:1 session with Zain →</span>
                </button>
              </div>
            </Reveal>

            {/* Social Proof links */}
            <Reveal delay={0.4}>
              <div className="mt-6 flex items-center gap-4 text-zinc-500 font-mono text-xs">
                <span>Follow Zain:</span>
                <a
                  href="https://www.linkedin.com/in/zainulabideenunicorn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-volt transition-colors flex items-center gap-1"
                >
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
                <a
                  href="https://www.youtube.com/@zainulabideen.unicorn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-volt transition-colors flex items-center gap-1"
                >
                  <Youtube className="h-3.5 w-3.5" /> YouTube
                </a>
                <a
                  href="https://www.instagram.com/zainulabideen.unicorn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-volt transition-colors flex items-center gap-1"
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Sleek 9:16 Vertical Founder Video Showcase (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <Reveal delay={0.15} y={30} className="w-full max-w-[360px] sm:max-w-[390px]">
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onClick={togglePlay}
                className="group relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-[32px] sm:rounded-[36px] border border-volt/30 bg-[#08080f] shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(204,242,68,0.15)] ring-1 ring-white/10 transition-all duration-300 hover:border-volt/60 hover:shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_70px_rgba(204,242,68,0.25)] select-none"
              >
                {/* Outer Glow Halo */}
                <div className="pointer-events-none absolute -inset-2 rounded-[40px] bg-gradient-to-tr from-volt/20 via-transparent to-lilac/25 opacity-70 blur-xl" />

                {/* Video Element */}
                <video
                  ref={videoRef}
                  src="/AFH.mp4"
                  poster="/founder-poster.jpg"
                  preload="metadata"
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  className="relative z-10 h-full w-full object-cover"
                >
                  <source src="/AFH.mp4" type="video/mp4" />
                </video>

                {/* Subtle top & bottom vignette gradients */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Top Status Header Bar */}
                <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                      Founder Note
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                      4K · 1:35
                    </span>
                    <button
                      onClick={toggleMute}
                      title={isMuted ? "Unmute" : "Mute"}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-colors hover:border-volt hover:text-volt cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Big Center Play Button Overlay (when paused) */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
                    >
                      {/* Pulse Circle Button */}
                      <div className="relative mb-3 flex h-20 w-20 sm:h-22 sm:w-22 items-center justify-center rounded-full border-2 border-volt bg-volt/20 backdrop-blur-md shadow-[0_0_40px_rgba(204,242,68,0.5)] transition-transform duration-300 group-hover:scale-110">
                        <span className="absolute -inset-2 animate-ping rounded-full border border-volt/40 opacity-75" />
                        <Play className="h-8 w-8 sm:h-9 sm:w-9 text-volt fill-volt ml-1" />
                      </div>

                      <span className="font-display text-base sm:text-lg font-black uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        {hasStarted ? "Resume Message" : "Hear From Zain"}
                      </span>
                      <span className="mt-1 font-mono text-[11px] text-zinc-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                        Click to play with sound · 1:35 min
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Interactive Control Bar & Founder Pill */}
                <div
                  className={`absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5 transition-opacity duration-300 ${
                    showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Progress scrub bar */}
                  <div
                    onClick={handleSeek}
                    className="group/track relative mb-3 h-2 w-full cursor-pointer rounded-full bg-white/20 backdrop-blur-sm transition-all hover:h-3"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-volt to-emerald-400 relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-md" />
                    </div>
                  </div>

                  {/* Player Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlay}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-volt text-void transition-transform hover:scale-110 active:scale-95 cursor-pointer font-bold"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 fill-void" /> : <Play className="h-4 w-4 fill-void ml-0.5" />}
                      </button>

                      <button
                        onClick={restartVideo}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm hover:text-white cursor-pointer"
                        title="Restart"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      <span className="font-mono text-[10px] text-zinc-300 font-semibold tracking-wider">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={cycleSpeed}
                        className="rounded-md border border-white/15 bg-black/60 px-2 py-1 font-mono text-[10px] font-bold text-volt backdrop-blur-sm hover:border-volt cursor-pointer"
                        title="Playback Speed"
                      >
                        {playbackRate}x
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm hover:text-white cursor-pointer"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Founder identifier badge inside player */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] text-zinc-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                      <span className="font-bold text-white">Zain Ul Abideen</span>
                      <span className="text-zinc-400">· Founder</span>
                    </div>
                    <span className="text-volt">aifounderhub.com</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
