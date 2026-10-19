import React, { useState, useMemo } from "react";
import { Search, ChevronDown, MessageSquare, Mail, Terminal } from "lucide-react";

export interface FAQItem {
  id: string;
  category: "ALL" | "GENERAL" | "PASSES" | "LOGISTICS" | "MYSTERY";
  tag: string;
  q: string;
  a: string;
  highlight?: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "FAQ_01",
    category: "GENERAL",
    tag: "ABOUT",
    q: "What is BLACKOUT?",
    a: "A surprise-challenge hackathon by Buildicy. The problem statement stays sealed until the event begins — you discover it when you arrive.",
    highlight: "Zero brief. You discover the challenge live on the arena floor.",
  },
  {
    id: "FAQ_02",
    category: "GENERAL",
    tag: "ELIGIBILITY",
    q: "Who can participate?",
    a: "Students, developers, designers, freelancers, professionals, founders — anyone passionate about building and innovation.",
    highlight: "Open to all disciplines and skill levels.",
  },
  {
    id: "FAQ_03",
    category: "PASSES",
    tag: "REGISTRATION",
    q: "How do I register?",
    a: "Pick a pass in the Registration Passes section and hit Claim Your Pass. Registration details will be shared here as they go live.",
    highlight: "Direct pass booking via our secure gateway.",
  },
  {
    id: "FAQ_04",
    category: "PASSES",
    tag: "TIERS & PRICING",
    q: "How much does it cost?",
    a: "Early Bird is ₹499 (for the first 20 members only), Builder Pass is ₹699, and Final Call is ₹799. All passes include the exact same full experience.",
    highlight: "Passes include 12-hr arena access, food, power, and high-speed Wi-Fi.",
  },
  {
    id: "FAQ_05",
    category: "GENERAL",
    tag: "SQUADS",
    q: "Can I join as a team?",
    a: "Yes! You can register solo or as a team squad of 2 to 4 members. The total amount is calculated per member.",
    highlight: "Teams of 2 to 4 members or solo infiltrators.",
  },
  {
    id: "FAQ_06",
    category: "LOGISTICS",
    tag: "COORDINATES",
    q: "Where is the venue?",
    a: "Coimbatore, Tamil Nadu. The exact venue will be announced soon.",
    highlight: "Premium tech arena in Coimbatore with full power redundancy.",
  },
  {
    id: "FAQ_07",
    category: "LOGISTICS",
    tag: "HARDWARE",
    q: "What should I bring?",
    a: "Your laptop, charger, and an open mind. Any further instructions will be sent to registered participants.",
    highlight: "Hardware, monitors, and IoT devices are welcomed.",
  },
  {
    id: "FAQ_08",
    category: "PASSES",
    tag: "POLICY",
    q: "Is there a refund policy?",
    a: "The refund policy will be published before registration opens.",
    highlight: "Transparent ticket cancellation and transfer terms.",
  },
  {
    id: "FAQ_09",
    category: "MYSTERY",
    tag: "CLASSIFIED",
    q: "Can you tell us the challenge?",
    a: "Nope. That's the whole point. You won't know until you show up.",
    highlight: "Strict zero-knowledge seal maintained by the core team.",
  },
];

