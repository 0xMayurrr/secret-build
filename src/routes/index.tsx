import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import blackoutLogo from "@/assets/blackout-logo.png";
import { TeamSection } from "@/components/TeamSection";
import { Footer } from "@/components/Footer";
import { blackoutAudio } from "@/lib/blackout-audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BLACKOUT 2026 — Ready for the Unknown?" },
      {
        name: "description",
        content:
          "BLACKOUT is a surprise-challenge hackathon by Buildicy. Nov 28, 2026 · Coimbatore, Tamil Nadu. Claim your pass.",
      },
      { property: "og:title", content: "BLACKOUT 2026 — Ready for the Unknown?" },
      {
        property: "og:description",
        content: "A surprise-challenge hackathon by Buildicy in Coimbatore. You won't know until you show up.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ============ EDITABLE CONTENT ============ */
const REGISTER_URL = "#passes"; // replace with real registration link

const PASSES = [
  { name: "EARLY BIRD", price: "499", tag: "TIER_01", benefits: [] as string[], availability: "" },
  { name: "BUILDER PASS", price: "699", tag: "TIER_02", benefits: [] as string[], availability: "", featured: true },
  { name: "FINAL CALL", price: "799", tag: "TIER_03", benefits: [] as string[], availability: "" },
];

const PRIZES: { title: string; detail: string }[] = []; // empty → COMING SOON

// Add real team members here. Leave empty until confirmed.
const TEAM: {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  linkedin?: string;
  github?: string;
}[] = [];
const TEAM_SLOTS = 4;

const WHO = [
  { t: "Students", c: "STU" },
  { t: "Developers", c: "DEV" },
  { t: "Designers", c: "DSN" },
  { t: "Freelancers", c: "FRL" },
  { t: "Professionals", c: "PRO" },
  { t: "Founders", c: "FND" },
  { t: "Anyone who builds", c: "ANY" },
];

const FAQ = [
  ["What is BLACKOUT?", "A surprise-challenge hackathon by Buildicy. The problem statement stays sealed until the event begins — you discover it when you arrive."],
  ["Who can participate?", "Students, developers, designers, freelancers, professionals, founders — anyone passionate about building and innovation."],
  ["How do I register?", "Pick a pass in the Registration Passes section and hit Claim Your Pass. Registration details will be shared here as they go live."],
  ["How much does it cost?", "Early Bird ₹499, Builder Pass ₹699, Final Call ₹799."],
  ["Can I join as a team?", "Yes, BLACKOUT is built for teams. Team size details will be announced with registration."],
  ["Where is the venue?", "Coimbatore, Tamil Nadu. The exact venue will be announced soon."],
  ["What should I bring?", "Your laptop, charger, and an open mind. Any further instructions will be sent to registered participants."],
  ["Is there a refund policy?", "The refund policy will be published before registration opens."],
  ["Can you tell us the challenge?", "Nope. That's the whole point. You won't know until you show up."],
];

const NAV = [
  ["about", "#about"],
  ["mystery", "#mystery"],
  ["passes", "#passes"],
  ["team", "#team"],
  ["faq", "#faq"],
];
/* ========================================= */

const EVENT = new Date("2026-11-28T09:00:00+05:30").getTime();

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = now === null ? 0 : Math.max(0, EVENT - now);
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    ["DAYS", pad(Math.floor(diff / 864e5))],
    ["HRS", pad(Math.floor((diff / 36e5) % 24))],
    ["MIN", pad(Math.floor((diff / 6e4) % 60))],
    ["SEC", pad(Math.floor((diff / 1e3) % 60))],
  ] as const;
}

