import React, { useEffect, useState, useRef } from "react";

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "FAQ_01",
    q: "What is BLACKOUT?",
    a: "A surprise-challenge hackathon by Buildicy. The problem statement stays sealed until the event begins — you discover it when you arrive.",
  },
  {
    id: "FAQ_02",
    q: "Who can participate?",
    a: "Students, developers, designers, freelancers, professionals, founders — anyone passionate about building and innovation.",
  },
  {
    id: "FAQ_03",
    q: "How do I register?",
    a: "Pick a pass in the Registration Passes section and hit Claim Your Pass. Complete your details and submit payment proof to secure your slot.",
  },
  {
    id: "FAQ_04",
    q: "How much does it cost?",
    a: "The BLACKOUT Builder Pass is ₹799 per participant. All passes include the full 12-hour hackathon experience.",
  },
  {
    id: "FAQ_05",
    q: "Can I join as a team?",
    a: "Yes! You can register solo or as a team squad of 2 to 4 members. Pricing is calculated per member.",
  },
  {
    id: "FAQ_06",
    q: "Where is the venue?",
    a: "Coimbatore, Tamil Nadu. The exact venue will be announced to registered participants soon.",
  },
  {
    id: "FAQ_07",
    q: "What should I bring?",
    a: "Your laptop, charger, and an open mind. Any further instructions will be sent to registered participants.",
  },
  {
    id: "FAQ_08",
    q: "What is the refund policy?",
    a: "Passes are non-refundable once registered. If you are unable to attend, you may transfer your pass to another eligible participant by contacting us at buildicy@gmail.com at least 48 hours before the event. In the unlikely event that BLACKOUT is cancelled by the organizers, a full refund will be issued to all registered participants within 7 working days.",
  },
  {
    id: "FAQ_09",
    q: "Can you tell us the challenge?",
    a: "Nope. That's the whole point. You won't know until you show up.",
  },
];

const WHY_PATHS = [
  {
    code: "PATH_01",
    role: "STUDENT",
    glyph: "◈",
    accent: "#a855f7",
    headline: "Your resume just got real.",
    perks: [
      "₹1,500 AI Tools Accelerator — free with your pass",
      "Internship consideration based on your build",
      "Mentorship from industry builders on the day",
      "Official BLACKOUT certificate + hacker kit",
    ],
    tag: "INTERNSHIP_ELIGIBLE",
  },
  {
    code: "PATH_02",
    role: "DEVELOPER",
    glyph: "⌘",
    accent: "#22c55e",
    headline: "12 hours. Unknown problem. Ship it.",
    perks: [
      "₹1,500 AI Tools Accelerator — free with your pass",
      "Project & startup collaboration opportunities",
      "Build with sharp devs outside your usual circle",
      "Official BLACKOUT certificate + hacker kit",
    ],
    tag: "COLLAB_READY",
  },
  {
    code: "PATH_03",
    role: "PROFESSIONAL",
    glyph: "◆",
    accent: "#a855f7",
    headline: "Network. Build. Get noticed.",
    perks: [
      "₹1,500 AI Tools Accelerator — free with your pass",
      "Venture & product partnership opportunities",
      "Connect with founders, devs & student builders",
      "Official BLACKOUT certificate + hacker kit",
    ],
    tag: "VENTURE_ACCESS",
  },
];

// Phase: "enter" → slides in from right
//        "hold"  → stopped, visible for 5s
//        "exit"  → blasts out to left at thunder speed
const ENTER_MS = 600;
const HOLD_MS = 5000;
const EXIT_MS = 160;

