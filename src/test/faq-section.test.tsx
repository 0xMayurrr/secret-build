import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FAQSection, FAQ_ITEMS } from "@/components/FAQSection";

describe("FAQSection Component", () => {
  it("renders all 9 FAQ items in minimalistic accordion format", () => {
    render(<FAQSection />);

    expect(screen.getByText(/08 \/\/ faq/i)).toBeInTheDocument();
    expect(screen.getByText("Questions?")).toBeInTheDocument();

    // Verify all 9 questions
    expect(FAQ_ITEMS).toHaveLength(9);
    FAQ_ITEMS.forEach((item) => {
      expect(screen.getByText(item.q)).toBeInTheDocument();
      expect(screen.getByText(item.a)).toBeInTheDocument();
    });
  });

  it("renders native details and summary elements for each question", () => {
    const { container } = render(<FAQSection />);

    const detailsElements = container.querySelectorAll("details");
    expect(detailsElements.length).toBe(9);

    const summaryElements = container.querySelectorAll("summary");
    expect(summaryElements.length).toBe(9);
  });
});