function useScrollFx() {
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          const p = h > 0 ? (window.scrollY / h) * 100 : 0;
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${p}%`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return progressBarRef;
}

type IntroPhase = "standby" | "flicker" | "surge" | "done";

function useBlackoutIntro() {
  const [phase, setPhase] = useState<IntroPhase>("standby");
  const startedRef = useRef(false);

  const startSequence = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    blackoutAudio.playGlitchIntro();
    setTimeout(() => setPhase("flicker"), 380);
    setTimeout(() => setPhase("surge"), 920);
    setTimeout(() => {
      setPhase("done");
      blackoutAudio.startAmbientMusic();
    }, 1500);
  };

  useEffect(() => {
    // Fire on very first pointer/touch — guaranteed to work on deployed sites
    const onFirst = () => {
      startSequence();
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("touchstart", onFirst);
    };
    window.addEventListener("pointerdown", onFirst);
    window.addEventListener("touchstart", onFirst);
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("touchstart", onFirst);
    };
  }, []);

  return { phase, startSequence };
}

function BlackoutIntro({
  phase,
  logo,
  onActivate,
}: {
  phase: IntroPhase;
  logo: string;
  onActivate: () => void;
}) {
  if (phase === "done") return null;

  return (
    <div
      onClick={onActivate}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        backgroundColor: "#000000",
        overflow: "hidden",
      }}
      title="Click to initialize BLACKOUT"
    >
      {/* Glitch CRT static lines background effect */}
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />

      {/* Center Logo */}
      <div className="relative flex flex-col items-center">
        <img
          src={logo}
          alt="BLACKOUT"
          className="w-64 md:w-96 object-contain will-change-[transform,opacity]"
          style={{
            opacity: phase === "standby" ? 0.9 : 1,
            animation: phase === "flicker" ? "intro-flicker 0.52s steps(1) forwards" : phase === "standby" ? "floaty 4s ease-in-out infinite" : "none",
            filter: phase === "surge"
              ? "drop-shadow(0 0 25px rgba(138,49,251,0.95)) drop-shadow(0 0 50px rgba(95,27,202,0.85)) drop-shadow(0 0 85px rgba(43,4,71,0.7))"
              : "drop-shadow(0 0 20px rgba(138,49,251,0.8)) drop-shadow(0 0 40px rgba(95,27,202,0.6))",
            transform: phase === "surge" ? "scale(1.04) translateZ(0)" : "scale(1) translateZ(0)",
            transition: "filter 0.12s, transform 0.18s ease-out, opacity 0.3s",
          }}
        />


      </div>


    </div>
  );
}

function Typer({ text, active }: { text: string; active: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active || n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), 28);
    return () => clearTimeout(t);
  }, [n, text, active]);
  return (
    <span>
      {text.slice(0, n)}
      <span className="animate-blink text-signal">█</span>
    </span>
  );
}

function SectionHead({ n, k, title }: { n: string; k: string; title: React.ReactNode }) {
  return (
    <div className="reveal">
      <p className="font-term text-2xl text-signal">{n} // {k}</p>
      <h2 className="mt-4 font-pixel text-2xl leading-relaxed md:text-4xl">{title}</h2>
    </div>
  );
}

function CTA({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={REGISTER_URL}
      className={`hard-shadow inline-block border-2 border-foreground bg-primary px-8 py-4 font-pixel text-xs text-primary-foreground transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:text-sm ${className}`}
    >
      {children}
    </a>
  );
}

function Index() {
  const { phase: intro, startSequence } = useBlackoutIntro();
  const cd = useCountdown();
  const progressBarRef = useScrollFx();
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleAudio = () => {
    const muted = blackoutAudio.toggleMute();
    setIsMuted(muted);
  };
  const heroAnchorRef = useRef<HTMLDivElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<{ top: number; width: number }>({ top: 220, width: 650 });
  const [scrollRatio, setScrollRatio] = useState(0);

  useEffect(() => {
    const updateRect = () => {
      if (heroAnchorRef.current) {
        const rect = heroAnchorRef.current.getBoundingClientRect();
        setAnchorRect({
          top: rect.top + window.scrollY,
          width: rect.width || 650,
        });
      }
    };
    updateRect();
    const t = setTimeout(updateRect, 100);
    window.addEventListener("resize", updateRect);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    let prevRatio = 0;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Morph smoothly across the first 280px of scrolling
          const p = Math.min(1, Math.max(0, scrollY / 280));
          if (Math.abs(p - prevRatio) > 0.005 || (p === 1 && prevRatio !== 1) || (p === 0 && prevRatio !== 0)) {
            prevRatio = p;
            setScrollRatio(p);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const targetWidth = windowWidth < 640 ? 160 : 210;
  const targetTop = 12;
  const currentWidth = anchorRect.width + scrollRatio * (targetWidth - anchorRect.width);
  // anchorRect.top is document-absolute; convert to viewport by subtracting current scrollY
  const currentScrollY = scrollRatio * 280; // mirrors the scroll listener (scrollY / 280 = scrollRatio)
  const anchorViewportTop = anchorRect.top - currentScrollY;
  const currentTop = (1 - scrollRatio) * anchorViewportTop + scrollRatio * targetTop;

  return (
    <div className="crt min-h-screen overflow-x-hidden bg-background text-foreground">
      <BlackoutIntro phase={intro} logo={blackoutLogo} />
      {/* progress (purple neon glow) */}
      <div
        ref={progressBarRef}
        className="fixed left-0 top-0 z-[60] h-1 bg-primary shadow-[0_0_12px_rgba(138,49,251,0.85)] will-change-[width]"
        style={{ width: "0%" }}
      />

      {/* FLOATING CYBERPUNK AUDIO CONTROLLER */}
      <button
        onClick={handleToggleAudio}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 border-2 border-foreground bg-background/95 px-2.5 py-1.5 font-pixel text-[8px] md:text-[9px] tracking-wider text-foreground shadow-[4px_4px_0_0_var(--primary)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--signal)] active:translate-y-0 active:shadow-none cursor-pointer"
        title="Toggle Sound"
      >
        <span className="flex items-center gap-0.5">
          {!isMuted ? (
            <>
              <span className="inline-block h-3 w-0.5 bg-primary animate-pulse" />
              <span className="inline-block h-4 w-0.5 bg-primary animate-[pulse_0.8s_ease-in-out_infinite]" />
              <span className="inline-block h-2 w-0.5 bg-primary animate-pulse" />
            </>
          ) : (
            <span className="text-muted-foreground font-bold">✕</span>
          )}
        </span>
        <span>{!isMuted ? "AUDIO: ON" : "AUDIO: MUTED"}</span>
      </button>

      {/* HEADER — minimalist, centered nav, no logo text */}
      <header
        className="fixed inset-x-0 top-0 z-40 transition-all duration-300 ease-in-out"
        style={{
          opacity: Math.max(0, 1 - scrollRatio * 2.2),
          transform: `translateY(-${scrollRatio * 60}px)`,
          pointerEvents: scrollRatio > 0.3 ? "none" : "auto",
        }}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* left — nav links */}
          <div className="hidden md:flex items-center gap-8 font-term text-xl text-muted-foreground">
            {NAV.slice(0, 3).map(([label, href]) => (
              <a key={label} href={href} className="tracking-widest uppercase hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </div>

          {/* center — empty spacer so register sits right */}
          <div className="flex-1" />

          {/* right — remaining links + register */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-8 font-term text-xl text-muted-foreground">
              {NAV.slice(3).map(([label, href]) => (
                <a key={label} href={href} className="tracking-widest uppercase hover:text-foreground transition-colors">
                  {label}
                </a>
              ))}
            </div>
            <a
              href={REGISTER_URL}
              className="font-pixel text-[9px] md:text-[10px] text-primary border border-primary/50 px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              REGISTER
            </a>
          </div>
        </nav>
        {/* thin bottom line */}
        <div className="h-px bg-border/40" />
      </header>

      {/* CONTINUOUS MORPHING LOGO: FULLY TRANSPARENT, ENLARGED, AND PURE PURPLE GLOW */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-transparent border-0 pointer-events-auto"
        style={{
          top: `${Math.max(12, currentTop)}px`,
          width: `${currentWidth}px`,
        }}
      >
        <a
          href="#top"
          onClick={(e) => {
            if (scrollRatio > 0.3) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="group block w-full select-none cursor-pointer"
          aria-label="BLACKOUT"
        >
          <img
            src={blackoutLogo}
            alt="BLACKOUT logo"
            className={`w-full h-auto object-contain transition-all duration-300 ${
              scrollRatio < 0.4
                ? "animate-flicker drop-shadow-[0_0_35px_rgba(138,49,251,0.85)] drop-shadow-[0_0_70px_rgba(95,27,202,0.6)]"
                : "drop-shadow-[0_0_20px_rgba(138,49,251,0.8)] drop-shadow-[0_0_40px_rgba(95,27,202,0.5)] hover:drop-shadow-[0_0_35px_rgba(138,49,251,1)] group-hover:scale-105"
            }`}
          />
        </a>
      </div>

      {/* HERO */}
      <section id="top" className="pixel-grid relative flex min-h-screen items-center pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_75%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 text-center">

          <p
            className="font-term text-lg text-signal md:text-2xl"
            style={{
              opacity: intro === "done" ? 1 : 0,
              transform: intro === "done" ? "none" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            }}
          >
            <Typer text="> system.status: POWER_FAILURE_IMMINENT" active={intro === "done"} />
          </p>

          {/* Hero Anchor placeholder reserving space for the morphing logo */}
          <div
            ref={heroAnchorRef}
            className="mx-auto mt-8 w-full max-w-3xl aspect-[668/373] pointer-events-none"
            aria-hidden="true"
          />

          <p
            className="mt-4 font-pixel text-[10px] tracking-[0.3em] text-muted-foreground md:text-sm"
            style={{
              opacity: intro === "done" ? 1 : 0,
              transform: intro === "done" ? "none" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s",
            }}
          >
            2026 · BY
            <span className="inline-flex items-center gap-1.5 align-middle mx-1">
              <img src="/logo.png" alt="Buildicy" className="inline-block h-10 w-10 object-contain" />
              <span>BUILDICY</span>
            </span>
          </p>

          <h1
            className="glow glitch mx-auto mt-8 font-pixel text-xl leading-relaxed md:text-4xl"
            data-text="READY FOR THE UNKNOWN?"
            style={{
              opacity: intro === "done" ? 1 : 0,
              transform: intro === "done" ? "none" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s",
            }}
          >
            READY FOR THE UNKNOWN?
          </h1>

          <div
            className="mx-auto mt-8 grid max-w-xl grid-cols-4 gap-1.5 md:gap-3"
            style={{
              opacity: intro === "done" ? 1 : 0,
              transform: intro === "done" ? "none" : "translateY(20px)",
              transition: "opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s",
            }}
          >
            {cd.map(([l, v]) => (
              <div key={l} className="border-2 border-border bg-card py-2 md:py-4">
                <div className="font-pixel text-base text-foreground md:text-3xl">{v}</div>
                <div className="mt-1 font-term text-sm text-muted-foreground md:text-lg">{l}</div>
              </div>
            ))}
          </div>

          <div
            className="mt-6 flex flex-wrap justify-center gap-2 font-term text-lg md:text-2xl"
            style={{
              opacity: intro === "done" ? 1 : 0,
              transform: intro === "done" ? "none" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.65s, transform 0.6s ease 0.65s",
            }}
          >
            <span className="border-2 border-border px-3 py-1">NOV 28, 2026</span>
            <span className="border-2 border-border px-3 py-1">COIMBATORE, TN</span>
          </div>

          <div
            style={{
              opacity: intro === "done" ? 1 : 0,
              transform: intro === "done" ? "none" : "translateY(16px)",
              transition: "opacity 0.6s ease 0.75s, transform 0.6s ease 0.75s",
            }}
          >
            <CTA className="mt-10">CLAIM YOUR PASS ▶</CTA>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="-rotate-1 overflow-hidden border-y-2 border-foreground bg-signal py-3 text-accent-foreground">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-pixel text-xs">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-10">
              {["SURPRISE CHALLENGE", "★", "NO SPOILERS", "★", "NO BRIEF", "★", "NO HINTS", "★", "JUST BUILD", "★", "NOV 28", "★"].map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <SectionHead n="01" k="about" title={<>No brief.<br />No hints.<br /><span className="text-primary">Just build.</span></>} />
          <div className="reveal space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              <span className="text-foreground">BLACKOUT</span> is a surprise-challenge hackathon by
              <span className="inline-flex items-center gap-1.5 align-middle">
                <img src="/logo.png" alt="Buildicy" className="inline-block h-7 w-7 object-contain" />
                <span className="text-foreground">Buildicy</span>
              </span> — made for creative thinkers, developers, designers and builders who love
              solving problems and creating something unexpected.
            </p>
            <p>
              Teams take on a problem statement nobody has seen — revealed only at the event — then
              showcase their solutions to the jury and compete for the win.
            </p>
            <div className="hard-shadow border-2 border-primary bg-card p-5 font-term text-2xl text-foreground">
              &gt; You don't know the challenge.<br />
              &gt; You know you came to build.
            </div>
          </div>
        </div>
      </section>

      {/* MYSTERY */}
      <section id="mystery" className="relative overflow-hidden border-y-2 border-border bg-card/40 py-28">
        <div className="noise pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-6xl px-5">
          <SectionHead n="02" k="the mystery" title={<>YOU WON'T KNOW<br /><span className="text-signal">UNTIL YOU SHOW UP.</span></>} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["FILE_001.ENC", "PROBLEM STATEMENT", "Sealed. Encrypted. Unopened until zero hour."],
              ["FILE_002.ENC", "THE RULES", "Classified. Some things only make sense in the dark."],
              ["FILE_003.ENC", "THE TWIST", "There's always one. We're not telling."],
            ].map(([f, t, b], i) => (
              <div
                key={f}
                className="reveal group border-2 border-border bg-background p-6 transition hover:border-signal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="font-term text-lg text-muted-foreground">{f}</p>
                <h3 className="mt-4 font-pixel text-sm leading-relaxed">{t}</h3>
                <div className="mt-4 space-y-2">
                  <div className="redact h-4 w-full" />
                  <div className="redact h-4 w-4/5" />
                  <div className="redact h-4 w-3/5" />
                </div>
                <p className="mt-4 font-term text-xl text-muted-foreground transition group-hover:text-signal">
                  &gt; {b}
                </p>
              </div>
            ))}
          </div>
          <p className="reveal mt-12 text-center font-pixel text-[10px] tracking-[0.4em] text-muted-foreground md:text-xs">
            ACCESS_DENIED · CLEARANCE_REQUIRED · ACCESS_DENIED
          </p>
        </div>
      </section>

      {/* WHO */}
      <section id="who" className="mx-auto max-w-6xl px-5 py-28">
        <SectionHead n="03" k="who should join" title="Anyone who builds." />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {WHO.map((w, i) => (
            <div
              key={w.t}
              className={`reveal group border-2 border-border bg-card p-5 transition hover:-translate-y-1 hover:border-signal hover:shadow-[6px_6px_0_0_var(--signal)] ${i === WHO.length - 1 ? "col-span-2 md:col-span-1 bg-primary text-primary-foreground" : ""}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <p className="font-pixel text-xs opacity-60">[{w.c}]</p>
              <p className="mt-6 font-term text-3xl">{w.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PASSES */}
      <section id="passes" className="pixel-grid border-y-2 border-border py-28">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead n="04" k="registration passes" title="Pick your pass." />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PASSES.map((p, i) => (
              <article
                key={p.name}
                className={`reveal relative flex flex-col border-2 p-6 transition hover:-translate-x-1 hover:-translate-y-1 ${p.featured ? "border-foreground bg-primary text-primary-foreground shadow-[8px_8px_0_0_var(--signal)]" : "border-border bg-background hover:shadow-[6px_6px_0_0_var(--primary)]"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="font-term text-lg opacity-70">{p.tag}</p>
                <h3 className="mt-2 font-pixel text-sm">{p.name}</h3>
                <p className="mt-6 font-pixel text-4xl">
                  <span className="text-2xl">₹</span>{p.price}
                </p>
                <div className="mt-6 flex-1 font-term text-xl">
                  {p.benefits.length ? (
                    <ul className="space-y-1">{p.benefits.map((b) => <li key={b}>+ {b}</li>)}</ul>
                  ) : (
                    <p className="opacity-70">&gt; Benefits announced soon</p>
                  )}
                  {p.availability && <p className="mt-3">{p.availability}</p>}
                </div>
                <a
                  href={REGISTER_URL}
                  className={`mt-8 border-2 py-3 text-center font-pixel text-[10px] transition ${p.featured ? "border-foreground bg-background text-foreground hover:bg-signal hover:text-accent-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
                >
                  SELECT ▶
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZES */}
      <section id="prizes" className="mx-auto max-w-6xl px-5 py-28">
        <SectionHead n="05" k="prizes & recognition" title="What's at stake." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { code: "BOUNTY",    glyph: "₿",  accent: "text-signal",  border: "hover:border-signal",  shadow: "hover:shadow-[6px_6px_0_0_var(--signal)]",  label: "The Bounty",    line: "Compete for high-value cash rewards." },
            { code: "LAUNCHPAD", glyph: "↑",  accent: "text-primary", border: "hover:border-primary", shadow: "hover:shadow-[6px_6px_0_0_var(--primary)]", label: "The Launchpad", line: "Secure elite internship opportunities." },
            { code: "ALLIANCE",  glyph: "◈",  accent: "text-signal",  border: "hover:border-signal",  shadow: "hover:shadow-[6px_6px_0_0_var(--signal)]",  label: "The Alliance",  line: "Direct venture partnership with Buildicy." },
            { code: "UNKNOWN",   glyph: "?",  accent: "text-primary", border: "hover:border-primary", shadow: "hover:shadow-[6px_6px_0_0_var(--primary)]", label: "The Unknown",   line: "Classified surprises unlocked as you build.", redact: true },
          ] as const).map((p, i) => (
            <div
              key={p.code}
              className={`reveal group relative flex flex-col border-2 border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 ${p.border} ${p.shadow}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <p className="font-pixel text-[9px] text-muted-foreground tracking-widest">{p.code}</p>
              <div className={`mt-4 font-pixel text-4xl ${p.accent} glow`}>{p.glyph}</div>
              <h3 className="mt-5 font-pixel text-xs leading-relaxed">{p.label}</h3>
              {p.redact ? (
                <div className="mt-3 space-y-2">
                  <div className="redact h-3 w-full" />
                  <div className="redact h-3 w-4/5" />
                </div>
              ) : (
                <p className="mt-3 font-term text-xl text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
                  &gt; {p.line}
                </p>
              )}
              <div className={`mt-auto pt-5 font-pixel text-[8px] ${p.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                REWARD_CONFIRMED ▶
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <TeamSection />

      {/* EVENT INFO */}
      <section id="info" className="mx-auto max-w-6xl px-5 py-28">
        <SectionHead n="07" k="event information" title="The coordinates." />
        <div className="mt-10 grid border-2 border-border md:grid-cols-2">
          {[
            ["DATE", "November 28, 2026"],
            ["LOCATION", "Coimbatore, Tamil Nadu"],
            ["VENUE", "To be announced"],
            ["ORGANIZER", null],
            ["REGISTRATION", "Passes from ₹499"],
            ["CHALLENGE", "████████████"],
          ].map(([k, v], i) => (
            <div key={k} className={`reveal border-border p-6 ${i % 2 === 0 ? "md:border-r-2" : ""} ${i < 4 ? "border-b-2" : i === 4 ? "border-b-2 md:border-b-0" : ""}`}>
              <p className="font-pixel text-[10px] text-muted-foreground">{k}</p>
              {k === "ORGANIZER" ? (
                <div className="mt-3 flex items-center gap-2">
                  <img src="/logo.png" alt="Buildicy" className="h-9 w-9 object-contain" />
                  <span className="font-term text-2xl">Buildicy</span>
                </div>
              ) : (
                <p className="mt-3 font-term text-3xl">{v}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t-2 border-border bg-card/40 py-28">
        <div className="mx-auto max-w-4xl px-5">
          <SectionHead n="08" k="faq" title="Questions?" />
          <div className="mt-10 space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="reveal group border-2 border-border bg-background open:border-primary">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-term text-2xl">
                  {q}
                  <span className="font-pixel text-sm text-primary transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pixel-grid border-t-2 border-primary py-32 text-center">
        <div className="reveal mx-auto max-w-4xl px-5">
          <p className="font-term text-2xl text-signal">&gt; ready_to_go_dark?</p>
          <h2 className="glow mt-6 font-pixel text-2xl leading-relaxed md:text-5xl">
            YOU CAN'T PREDICT IT.<br /><span className="text-primary">YOU CAN SHOW UP.</span>
          </h2>
          <CTA className="mt-12">CLAIM YOUR PASS ▶</CTA>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
