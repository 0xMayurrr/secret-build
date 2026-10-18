import { useState, useEffect } from "react";
import { ArrowUp, Instagram, Linkedin, MessageSquare, Twitter, Mail } from "lucide-react";
import blackoutLogo from "@/assets/blackout-logo.png";

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

  return (
    <footer className="relative overflow-hidden border-t-2 border-primary bg-[#08030f] text-foreground select-none">
      {/* AMBIENT PURPLE GLOW (Subtle neon radiance at the bottom) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse 900px 500px at 50% 100%, rgba(168, 85, 247, 0.18) 0%, rgba(147, 51, 234, 0.06) 50%, transparent 80%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-12">
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
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.8)] filter transition duration-500 hover:scale-105"
                />
                <p className="mt-4 font-term text-2xl text-muted-foreground tracking-wide">
                  An 8-hour surprise-challenge hackathon.
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
                    <span className="font-pixel text-3xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
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
                activeBrand === "BLACKOUT" ? "w-8 bg-primary shadow-[0_0_10px_#a855f7]" : "w-2 bg-neutral-700 hover:bg-neutral-500"
              }`}
              title="View Blackout"
            />
            <button
              onClick={() => setActiveBrand("BUILDICY")}
              className={`h-2 transition-all duration-300 rounded-full ${
                activeBrand === "BUILDICY" ? "w-8 bg-signal shadow-[0_0_10px_#22c55e]" : "w-2 bg-neutral-700 hover:bg-neutral-500"
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

        {/* 4. BOTTOM COPYRIGHT & BACK TO TOP BAR */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30 pt-6 font-mono text-xs text-muted-foreground">
          <p>© 2026 Buildicy · All rights reserved.</p>

          <p className="text-center">
            Built for innovators in Coimbatore
          </p>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-1.5 font-pixel text-[8px] text-muted-foreground transition hover:text-signal"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* 5. MASSIVE FAINT WATERMARK AT THE VERY BOTTOM */}
      <div className="pointer-events-none w-full overflow-hidden text-center pb-2 opacity-[0.06] select-none">
        <span className="font-pixel text-4xl sm:text-7xl md:text-8xl tracking-[0.3em] uppercase text-white whitespace-nowrap">
          {activeBrand === "BLACKOUT" ? "BLACKOUT" : "BUILDICY"}
        </span>
      </div>
    </footer>
  );
}
