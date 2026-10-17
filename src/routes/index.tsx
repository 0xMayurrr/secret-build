import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/blackout-logo.png.asset.json";

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
  ["about", "/about"],
  ["mystery", "/mystery"],
  ["passes", "/passes"],
  ["team", "/team"],
  ["faq", "/faq"],
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
  const [p, setP] = useState(0);
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
      document.documentElement.style.setProperty("--sy", String(window.scrollY));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return p;
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
  const cd = useCountdown();
  const progress = useScrollFx();

  return (
    <div className="crt min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* progress */}
      <div className="fixed left-0 top-0 z-[60] h-1 bg-signal" style={{ width: `${progress * 100}%` }} />

      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-40 border-b-2 border-border bg-background/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="font-pixel text-xs tracking-widest text-primary">
            BLACKOUT<span className="text-signal">_</span>26
          </a>
          <div className="hidden gap-6 font-term text-xl text-muted-foreground lg:flex">
            {NAV.map(([id, l]) => (
              <a key={id} href={`#${id}`} className="hover:text-signal">{l}</a>
            ))}
          </div>
          <a
            href={REGISTER_URL}
            className="border-2 border-primary px-4 py-2 font-pixel text-[10px] text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            REGISTER
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" className="pixel-grid relative flex min-h-screen items-center pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_75%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-5 text-center">
          <p className="font-term text-xl text-signal md:text-2xl">
            <Typer text="> system.status: POWER_FAILURE_IMMINENT" />
          </p>
          <img
            src={logo.url}
            alt="BLACKOUT logo"
            className="parallax animate-flicker mx-auto mt-8 w-full max-w-3xl drop-shadow-[0_0_40px_var(--primary)]"
          />
          <p className="mt-4 font-pixel text-[10px] tracking-[0.3em] text-muted-foreground md:text-sm">
            2026 · BY BUILDICY
          </p>
          <h1 className="glow glitch mx-auto mt-8 font-pixel text-xl leading-relaxed md:text-4xl" data-text="READY FOR THE UNKNOWN?">
            READY FOR THE UNKNOWN?
          </h1>

          <div className="mx-auto mt-10 grid max-w-xl grid-cols-4 gap-2 md:gap-3">
            {cd.map(([l, v]) => (
              <div key={l} className="border-2 border-border bg-card py-3 md:py-4">
                <div className="font-pixel text-lg text-foreground md:text-3xl">{v}</div>
                <div className="mt-2 font-term text-base text-muted-foreground md:text-lg">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 font-term text-xl md:text-2xl">
            <span className="border-2 border-border px-4 py-1">NOV 28, 2026</span>
            <span className="border-2 border-border px-4 py-1">COIMBATORE, TN</span>
          </div>
          <CTA className="mt-10">CLAIM YOUR PASS ▶</CTA>
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
              Buildicy — made for creative thinkers, developers, designers and builders who love
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
        {PRIZES.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRIZES.map((p) => (
              <div key={p.title} className="reveal border-2 border-border bg-card p-6">
                <h3 className="font-pixel text-sm">{p.title}</h3>
                <p className="mt-3 font-term text-xl text-muted-foreground">{p.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="reveal hard-shadow mt-10 border-2 border-primary bg-card p-10 text-center md:p-16">
            <p className="glitch glow font-pixel text-2xl md:text-5xl" data-text="COMING SOON">COMING SOON</p>
            <p className="mt-6 font-term text-2xl text-muted-foreground">&gt; prize_pool.decrypt() … pending</p>
          </div>
        )}
      </section>

      {/* TEAM */}
      <section id="team" className="relative overflow-hidden border-y-2 border-primary bg-card/40 py-28">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead n="06" k="meet the team" title={<>THE PEOPLE<br /><span className="text-primary">BEHIND BLACKOUT.</span></>} />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {(TEAM.length ? TEAM : Array.from({ length: TEAM_SLOTS }, () => null)).map((m, i) => (
              <article
                key={i}
                className={`reveal team-card group relative border-2 border-foreground bg-background transition duration-300 hover:-translate-y-2 hover:rotate-0 hover:shadow-[10px_10px_0_0_var(--signal)] ${i % 2 ? "lg:mt-16 rotate-[1.5deg]" : "-rotate-[1.5deg]"} shadow-[6px_6px_0_0_var(--primary)]`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center justify-between border-b-2 border-foreground bg-primary px-3 py-1 font-pixel text-[9px] text-primary-foreground">
                  <span>ID_{String(i + 1).padStart(3, "0")}</span>
                  <span className="animate-blink">●</span>
                </div>
                <div className="relative aspect-square overflow-hidden border-b-2 border-foreground bg-muted">
                  {m?.photo ? (
                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
                  ) : (
                    <div className="pixel-grid flex h-full w-full flex-col items-center justify-center">
                      <span className="font-pixel text-5xl text-primary transition group-hover:text-signal">?</span>
                      <span className="mt-4 font-term text-lg text-muted-foreground">IDENTITY_LOCKED</span>
                    </div>
                  )}
                  <div className="scanline pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="p-4">
                  <h3 className="font-pixel text-xs leading-relaxed">{m?.name ?? "CLASSIFIED"}</h3>
                  <p className="mt-2 font-term text-xl text-signal">{m?.role ?? "> role: revealing soon"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{m?.bio ?? "Profile drops before the lights go out."}</p>
                  {(m?.linkedin || m?.github) && (
                    <div className="mt-4 flex gap-2 font-pixel text-[9px]">
                      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" className="border-2 border-border px-2 py-1 hover:border-signal hover:text-signal">IN</a>}
                      {m.github && <a href={m.github} target="_blank" rel="noreferrer" className="border-2 border-border px-2 py-1 hover:border-signal hover:text-signal">GH</a>}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EVENT INFO */}
      <section id="info" className="mx-auto max-w-6xl px-5 py-28">
        <SectionHead n="07" k="event information" title="The coordinates." />
        <div className="mt-10 grid border-2 border-border md:grid-cols-2">
          {[
            ["DATE", "November 28, 2026"],
            ["LOCATION", "Coimbatore, Tamil Nadu"],
            ["VENUE", "To be announced"],
            ["ORGANIZER", "Buildicy"],
            ["REGISTRATION", "Passes from ₹499"],
            ["CHALLENGE", "████████████"],
          ].map(([k, v], i) => (
            <div key={k} className={`reveal border-border p-6 ${i % 2 === 0 ? "md:border-r-2" : ""} ${i < 4 ? "border-b-2" : i === 4 ? "border-b-2 md:border-b-0" : ""}`}>
              <p className="font-pixel text-[10px] text-muted-foreground">{k}</p>
              <p className="mt-3 font-term text-3xl">{v}</p>
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
      <footer className="border-t-2 border-foreground bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src={logo.url} alt="BLACKOUT" className="w-48" />
            <p className="mt-4 font-term text-xl text-muted-foreground">A Buildicy hackathon.</p>
          </div>
          <div>
            <p className="font-pixel text-[10px] text-signal">NAVIGATE</p>
            <ul className="mt-4 space-y-1 font-term text-xl text-muted-foreground">
              {NAV.map(([id, l]) => <li key={id}><a href={`#${id}`} className="hover:text-foreground">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <p className="font-pixel text-[10px] text-signal">CONNECT</p>
            <ul className="mt-4 space-y-1 font-term text-xl text-muted-foreground">
              <li>Instagram — soon</li>
              <li>LinkedIn — soon</li>
              <li>Email — soon</li>
            </ul>
          </div>
          <div>
            <p className="font-pixel text-[10px] text-signal">LEGAL</p>
            <ul className="mt-4 space-y-1 font-term text-xl text-muted-foreground">
              <li>Terms — soon</li>
              <li>Privacy — soon</li>
              <li>Refund Policy — soon</li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-border py-5 text-center font-term text-lg text-muted-foreground">
          © 2026 BUILDICY · BLACKOUT<span className="animate-blink text-signal">_</span>
        </div>
      </footer>
    </div>
  );
}