function WhyMarquee() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef<number>(0);

  useEffect(() => {
    if (paused) return;
    const clear = () => { if (timerRef.current) clearTimeout(timerRef.current); };
    if (phase === "enter") {
      clear(); timerRef.current = setTimeout(() => setPhase("hold"), ENTER_MS);
    } else if (phase === "hold") {
      clear(); timerRef.current = setTimeout(() => setPhase("exit"), HOLD_MS);
    } else if (phase === "exit") {
      clear(); timerRef.current = setTimeout(() => { setIndex((i) => (i + 1) % WHY_PATHS.length); setPhase("enter"); }, EXIT_MS);
    }
    return clear;
  }, [phase, paused]);

  const handlePressStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    holdStartRef.current = Date.now();
    setPaused(true);
  };

  const handlePressEnd = () => {
    setPaused(false);
  };

  const card = WHY_PATHS[index];
  const tx = phase === "exit" ? "translateX(-130%)" : "translateX(0%)";

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      style={{ cursor: paused ? "grab" : "default", userSelect: "none" }}
    >
      <div
        key={`${index}-mount`}
        style={{
          transform: phase === "enter" ? "translateX(110%)" : tx,
          transition: phase === "enter"
            ? `transform ${ENTER_MS}ms cubic-bezier(0.22,1,0.36,1)`
            : phase === "exit"
            ? `transform ${EXIT_MS}ms cubic-bezier(0.55,0,1,0.45)`
            : "none",
          willChange: "transform",
        }}
        ref={(el) => { if (el && phase === "enter") requestAnimationFrame(() => { el.style.transform = "translateX(0%)"; }); }}
      >
        {/* CARD */}
        <div
          className="relative border-2 bg-[#08020e] p-3 sm:p-6"
          style={{ borderColor: card.accent, boxShadow: `4px 4px 0 0 ${card.accent}40, 0 0 24px ${card.accent}15` }}
        >
          {/* corner dots — only on sm+ */}
          <div className="hidden sm:block absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2" style={{ borderColor: card.accent }} />
          <div className="hidden sm:block absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2" style={{ borderColor: card.accent }} />
          <div className="hidden sm:block absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2" style={{ borderColor: card.accent }} />
          <div className="hidden sm:block absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2" style={{ borderColor: card.accent }} />

          {/* header row */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[8px] tracking-widest" style={{ color: card.accent }}>{card.code}</span>
              <span className="font-pixel text-[8px] border px-1.5 py-0.5" style={{ color: card.accent, borderColor: `${card.accent}50`, background: `${card.accent}10` }}>{card.role}</span>
            </div>
            <span className="font-pixel text-lg sm:text-2xl" style={{ color: card.accent, textShadow: `0 0 12px ${card.accent}` }}>{card.glyph}</span>
          </div>

          {/* headline */}
          <h3 className="font-pixel text-xs sm:text-lg text-foreground leading-snug mb-2 sm:mb-4">{card.headline}</h3>

          {/* perks — 2 col on mobile */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 sm:gap-y-2">
            {card.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-1.5 font-mono text-[10px] sm:text-xs text-muted-foreground">
                <span className="shrink-0 font-bold" style={{ color: card.accent }}>▸</span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          {/* footer */}
          <div className="mt-3 sm:mt-5 flex items-center gap-2">
            <div className="flex-1 h-px bg-border/30 overflow-hidden">
              <div className="h-full" style={{ background: card.accent, width: phase === "hold" && !paused ? "100%" : "0%", transition: phase === "hold" && !paused ? `width ${HOLD_MS}ms linear` : "none" }} />
            </div>
            <div className="flex items-center gap-1.5">
              {paused && (
                <span className="font-pixel text-[8px] tracking-widest animate-pulse" style={{ color: card.accent }}>HOLD</span>
              )}
              {WHY_PATHS.map((_, i) => (
                <div key={i} className="h-1 rounded-full transition-all duration-300" style={{ width: i === index ? "12px" : "4px", background: i === index ? card.accent : "#333" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  return (
    <>
      {/* WHY PARTICIPATE */}
      <section className="border-t-2 border-border bg-background py-24 md:py-28 select-none overflow-hidden">
        <div className="mx-auto max-w-6xl px-5">
          <div className="reveal mb-12">
            <p className="font-term text-2xl text-signal">08 // why_participate</p>
            <h2 className="mt-4 font-pixel text-2xl leading-relaxed md:text-4xl text-foreground">
              Why show up?
            </h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              &gt; Doesn't matter where you're from. If you build, this is for you.
            </p>
          </div>

          <WhyMarquee />

          {/* CASH PRIZE STANDALONE BOX */}
          <div className="reveal mt-6 relative border-2 border-[#facc15] bg-[#08020e] overflow-hidden"
            style={{ boxShadow: "4px 4px 0 0 #facc1540, 0 0 30px #facc1515" }}
          >
            <div className="absolute inset-y-0 left-0 w-0.5 sm:w-1 bg-[#facc15]" style={{ boxShadow: "0 0 12px #facc15" }} />
            <div className="flex items-center justify-between gap-3 pl-4 pr-3 py-3 sm:pl-8 sm:pr-6 sm:py-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="font-pixel text-2xl sm:text-4xl font-bold leading-none shrink-0" style={{ color: "#facc15", textShadow: "0 0 20px #facc15" }}>₿</span>
                <div>
                  <p className="font-pixel text-[7px] sm:text-[9px] tracking-widest text-[#facc15] mb-0.5">WINNER_BOUNTY</p>
                  <p className="font-pixel text-base sm:text-2xl text-white leading-none">CASH PRIZE</p>
                  <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-0.5">&gt; Top team walks away with real money.</p>
                </div>
              </div>
              <div className="border border-[#facc15] px-2 py-1 sm:px-4 sm:py-2 font-pixel text-[7px] sm:text-[9px] text-[#facc15] tracking-widest whitespace-nowrap shrink-0" style={{ background: "#facc1510" }}>
                REVEALED AT EVENT ▶
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t-2 border-border bg-card/40 py-24 md:py-28 select-none">
        <div className="mx-auto max-w-4xl px-5">
          <div className="reveal">
            <p className="font-term text-2xl text-signal">09 // faq</p>
            <h2 className="mt-4 font-pixel text-2xl leading-relaxed md:text-4xl text-foreground">
              Questions?
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.id}
                className="reveal group border-2 border-border bg-background open:border-primary transition"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-term text-2xl hover:text-primary transition-colors">
                  <span>{item.q}</span>
                  <span className="font-pixel text-sm text-primary transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-muted-foreground font-mono text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
