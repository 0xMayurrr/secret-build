import React from "react";

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
    a: "Pick a pass in the Registration Passes section and hit Claim Your Pass. Registration details will be shared here as they go live.",
  },
  {
    id: "FAQ_04",
    q: "How much does it cost?",
    a: "Early Bird is ₹499 (for the first 20 members only), Builder Pass is ₹699, and Final Call is ₹799. All passes include the 12-hour hackathon experience.",
  },
  {
    id: "FAQ_05",
    q: "Can I join as a team?",
    a: "Yes! You can register solo or as a team squad of 2 to 4 members. Pricing is calculated per member.",
  },
  {
    id: "FAQ_06",
    q: "Where is the venue?",
    a: "Coimbatore, Tamil Nadu. The exact venue will be announced soon.",
  },
  {
    id: "FAQ_07",
    q: "What should I bring?",
    a: "Your laptop, charger, and an open mind. Any further instructions will be sent to registered participants.",
  },
  {
    id: "FAQ_08",
    q: "Is there a refund policy?",
    a: "The refund policy will be published before registration opens.",
  },
  {
    id: "FAQ_09",
    q: "Can you tell us the challenge?",
    a: "Nope. That's the whole point. You won't know until you show up.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="border-t-2 border-border bg-card/40 py-24 md:py-28 select-none">
      <div className="mx-auto max-w-4xl px-5">
        <div className="reveal">
          <p className="font-term text-2xl text-signal">08 // faq</p>
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
  );
}
