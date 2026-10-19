import { useState, useEffect } from "react";
import { ArrowUp, Instagram, Linkedin, MessageSquare, Twitter, Mail } from "lucide-react";
import blackoutLogo from "@/assets/blackout-logo.png";

// 5x7 Dot-Matrix Font Definitions for the illuminated LED light element
const FONT_5X7: Record<string, number[]> = {
  B: [0b11110, 0b10001, 0b11110, 0b10001, 0b10001, 0b10001, 0b11110],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  C: [0b01111, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b01111],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

const isDotLit = (row: number, col: number, word: string) => {
  if (row < 1 || row > 7) return false;
  const leftPad = 7;
  const colInText = col - leftPad;
  if (colInText < 0) return false;
  const charIdx = Math.floor(colInText / 6);
  if (charIdx >= word.length) return false;
  const charCol = colInText % 6;
  if (charCol >= 5) return false;
  const char = word[charIdx];
  const pattern = FONT_5X7[char];
  if (!pattern) return false;
  const rowBits = pattern[row - 1];
  return ((rowBits >> (4 - charCol)) & 1) === 1;
};

export function Footer() {
  const [activeBrand, setActiveBrand] = useState<"BLACKOUT" | "BUILDICY">("BLACKOUT");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cinematic 2.5-second alternating cycle between BLACKOUT and BUILDICY
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveBrand((prev) => (prev === "BLACKOUT" ? "BUILDICY" : "BLACKOUT"));
        setIsTransitioning(false);
      }, 240);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 61 columns x 9 rows for the wide LED matrix
  const totalCols = 61;
  const totalRows = 9;

  return (
    <footer className="relative overflow-hidden border-t-2 border-primary bg-[#06020c] text-foreground select-none">
      {/* Subtle top ambient purple glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 z-0"
        style={{
          background: `radial-gradient(ellipse 900px 500px at 50% 100%, rgba(95, 27, 202, 0.22) 0%, rgba(43, 4, 71, 0.08) 50%, transparent 80%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16">
        {/* 1. TOP BAR: Status & Minimalist Social Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border/40 pb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal" />
            </span>
            <span className="font-pixel text-[9px] text-signal tracking-widest uppercase">
              LIVE ARENA // NOV 28, 2026 · COIMBATORE
            </span>
          </div>

          {/* Social Links in Minimalist Brutalist Pills */}
          <div className="flex flex-wrap items-center gap-2.5 font-pixel text-[9px]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex items-center gap-1.5 border border-border/70 bg-card/40 px-3 py-1.5 text-muted-foreground transition hover:border-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              <Instagram className="h-3.5 w-3.5" />
              <span>IG</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex items-center gap-1.5 border border-border/70 bg-card/40 px-3 py-1.5 text-muted-foreground transition hover:border-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span>IN</span>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="flex items-center gap-1.5 border border-border/70 bg-card/40 px-3 py-1.5 text-muted-foreground transition hover:border-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              <Twitter className="h-3.5 w-3.5" />
              <span>X</span>
            </a>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              className="flex items-center gap-1.5 border border-border/70 bg-card/40 px-3 py-1.5 text-muted-foreground transition hover:border-primary hover:text-primary-foreground hover:bg-primary/20"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>DISCORD</span>
            </a>
          </div>
        </div>

        {/* 2. CENTERPIECE: CINEMATIC 2-SECOND LOGO DISPLAY (BLACKOUT <-> BUILDICY) */}
        <div className="py-16 md:py-20 flex flex-col items-center justify-center text-center">
          {/* Morphing Logo Frame */}
          <div
            className={`relative min-h-[120px] flex items-center justify-center transition-all duration-300 ${
              isTransitioning ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
            }`}
          >
            {activeBrand === "BLACKOUT" ? (
              /* BLACKOUT LOGO SHOWCASE */
              <div className="flex flex-col items-center">
                <img
                  src={blackoutLogo}
                  alt="BLACKOUT"
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_30px_rgba(138,49,251,0.85)] drop-shadow-[0_0_60px_rgba(95,27,202,0.5)] filter transition duration-500 hover:scale-105"
                />
                <p className="mt-4 font-term text-2xl text-muted-foreground tracking-wide">
                  A 12-hour surprise-challenge hackathon.
                </p>
              </div>
            ) : (
              /* BUILDICY LOGO SHOWCASE */
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4">
                  <img
                    src="/logo.png"
                    alt="Buildicy"
                    className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_35px_rgba(34,197,94,0.7)] filter transition duration-500 hover:scale-105"
                  />
                  <div className="text-left">
                    <span className="font-pixel text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(138,49,251,0.7)]">
                      BUILDICY
                    </span>
                    <p className="font-term text-xl text-signal">&gt; builders_first_ecosystem</p>
                  </div>
                </div>
                <p className="mt-4 font-term text-2xl text-muted-foreground tracking-wide">
                  Innovating, accelerating, and backing tomorrow's engineers.
                </p>
              </div>
            )}
          </div>

          {/* Phase Switch Dots (Clickable for tactile control) */}
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setActiveBrand("BLACKOUT")}
              className={`h-2 transition-all duration-300 rounded-full ${
                activeBrand === "BLACKOUT"
                  ? "w-8 bg-primary shadow-[0_0_10px_#a855f7]"
                  : "w-2 bg-neutral-700 hover:bg-neutral-500"
              }`}
              title="View Blackout"
            />
            <button
              onClick={() => setActiveBrand("BUILDICY")}
              className={`h-2 transition-all duration-300 rounded-full ${
                activeBrand === "BUILDICY"
                  ? "w-8 bg-signal shadow-[0_0_10px_#22c55e]"
                  : "w-2 bg-neutral-700 hover:bg-neutral-500"
              }`}
              title="View Buildicy"
            />
          </div>
        </div>

        {/* 3. MINIMALIST SITE NAVIGATION */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border/40 pt-8 font-term text-xl text-muted-foreground">
          <a href="#about" className="hover:text-signal transition">
            About
          </a>
          <a href="#mystery" className="hover:text-signal transition">
            Mystery
          </a>
          <a href="#passes" className="hover:text-signal transition">
            Passes
          </a>
          <a href="#prizes" className="hover:text-signal transition">
            Prizes
          </a>
          <a href="#team" className="hover:text-signal transition">
            Team
          </a>
          <a href="#faq" className="hover:text-signal transition">
            FAQ
          </a>
          <a
            href="mailto:contact@buildicy.com"
            className="flex items-center gap-1.5 hover:text-foreground transition text-primary"
          >
            <Mail className="h-4 w-4" />
            <span>contact@buildicy.com</span>
          </a>
        </div>
      </div>

      {/* ── THE GOOD FOLKS STYLE UPWARD RADIANT PURPLE LIGHT EFFECT ELEMENT ── */}
      <div className="relative w-full overflow-hidden pt-16 md:pt-24 pb-8 mt-12 border-t border-primary/40">
        {/* 1. Deep Royal Purple Radiant Wash that blooms upwards */}
        <div
          className="pointer-events-none absolute inset-0 z-0 animate-purple-glow"
          style={{
            background:
              "radial-gradient(ellipse 135% 85% at 50% 100%, #581c87 0%, #7e22ce 25%, #9333ea 50%, rgba(147, 51, 234, 0.45) 75%, transparent 95%)",
          }}
        />

        {/* 2. Intense Ultraviolet / Neon Violet Spotlight Core Flare */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[360px] z-0 animate-pulse"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% 100%, rgba(243, 232, 255, 0.95) 0%, rgba(216, 180, 254, 0.8) 25%, rgba(168, 85, 247, 0.5) 60%, transparent 92%)",
          }}
        />

        {/* 3. Soft Upper Shading Mask for seamless fade into dark background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6, 2, 12, 0.95) 0%, rgba(6, 2, 12, 0.3) 25%, transparent 60%, rgba(216, 180, 254, 0.15) 100%)",
          }}
        />

        {/* 4. Bottom Laser Horizon Line / Light Emitter Beam */}
        <div
          className="absolute bottom-0 inset-x-0 h-[2.5px] z-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 10%, rgba(243,232,255,1) 50%, rgba(168,85,247,0.3) 90%, transparent 100%)",
            boxShadow:
              "0 0 25px 4px rgba(243,232,255,1), 0 0 60px 14px rgba(168,85,247,0.9), 0 0 120px 30px rgba(126,34,206,0.65)",
          }}
        />

        {/* Content Container Bathed in the Upward Purple Light */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          {/* Light Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-primary/30">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-pixel text-2xl sm:text-3xl text-white font-bold tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
                  {activeBrand === "BLACKOUT" ? "The Blackout" : "The Buildicy"}
                </span>
                <span className="font-pixel text-[9px] rounded-full bg-primary/30 border border-primary/60 px-2.5 py-0.5 text-primary-foreground uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                  {activeBrand === "BLACKOUT" ? "ARENA" : "COMMUNITY"}
                </span>
              </div>
              <p className="mt-1.5 font-term text-xl text-purple-100/90 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                {activeBrand === "BLACKOUT"
                  ? "A surprise-challenge hackathon by Buildicy in Coimbatore."
                  : "Empowering, accelerating, and investing in builders."}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-pixel text-[9px] text-purple-300 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(216,180,254,0.6)]">
                BLACKOUT // ARENA 2026
              </span>
              <p className="mt-1 font-term text-lg text-purple-200/90">
                Nov 28, 2026 · Coimbatore, Tamil Nadu
              </p>
            </div>
          </div>

          {/* Sub-bar with Copyright and Quick Links */}
          <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-purple-200/90">
            <p>© 2026 Buildicy · All rights reserved.</p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <span>Coimbatore Arena</span>
              <span>·</span>
              <a href="#about" className="hover:text-white transition">
                Privacy
              </a>
              <span>·</span>
              <span>Made with love in Coimbatore</span>
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-1.5 font-pixel text-[8px] text-purple-100 transition hover:text-white drop-shadow-[0_0_8px_rgba(216,180,254,0.6)]"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* ── THE ILLUMINATED LED DOT-MATRIX LIGHT ELEMENT (PURPLE NEON GLOW) ── */}
          <div className="mt-4 md:mt-8 w-full flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 976 144"
              className="w-full max-w-5xl h-auto overflow-visible select-none pointer-events-none drop-shadow-[0_0_24px_rgba(168,85,247,0.95)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="ledGlowCorePurple" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="60%" stopColor="#f3e8ff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.85" />
                </radialGradient>
                <filter id="ledDropGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Render Matrix Dots */}
              {Array.from({ length: totalRows }).map((_, row) =>
                Array.from({ length: totalCols }).map((_, col) => {
                  const x = col * 16 + 8;
                  const y = row * 16 + 8;
                  const lit = isDotLit(row, col, activeBrand);

                  if (lit) {
                    return (
                      <g key={`dot-${row}-${col}`}>
                        {/* Outer Glow Halo */}
                        <circle
                          cx={x}
                          cy={y}
                          r={4.2}
                          fill="#c084fc"
                          opacity={0.45}
                          filter="url(#ledDropGlowPurple)"
                        />
                        {/* Core Lit LED Dot */}
                        <circle
                          cx={x}
                          cy={y}
                          r={2.8}
                          fill="url(#ledGlowCorePurple)"
                          filter="url(#ledDropGlowPurple)"
                        />
                      </g>
                    );
                  }

                  // Unlit subtle background grid dot
                  return (
                    <circle
                      key={`dot-${row}-${col}`}
                      cx={x}
                      cy={y}
                      r={1.1}
                      fill="#ffffff"
                      opacity={0.12}
                    />
                  );
                })
              )}
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}

