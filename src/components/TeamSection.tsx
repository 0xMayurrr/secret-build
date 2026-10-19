import React, { useState, useEffect, useRef, useCallback } from "react";
import { TEAM_MEMBERS, type TeamMember } from "./team-data";

interface TeamSectionProps {
  sectionHead?: React.ReactNode;
}

export function TeamSection({ sectionHead }: TeamSectionProps) {
  const [isLit, setIsLit] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play retro mechanical switch sound with Web Audio API
  const playClickSound = (turnOn: boolean) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = turnOn ? "triangle" : "sine";
      osc.frequency.setValueAtTime(turnOn ? 460 : 300, now);
      osc.frequency.exponentialRampToValueAtTime(turnOn ? 170 : 100, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext blocked or not supported - silently ignore
    }
  };

  const handleToggleLight = () => {
    const nextState = !isLit;
    playClickSound(nextState);
    setIsLit(nextState);
  };

  // Close dossier modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedMember(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check and maintain seamless infinite loop boundaries
  const checkInfiniteBounds = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const segmentWidth = container.scrollWidth / 4;
    if (segmentWidth <= 0) return;

    if (container.scrollLeft >= segmentWidth * 2.5) {
      container.scrollLeft -= segmentWidth;
    } else if (container.scrollLeft <= segmentWidth * 0.5) {
      container.scrollLeft += segmentWidth;
    }
  }, []);

  // Initialize scroll position to the center set so users can drag left or right immediately
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const initScroll = () => {
      const segmentWidth = container.scrollWidth / 4;
      if (segmentWidth > 0 && container.scrollLeft === 0) {
        container.scrollLeft = segmentWidth;
      }
    };
    initScroll();
    const timer = setTimeout(initScroll, 200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scrolling requestAnimationFrame loop with pause support
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 0.045; // pixels per ms (~45px per second, smooth continuous glide)

    const tick = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      const container = scrollContainerRef.current;
      if (container && !isUserInteractingRef.current && !isManuallyPaused) {
        container.scrollLeft += speed * Math.min(dt, 50);
        checkInfiniteBounds();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isManuallyPaused, checkInfiniteBounds]);

  const resetResumeTimer = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    isUserInteractingRef.current = true;
    resumeTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 1800);
  };

  // Drag-to-scroll Handlers for Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollStartRef.current = container.scrollLeft;
    isUserInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    e.preventDefault();
    const currentX = e.pageX - container.offsetLeft;
    const delta = (currentX - startXRef.current) * 1.3;
    if (Math.abs(delta) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollStartRef.current - delta;
    checkInfiniteBounds();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    resetResumeTimer();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      resetResumeTimer();
    }
  };

  // Touch handlers for mobile / tablet drag
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length === 0) return;
    hasDraggedRef.current = false;
    startXRef.current = e.touches[0].pageX - container.offsetLeft;
    scrollStartRef.current = container.scrollLeft;
    isUserInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container || e.touches.length === 0) return;
    const currentX = e.touches[0].pageX - container.offsetLeft;
    const delta = (currentX - startXRef.current) * 1.3;
    if (Math.abs(delta) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollStartRef.current - delta;
    checkInfiniteBounds();
  };

  const handleTouchEnd = () => {
    resetResumeTimer();
  };

  // Wheel horizontal scrolling handler
  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 0) {
      container.scrollLeft += delta;
      checkInfiniteBounds();
      resetResumeTimer();
    }
  };

  // Manual button step scrolling
  const scrollManual = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    resetResumeTimer();
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkInfiniteBounds, 350);
  };

  // 4 sets guarantee a seamless infinite scroll canvas with ample room for forward and backward scrolling
  const quadrupledMembers = [
    ...TEAM_MEMBERS,
    ...TEAM_MEMBERS,
    ...TEAM_MEMBERS,
    ...TEAM_MEMBERS,
  ];

  return (
    <section
      id="team"
      className="relative overflow-hidden border-y-2 border-primary bg-card/40 py-24 transition-colors duration-700 select-none"
      style={{
        backgroundColor: isLit ? "oklch(0.16 0.035 290)" : undefined,
      }}
    >
      {/* WARM GOLDEN AMBIENT SPOTLIGHT (Radiates across the section from the hanging bulb in the top right) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-in-out"
        style={{
          opacity: isLit ? 1 : 0,
          background: `radial-gradient(1100px 750px at calc(100% - 100px) 140px, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.08) 45%, rgba(168, 85, 247, 0.03) 75%, transparent 92%)`,
        }}
      />

      {/* Atmospheric Warm Radial Bloom behind the bulb */}
      <div
        className="pointer-events-none absolute top-16 right-4 sm:right-12 md:right-24 z-10 h-72 w-72 rounded-full blur-3xl transition-opacity duration-700"
        style={{
          opacity: isLit ? 0.75 : 0,
          background: "radial-gradient(circle, #fde047 0%, #f59e0b 50%, transparent 75%)",
        }}
      />

      {/* CALLOUT BADGE POINTING TO THE BULB: "CLICK TO REVEAL THE PEOPLE" */}
      <div
        data-testid="reveal-people-badge"
        role="button"
        tabIndex={0}
        onClick={handleToggleLight}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleLight();
          }
        }}
        className={`absolute top-20 right-24 sm:right-36 md:right-52 z-30 cursor-pointer flex items-center gap-2.5 rounded-sm border-2 px-3 py-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
          isLit
            ? "border-amber-400 bg-black/90 text-amber-300 shadow-[4px_4px_0_0_#f59e0b]"
            : "border-primary bg-background/95 text-foreground shadow-[5px_5px_0_0_var(--primary)] hover:border-signal hover:shadow-[6px_6px_0_0_var(--signal)] animate-bounce"
        }`}
        title={isLit ? "Click light to turn off" : "Click to reveal the people"}
      >
        <span className="font-pixel text-xs text-signal">
          {isLit ? "💡" : "⚡"}
        </span>
        <div className="flex flex-col text-left">
          <span className="font-pixel text-[9px] sm:text-[10px] tracking-wider text-foreground">
            {isLit ? "LIGHTS ON // CLICK TO DIM" : "CLICK TO REVEAL THE PEOPLE"}
          </span>
          <span className="font-term text-[12px] text-signal font-bold leading-none mt-0.5">
            {isLit ? "Operatives Revealed" : "Turn on the hanging light"}
          </span>
        </div>
        <span
          className={`font-pixel text-xs text-signal transition-transform ml-1 ${
            isLit ? "text-amber-400 rotate-90" : "animate-pulse"
          }`}
        >
          ➔
        </span>
      </div>

      {/* Decorative pointer line from callout badge to the bulb */}
      <div
        className={`hidden sm:block absolute top-[104px] right-14 sm:right-24 md:right-36 w-10 sm:w-14 h-[2px] border-b-2 border-dashed transition-colors duration-500 z-20 pointer-events-none ${
          isLit ? "border-amber-400/80" : "border-primary/80 animate-pulse"
        }`}
      />

      {/* HANGING EDISON BULB — single pivot at ceiling so wire + bulb sway together */}
      <div
        className="absolute top-0 right-6 sm:right-16 md:right-28 z-30 flex flex-col items-center"
        style={{ width: "56px" }}
      >
        {/* Ceiling bracket */}
        <div className="h-3 w-8 rounded-b-sm border-x-2 border-b-2 border-neutral-600 bg-neutral-900" />

        {/* Everything below swings from one pivot */}
        <div
          className="animate-bulb-sway flex flex-col items-center"
          style={{ transformOrigin: "top center" }}
        >
          {/* Wire */}
          <div
            className="w-[2px] bg-neutral-700"
            style={{
              height: "160px",
              boxShadow: isLit ? "0 0 6px 1px rgba(251,191,36,0.3)" : "none",
              transition: "box-shadow 0.7s",
            }}
          />

          {/* Clickable bulb assembly */}
          <div
            data-testid="hanging-bulb"
            role="button"
            tabIndex={0}
            aria-label={isLit ? "Turn light off" : "Turn light on"}
            onClick={handleToggleLight}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleLight();
              }
            }}
            className="group cursor-pointer active:scale-95 transition-transform flex flex-col items-center"
          >
            <svg
              width="56"
              height="130"
              viewBox="0 0 56 130"
              className={`transition-all duration-500 ${
                isLit
                  ? "drop-shadow-[0_0_14px_#fde047] drop-shadow-[0_0_36px_#f59e0b]"
                  : "opacity-75 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_#a855f7]"
              }`}
            >
              <defs>
                <radialGradient id="bulbLit" cx="50%" cy="60%" r="55%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="20%" stopColor="#fef9c3" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="85%" stopColor="#d97706" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#92400e" stopOpacity="0.15" />
                </radialGradient>
                <radialGradient id="bulbUnlit" cx="38%" cy="38%" r="60%">
                  <stop offset="0%" stopColor="#4b5563" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#1f2937" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#111827" stopOpacity="0.85" />
                </radialGradient>
                <filter id="fGlow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="2.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* ── SOCKET (brass collar at top) ── */}
              <rect
                x="20"
                y="0"
                width="16"
                height="6"
                rx="1"
                fill="#44403c"
                stroke="#78716c"
                strokeWidth="0.8"
              />
              <path
                d="M18 6 L38 6 L36 22 L20 22 Z"
                fill="url(#socketGrad)"
                stroke="#92400e"
                strokeWidth="0.8"
              />
              <defs>
                <linearGradient id="socketGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="40%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
              </defs>
              <line x1="18" y1="10" x2="38" y2="10" stroke="#92400e" strokeWidth="0.7" opacity="0.7" />
              <line x1="19" y1="15" x2="37" y2="15" stroke="#92400e" strokeWidth="0.7" opacity="0.7" />
              <rect
                x="19"
                y="20"
                width="18"
                height="4"
                rx="1"
                fill="#57534e"
                stroke="#78716c"
                strokeWidth="0.6"
              />

              {/* ── GLASS GLOBE (A19 pear shape) ── */}
              <path
                d="M21 24 Q20 30 16 38 Q10 52 10 66 Q10 96 28 100 Q46 96 46 66 Q46 52 40 38 Q36 30 35 24 Z"
                fill={isLit ? "url(#bulbLit)" : "url(#bulbUnlit)"}
                stroke={isLit ? "#fef08a" : "#475569"}
                strokeWidth="1.2"
              />

              {/* ── FILAMENT SUPPORT WIRES ── */}
              <line
                x1="24"
                y1="26"
                x2="24"
                y2="82"
                stroke={isLit ? "#fbbf24" : "#374151"}
                strokeWidth="0.8"
                opacity="0.7"
              />
              <line
                x1="32"
                y1="26"
                x2="32"
                y2="82"
                stroke={isLit ? "#fbbf24" : "#374151"}
                strokeWidth="0.8"
                opacity="0.7"
              />

              {/* ── TUNGSTEN COIL FILAMENT ── */}
              {isLit ? (
                <path
                  d="M24 82 L24 52 Q24 44 28 40 Q32 44 32 52 L32 82"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#fGlow)"
                  className="animate-filament-glow"
                />
              ) : (
                <path
                  d="M24 82 L24 52 Q24 44 28 40 Q32 44 32 52 L32 82"
                  stroke="#374151"
                  strokeWidth="1.5"
                  fill="none"
                />
              )}

              {/* ── GLASS SPECULAR HIGHLIGHT ── */}
              <path
                d="M15 42 Q14 58 15 74"
                stroke={isLit ? "#ffffff" : "#6b7280"}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={isLit ? 0.7 : 0.2}
              />

              {/* ── BASE TIP ── */}
              <ellipse
                cx="28"
                cy="100"
                rx="8"
                ry="3"
                fill={isLit ? "#fef08a" : "#374151"}
                opacity={isLit ? 0.6 : 0.4}
              />
            </svg>

            {/* Subtle bulb hint */}
            <span
              className={`mt-1 font-pixel text-[8px] tracking-wider uppercase transition-colors px-1.5 py-0.5 rounded ${
                isLit
                  ? "text-amber-400 bg-amber-950/70 border border-amber-500/40"
                  : "text-signal/90 bg-black/70 border border-signal/30 group-hover:text-signal group-hover:border-signal"
              }`}
            >
              {isLit ? "● ON" : "▲ CLICK"}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION HEADER (With Interactive Light Toggle & Manual Marquee Controls) */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-term text-2xl text-signal">06 // meet the team</p>
            <h2 className="mt-4 font-pixel text-2xl leading-relaxed md:text-4xl text-foreground">
              THE PEOPLE
              <br />
              <span className="text-primary">BEHIND BLACKOUT.</span>
            </h2>
          </div>

          {/* INTERACTIVE CONTROLS BAR: Light status toggle + Marquee Scroll Controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 z-20">
            {/* Quick Light Switcher */}
            <button
              type="button"
              onClick={handleToggleLight}
              className={`flex items-center gap-2 border-2 px-3 py-1.5 font-pixel text-[9px] sm:text-[10px] transition-all duration-200 active:scale-95 ${
                isLit
                  ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow-[3px_3px_0_0_#f59e0b]"
                  : "border-primary bg-primary/10 text-foreground shadow-[3px_3px_0_0_var(--primary)] hover:border-signal hover:text-signal hover:shadow-[3px_3px_0_0_var(--signal)]"
              }`}
            >
              <span>{isLit ? "💡" : "⚡"}</span>
              <span>{isLit ? "LIGHT: ON (REVEALED)" : "CLICK TO REVEAL"}</span>
            </button>

            {/* Manual Scroll: Prev */}
            <button
              type="button"
              onClick={() => scrollManual("left")}
              aria-label="Scroll left"
              className="border-2 border-foreground bg-background px-2.5 py-1.5 font-pixel text-[10px] text-foreground shadow-[3px_3px_0_0_var(--primary)] hover:border-signal hover:text-signal hover:shadow-[3px_3px_0_0_var(--signal)] active:scale-95 transition"
            >
              ◀ PREV
            </button>

            {/* Auto-scroll Pause / Resume Toggle */}
            <button
              type="button"
              onClick={() => setIsManuallyPaused(!isManuallyPaused)}
              aria-label={isManuallyPaused ? "Resume auto scroll" : "Pause auto scroll"}
              className="border-2 border-foreground bg-background px-2.5 py-1.5 font-pixel text-[10px] text-foreground shadow-[3px_3px_0_0_var(--primary)] hover:border-signal hover:text-signal hover:shadow-[3px_3px_0_0_var(--signal)] active:scale-95 transition"
            >
              {isManuallyPaused ? "▶ AUTO" : "❚❚ PAUSE"}
            </button>

            {/* Manual Scroll: Next */}
            <button
              type="button"
              onClick={() => scrollManual("right")}
              aria-label="Scroll right"
              className="border-2 border-foreground bg-background px-2.5 py-1.5 font-pixel text-[10px] text-foreground shadow-[3px_3px_0_0_var(--primary)] hover:border-signal hover:text-signal hover:shadow-[3px_3px_0_0_var(--signal)] active:scale-95 transition"
            >
              NEXT ▶
            </button>

            <span className="hidden lg:inline-block font-term text-base text-muted-foreground ml-1">
              ⇄ DRAG OR SCROLL
            </span>
          </div>
        </div>
      </div>

      {/* CONTINUOUS MARQUEE TRACK WITH FULL DRAG & WHEEL MANUAL SCROLLING */}
      <div className="relative mt-8 w-full overflow-hidden py-10 md:py-14">
        {/* Left Edge CRT Fade Mask */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 md:w-28 transition-colors duration-700"
          style={{
            background: isLit
              ? "linear-gradient(to right, oklch(0.16 0.035 290) 0%, transparent 100%)"
              : "linear-gradient(to right, var(--color-background) 0%, transparent 100%)",
          }}
        />

        {/* Right Edge CRT Fade Mask */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 md:w-28 transition-colors duration-700"
          style={{
            background: isLit
              ? "linear-gradient(to left, oklch(0.16 0.035 290) 0%, transparent 100%)"
              : "linear-gradient(to left, var(--color-background) 0%, transparent 100%)",
          }}
        />

        {/* Interactive Infinite Scrolling Container with Drag-to-Scroll & Mousewheel Support */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onMouseEnter={() => {
            isUserInteractingRef.current = true;
          }}
          className={`flex w-full overflow-x-auto items-start gap-5 px-3 select-none pb-8 pt-4 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {quadrupledMembers.map((m, idx) => {
            const isDown = idx % 2 === 1;
            const cardDelay = `${(idx % 6) * 60}ms`;

            return (
              <article
                key={`${m.id}-${idx}`}
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  if (isLit) {
                    setSelectedMember(m);
                  } else {
                    handleToggleLight();
                  }
                }}
                className={`team-card group/card relative w-[240px] shrink-0 border-2 border-foreground bg-background transition-all duration-300 hover:rotate-0 hover:-translate-y-2 cursor-pointer ${
                  isDown ? "mt-10 md:mt-14 rotate-[1.5deg]" : "-rotate-[1.5deg]"
                } shadow-[6px_6px_0_0_var(--primary)] hover:shadow-[10px_10px_0_0_var(--signal)]`}
              >
                {/* CARD HEADER (Clean Brutalist BLACKOUT Theme - Never Yellow) */}
                <div className="flex items-center justify-between border-b-2 border-foreground bg-primary px-3 py-1 font-pixel text-[9px] text-primary-foreground">
                  <span>{m.id}</span>
                  <span className="animate-blink">●</span>
                </div>

                {/* CARD PHOTO AREA (Cinematic Blur-to-Sharpness Crossfade) */}
                <div className="relative aspect-square overflow-hidden border-b-2 border-foreground bg-muted">
                  {/* UNLIT / CLASSIFIED LAYER */}
                  <div
                    className={`absolute inset-0 pixel-grid flex flex-col items-center justify-center transition-all ease-out ${
                      isLit
                        ? "opacity-0 blur-md scale-95 pointer-events-none"
                        : "opacity-100 blur-0 scale-100"
                    }`}
                    style={{
                      transitionDuration: "900ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: cardDelay,
                    }}
                  >
                    <span className="font-pixel text-5xl text-primary transition group-hover/card:text-signal">
                      ?
                    </span>
                    <span className="mt-4 font-term text-lg text-muted-foreground">
                      IDENTITY_LOCKED
                    </span>
                    <div className="scanline pointer-events-none absolute inset-0 opacity-0 transition group-hover/card:opacity-100" />
                  </div>

                  {/* ILLUMINATED OPERATIVE AVATAR LAYER (Cinematic de-blur reveal) */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-all ease-out ${
                      isLit
                        ? "opacity-100 blur-0 scale-100 pointer-events-auto"
                        : "opacity-0 blur-lg scale-105 pointer-events-none"
                    }`}
                    style={{
                      backgroundColor: m.avatarBg,
                      transitionDuration: "1200ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: cardDelay,
                    }}
                  >
                    <img
                      src={m.avatarSvg}
                      alt={m.name}
                      className="h-full w-full object-cover p-3 transition duration-500 group-hover/card:scale-105"
                    />
                    <div className="scanline pointer-events-none absolute inset-0 opacity-40 transition group-hover/card:opacity-100" />
                  </div>
                </div>

                {/* CARD BODY (Cinematic Blur-to-Focus Slow Text Reveal) */}
                <div className="relative p-3.5 min-h-[148px]">
                  {/* UNLIT CLASSIFIED DETAILS */}
                  <div
                    className={`transition-all ease-out ${
                      isLit
                        ? "opacity-0 blur-sm scale-95 pointer-events-none absolute inset-x-3.5 top-3.5"
                        : "opacity-100 blur-0 scale-100"
                    }`}
                    style={{
                      transitionDuration: "800ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: cardDelay,
                    }}
                  >
                    <h3 className="font-pixel text-xs leading-relaxed">CLASSIFIED</h3>
                    <p className="mt-2 font-term text-xl text-signal">&gt; role: revealing soon</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Profile drops before the lights go out.
                    </p>
                  </div>

                  {/* ILLUMINATED REAL DETAILS (Smoothly unfolds like developing film) */}
                  <div
                    className={`transition-all ease-out ${
                      isLit
                        ? "opacity-100 blur-0 scale-100 pointer-events-auto"
                        : "opacity-0 blur-md scale-95 pointer-events-none absolute inset-x-3.5 top-3.5"
                    }`}
                    style={{
                      transitionDuration: "1100ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: cardDelay,
                    }}
                  >
                    <h3 className="font-pixel text-xs leading-relaxed text-foreground group-hover/card:text-signal transition-colors">
                      {m.name}
                    </h3>
                    <p className="mt-1 font-term text-lg text-signal font-bold leading-tight">
                      &gt; {m.role}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {m.bio}
                    </p>

                    {/* Minimalist Social Links */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 font-pixel text-[8px]">
                      <div className="flex gap-2">
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="border border-border px-1.5 py-0.5 hover:border-signal hover:text-signal transition"
                        >
                          IN
                        </a>
                        <a
                          href={m.github}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="border border-border px-1.5 py-0.5 hover:border-signal hover:text-signal transition"
                        >
                          GH
                        </a>
                      </div>
                      <span className="text-muted-foreground group-hover/card:text-signal transition-colors">
                        DOSSIER ▶
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* OPERATIVE FULL DOSSIER MODAL (Click card when bulb is ON) */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-lg border-2 border-amber-400 bg-background p-6 shadow-[10px_10px_0_0_#f59e0b] crt"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <div className="flex items-center gap-2 font-pixel text-[10px] text-amber-400">
                <span className="animate-blink">●</span>
                <span>OPERATIVE DOSSIER // {selectedMember.id}</span>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="border-2 border-border px-2 py-1 font-pixel text-[10px] text-muted-foreground hover:border-destructive hover:text-destructive transition"
              >
                ✕ ESC
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div
                className="relative aspect-square border-2 border-foreground overflow-hidden"
                style={{ backgroundColor: selectedMember.avatarBg }}
              >
                <img
                  src={selectedMember.avatarSvg}
                  alt={selectedMember.name}
                  className="h-full w-full object-cover p-2"
                />
              </div>

              <div className="sm:col-span-2">
                <span className="rounded bg-amber-400/10 border border-amber-400/40 px-2 py-0.5 font-pixel text-[8px] text-amber-300">
                  {selectedMember.squad}
                </span>
                <h3 className="mt-2 font-pixel text-sm text-foreground">
                  {selectedMember.name}
                </h3>
                <p className="mt-1 font-term text-2xl text-amber-400 font-bold">
                  &gt; {selectedMember.role}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {selectedMember.bio}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-5 border-t border-border pt-4">
              <p className="font-pixel text-[9px] text-signal">&gt; SPECIALTIES:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMember.skills.map((skill) => (
                  <span
                    key={skill}
                    className="border border-border bg-card px-2 py-0.5 font-mono text-xs text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-border pt-4">
              <div className="flex gap-2">
                <a
                  href={selectedMember.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-foreground bg-primary px-3 py-1.5 font-pixel text-[9px] text-primary-foreground hover:bg-signal hover:text-black transition"
                >
                  LINKEDIN ▶
                </a>
                <a
                  href={selectedMember.github}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-foreground bg-background px-3 py-1.5 font-pixel text-[9px] text-foreground hover:border-signal hover:text-signal transition"
                >
                  GITHUB ▶
                </a>
              </div>
              <span className="font-term text-lg text-muted-foreground">
                STATUS: CONFIRMED_BUILDER
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