type CategoryFilter = "ALL" | "GENERAL" | "PASSES" | "LOGISTICS" | "MYSTERY";

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["FAQ_01"]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "ALL" || item.category === activeCategory;
      const matchesSearch =
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="faq" className="scroll-mt-28 border-t-2 border-border bg-card/40 py-20 sm:py-28 select-none">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* SECTION HEADER */}
        <div className="reveal">
          <div className="flex items-center gap-2">
            <span className="font-term text-xl sm:text-2xl text-signal">
              08 // intelligence terminal
            </span>
            <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
          </div>

          <h2 className="mt-3 font-pixel text-2xl leading-relaxed md:text-4xl text-foreground">
            FREQUENTLY{" "}
            <span className="text-primary drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              DECRYPTED.
            </span>
          </h2>
          <p className="mt-2 font-term text-lg sm:text-xl text-muted-foreground">
            Everything you need to know before the blackout initiates.
          </p>
        </div>

        {/* INTERACTIVE CONTROLS BAR: Category Filter & Search Box */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 font-pixel text-[9px] sm:text-[10px]">
            {(
              [
                ["ALL", `ALL (${FAQ_ITEMS.length})`],
                ["GENERAL", "GENERAL"],
                ["PASSES", "PASSES"],
                ["LOGISTICS", "LOGISTICS"],
                ["MYSTERY", "THE MYSTERY"],
              ] as [CategoryFilter, string][]
            ).map(([cat, label]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 transition-all active:scale-95 border ${
                  activeCategory === cat
                    ? "border-primary bg-primary text-primary-foreground font-bold shadow-[3px_3px_0_0_var(--signal)]"
                    : "border-border/60 bg-background text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-border/70 bg-background/80 pl-9 pr-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* ACCORDION ITEMS CONTAINER */}
        <div className="mt-6 space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="border-2 border-dashed border-border p-8 text-center bg-background/50">
              <p className="font-pixel text-xs text-signal">
                NO ENCRYPTED MATCHES FOUND
              </p>
              <p className="mt-2 font-term text-lg text-muted-foreground">
                Try querying a different term or clear your filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("ALL");
                }}
                className="mt-4 border border-primary px-3 py-1 font-pixel text-[9px] text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`group relative border-2 transition-all duration-200 bg-background overflow-hidden ${
                    isOpen
                      ? "border-primary shadow-[6px_6px_0_0_var(--primary)]"
                      : "border-border hover:border-foreground/60 shadow-[3px_3px_0_0_rgba(0,0,0,0.5)]"
                  }`}
                >
                  {/* Accordion Question Trigger Bar */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      {/* Terminal ID tag */}
                      <span className="font-pixel text-[9px] sm:text-[10px] text-primary shrink-0 border border-primary/40 bg-primary/10 px-2 py-0.5">
                        {item.id}
                      </span>

                      {/* Tag pill */}
                      <span className="hidden sm:inline-block font-mono text-[10px] text-muted-foreground shrink-0 border border-border px-1.5 py-0.5 bg-card/60">
                        {item.tag}
                      </span>

                      {/* Question Text */}
                      <span className="font-term text-xl sm:text-2xl text-foreground group-hover:text-signal transition-colors leading-tight">
                        {item.q}
                      </span>
                    </div>

                    {/* Expand/Collapse Chevron Indicator */}
                    <div
                      className={`flex items-center justify-center h-7 w-7 rounded-sm border shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "border-primary bg-primary text-primary-foreground rotate-180"
                          : "border-border/80 bg-card text-muted-foreground group-hover:border-primary group-hover:text-primary"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Accordion Answer Content Drawer */}
                  {isOpen && (
                    <div className="border-t border-border/50 bg-card/30 p-4 sm:p-5 animate-fade-in">
                      <div className="flex items-center gap-2 mb-2 font-pixel text-[9px] text-signal">
                        <Terminal className="h-3 w-3" />
                        <span>DECLASSIFIED_INTEL // ACCESS GRANTED</span>
                      </div>

                      <p className="font-sans text-sm sm:text-base text-foreground/90 leading-relaxed pl-1 sm:pl-2 border-l-2 border-signal/60">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM CALLOUT: TRANSMISSION DESK */}
        <div className="mt-12 rounded-sm border-2 border-border bg-background/90 p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,0.8)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-pixel text-[10px] text-signal uppercase tracking-wider">
                TRANSMISSION DESK OPEN // STILL HAVE INQUIRIES?
              </p>
              <p className="mt-1 font-term text-lg text-muted-foreground">
                Our squad responds rapidly across Discord and official lines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:contact@buildicy.com"
                className="flex items-center gap-2 border-2 border-foreground bg-card px-3.5 py-1.5 font-pixel text-[9px] text-foreground hover:border-primary hover:text-primary transition active:scale-95"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>EMAIL ORG</span>
              </a>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border-2 border-primary bg-primary px-3.5 py-1.5 font-pixel text-[9px] text-primary-foreground hover:bg-signal hover:text-black hover:border-signal transition active:scale-95"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>DISCORD WAR ROOM</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
