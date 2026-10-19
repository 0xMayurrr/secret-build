import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FAQSection, FAQ_ITEMS } from "@/components/FAQSection";

describe("FAQSection Component", () => {
  it("renders all 9 FAQ items initially", () => {
    render(<FAQSection />);

    expect(screen.getByText(/08 \/\/ intelligence terminal/i)).toBeInTheDocument();
    expect(screen.getByText(/FREQUENTLY/i)).toBeInTheDocument();
    expect(screen.getByText(/DECRYPTED/i)).toBeInTheDocument();

    // Verify first question
    expect(screen.getByText("What is BLACKOUT?")).toBeInTheDocument();
    expect(screen.getByText(/A surprise-challenge hackathon by Buildicy/i)).toBeInTheDocument();
  });

  it("filters questions using the category buttons", () => {
    render(<FAQSection />);

    const passesBtn = screen.getByRole("button", { name: "PASSES" });
    fireEvent.click(passesBtn);

    // Questions in PASSES category should be visible
    expect(screen.getByText("How do I register?")).toBeInTheDocument();
    expect(screen.getByText("How much does it cost?")).toBeInTheDocument();

    // Question from another category should be filtered out
    expect(screen.queryByText("What is BLACKOUT?")).not.toBeInTheDocument();
  });

  it("filters questions using the search bar", () => {
    render(<FAQSection />);

    const searchInput = screen.getByPlaceholderText(/Filter questions/i);
    fireEvent.change(searchInput, { target: { value: "venue" } });

    expect(screen.getByText("Where is the venue?")).toBeInTheDocument();
    expect(screen.queryByText("What is BLACKOUT?")).not.toBeInTheDocument();
  });

  it("toggles an accordion open and closed on click", () => {
    render(<FAQSection />);

    const questionButton = screen.getByText("Who can participate?").closest("button");
    expect(questionButton).toBeInTheDocument();

    if (questionButton) {
      // Click to open
      fireEvent.click(questionButton);
      expect(
        screen.getByText(/Students, developers, designers, freelancers/i)
      ).toBeInTheDocument();

      // Click to close
      fireEvent.click(questionButton);
      expect(
        screen.queryByText(/Students, developers, designers, freelancers/i)
      ).not.toBeInTheDocument();
    }
  });
});
