import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamSection } from "@/components/TeamSection";
import { TEAM_MEMBERS } from "@/components/team-data";

describe("TeamSection", () => {
  it("contains exactly 12 members in team-data", () => {
    expect(TEAM_MEMBERS).toHaveLength(12);
    expect(TEAM_MEMBERS[0].name).toBe("Karthick Mayur");
    expect(TEAM_MEMBERS[0].role).toBe("Founder & Lead Architect");
  });

  it("renders in OFF state by default showing CLASSIFIED and IDENTITY_LOCKED", () => {
    render(<TeamSection />);

    // Expect classified indicators
    const classifiedHeadings = screen.getAllByText("CLASSIFIED");
    expect(classifiedHeadings.length).toBeGreaterThan(0);

    const lockedLabels = screen.getAllByText("IDENTITY_LOCKED");
    expect(lockedLabels.length).toBeGreaterThan(0);
  });

  it("toggles to ON state revealing real member names and profiles when bulb is clicked", () => {
    render(<TeamSection />);

    // Click the hanging bulb
    const bulbButton = screen.getByTestId("hanging-bulb");
    fireEvent.click(bulbButton);

    // Real team members appear
    expect(screen.getAllByText("Karthick Mayur").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Harish Kumar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sanjay Vignesh").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Arun Prasath").length).toBeGreaterThan(0);
  });

  it("opens operative dossier modal when an illuminated card is clicked", () => {
    render(<TeamSection />);

    // Turn light on first
    const bulbButton = screen.getByTestId("hanging-bulb");
    fireEvent.click(bulbButton);

    // Click on the first member card
    const memberName = screen.getAllByText("Karthick Mayur")[0];
    fireEvent.click(memberName);

    // Modal opens with dossier info
    expect(screen.getByText(/OPERATIVE DOSSIER/i)).toBeInTheDocument();
    expect(screen.getByText(/STATUS: CONFIRMED_BUILDER/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByText("✕ ESC");
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/STATUS: CONFIRMED_BUILDER/i)).not.toBeInTheDocument();
  });

  it("toggles back to OFF state when clicked again, reverting to same as before", () => {
    render(<TeamSection />);

    const bulbButton = screen.getByTestId("hanging-bulb");
    // Turn ON
    fireEvent.click(bulbButton);
    expect(screen.getAllByText("Karthick Mayur").length).toBeGreaterThan(0);

    // Turn back OFF
    fireEvent.click(bulbButton);

    // Should show CLASSIFIED again
    const classifiedHeadings = screen.getAllByText("CLASSIFIED");
    expect(classifiedHeadings.length).toBeGreaterThan(0);

    // Profile elements have opacity-0 when light is off
    const revealedElements = screen.getAllByText("Karthick Mayur");
    revealedElements.forEach((el) => {
      expect(el.closest("div")).toHaveClass("opacity-0");
    });
  });

  it("renders 'CLICK TO REVEAL THE PEOPLE' badge and toggles light when badge is clicked", () => {
    render(<TeamSection />);

    const badge = screen.getByTestId("reveal-people-badge");
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("CLICK TO REVEAL THE PEOPLE")).toBeInTheDocument();

    // Click the badge to reveal the people
    fireEvent.click(badge);
    expect(screen.getByText("LIGHTS ON // CLICK TO DIM")).toBeInTheDocument();
    expect(screen.getAllByText("Karthick Mayur").length).toBeGreaterThan(0);
  });

  it(
    "renders manual scroll controls (PREV, NEXT, PAUSE/AUTO)",
    () => {
      render(<TeamSection />);

      expect(screen.getByRole("button", { name: /scroll left/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /scroll right/i })).toBeInTheDocument();
      const pauseBtn = screen.getByRole("button", { name: /pause auto scroll/i });
      expect(pauseBtn).toBeInTheDocument();

      // Clicking pause toggles state
      fireEvent.click(pauseBtn);
      expect(screen.getByRole("button", { name: /resume auto scroll/i })).toBeInTheDocument();
    },
    15000
  );
});

