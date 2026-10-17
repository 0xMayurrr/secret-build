import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/blackout-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BLACKOUT 2026 — The Challenge Is the Secret" },
      {
        name: "description",
        content:
          "BLACKOUT is an 8-hour surprise-challenge hackathon by Buildicy. Nov 28, 2026 · Coimbatore, Tamil Nadu.",
      },
      { property: "og:title", content: "BLACKOUT 2026 — The Challenge Is the Secret" },
      {
        property: "og:description",
        content: "An 8-hour surprise-challenge hackathon by Buildicy in Coimbatore.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

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

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Typer({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN(n + 1), 45);
    return () => clearTimeout(t);
  }, [n, text]);
  return (
    <span>
      {text.slice(0, n)}
      <span className="animate-blink text-signal">█</span>
    </span>
  );
}

const PHASES = [
  { h: "02", label: "ONLINE", title: "Research & Plan", body: "Internet on. Decode the problem, scout tools, sketch the plan." },
  { h: "05", label: "OFFLINE", title: "Lights Out — Build", body: "The grid goes dark. Just your team, your laptop and your skills." },
  { h: "01", label: "ONLINE", title: "Refine & Pitch", body: "Back online. Polish the prototype and prepare the presentation." },
];

const WHO = ["Students", "Developers", "Designers", "Freelancers", "Professionals", "Anyone who builds"];

function Index() {
  const cd = useCountdown();
  useReveal();

  return (
    <div className="crt min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="font-pixel text-xs tracking-widest text-primary">
            BLACKOUT<span className="text-signal">_</span>26
          </a>
          <div className="hidden gap-8 font-term text-xl text-muted-foreground md:flex">
            <a href="#about" className="hover:text-signal">/about</a>
            <a href="#format" className="hover:text-signal">/format</a>
            <a href="#who" className="hover:text-signal">/who</a>
          </div>
          <a
            href="#register"
            className="border-2 border-primary px-4 py-2 font-pixel text-[10px] text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            REGISTER
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" className="pixel-grid relative flex min-h-screen items-center pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_75%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 text-center">
          <p className="font-term text-2xl text-signal">
            <Typer text="> system.status: POWER_FAILURE_IMMINENT" />
          </p>
          <img
            src={logo.url}
            alt="BLACKOUT"
            className="animate-flicker animate-floaty mx-auto mt-8 w-full max-w-3xl drop-shadow-[0_0_40px_var(--primary)]"
          />
          <p className="mt-4 font-pixel text-xs tracking-[0.3em] text-muted-foreground md:text-sm">
            2026 · BY BUILDICY
          </p>
          <h1 className="glow mx-auto mt-8 max-w-2xl font-term text-4xl leading-tight md:text-5xl">
            The Challenge Is the Secret.
          </h1>

          <div className="mx-auto mt-10 grid max-w-xl grid-cols-4 gap-3">
            {cd.map(([l, v]) => (
              <div key={l} className="border-2 border-border bg-card py-4">
                <div className="font-pixel text-xl text-foreground md:text-3xl">{v}</div>
                <div className="mt-2 font-term text-lg text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 font-term text-2xl">
            <span className="border border-border px-4 py-1">📅 NOV 28, 2026</span>
            <span className="border border-border px-4 py-1">📍 COIMBATORE, TN</span>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y-2 border-primary bg-primary py-3 text-primary-foreground">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-pixel text-xs">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-10">
              {["8 HOURS", "★", "SURPRISE CHALLENGE", "★", "5 HRS OFFLINE", "★", "NO SPOILERS", "★", "BUILD IN THE DARK", "★"].map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-28">
        <div className="reveal grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-term text-2xl text-signal">01 // about</p>
            <h2 className="mt-4 font-pixel text-2xl leading-relaxed md:text-3xl">
              No brief.<br />No hints.<br /><span className="text-primary">Just build.</span>
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              <span className="text-foreground">BLACKOUT</span> is an 8-hour surprise-challenge
              hackathon by Buildicy, where creativity, teamwork and problem-solving meet time
              pressure.
            </p>
            <p>
              Teams tackle an undisclosed problem statement — revealed only at the event. Then
              showcase solutions to the jury and compete for the win.
            </p>
            <div className="hard-shadow border-2 border-primary bg-card p-5 font-term text-2xl text-foreground">
              &gt; You don't know the challenge.<br />
              &gt; You know you came to build.
            </div>
          </div>
        </div>
      </section>

      {/* FORMAT */}
      <section id="format" className="border-t border-border bg-card/40 py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal">
            <p className="font-term text-2xl text-signal">02 // format</p>
            <h2 className="mt-4 font-pixel text-2xl md:text-3xl">8 hours. 3 phases.</h2>
          </div>

          <div className="reveal mt-10 flex h-4 w-full border-2 border-border">
            <div className="w-[25%] bg-primary" />
            <div className="w-[62.5%] bg-background" />
            <div className="w-[12.5%] bg-signal" />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PHASES.map((p, i) => (
              <article
                key={p.title}
                className="reveal group border-2 border-border bg-background p-6 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-primary hover:shadow-[6px_6px_0_0_var(--primary)]"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-pixel text-4xl text-primary">{p.h}<span className="text-base">H</span></span>
                  <span
                    className={`font-term text-xl ${p.label === "OFFLINE" ? "text-muted-foreground" : "text-signal"}`}
                  >
                    ● {p.label}
                  </span>
                </div>
                <h3 className="mt-6 font-term text-3xl">{p.title}</h3>
                <p className="mt-3 text-muted-foreground">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHO */}
      <section id="who" className="mx-auto max-w-6xl px-5 py-28">
        <div className="reveal">
          <p className="font-term text-2xl text-signal">03 // who can join</p>
          <h2 className="mt-4 font-pixel text-2xl md:text-3xl">Anyone who builds.</h2>
        </div>
        <div className="reveal mt-10 flex flex-wrap gap-3">
          {WHO.map((w) => (
            <span
              key={w}
              className="border-2 border-border px-5 py-3 font-term text-2xl transition hover:border-signal hover:text-signal"
            >
              {w}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="register" className="pixel-grid border-t-2 border-primary py-28 text-center">
        <div className="reveal mx-auto max-w-3xl px-5">
          <p className="font-term text-2xl text-signal">&gt; ready_to_go_dark?</p>
          <h2 className="glow mt-6 font-pixel text-3xl leading-relaxed md:text-5xl">
            Enter the<br /><span className="text-primary">BLACKOUT</span>
          </h2>
          <p className="mt-6 font-term text-2xl text-muted-foreground">
            Nov 28, 2026 · Coimbatore, Tamil Nadu
          </p>
          <a
            href="#register"
            className="hard-shadow mt-10 inline-block border-2 border-primary bg-primary px-8 py-4 font-pixel text-sm text-primary-foreground transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            REGISTER NOW ▶
          </a>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center font-term text-xl text-muted-foreground">
        © 2026 BUILDICY · BLACKOUT<span className="animate-blink text-signal">_</span>
      </footer>
    </div>
  );
}
