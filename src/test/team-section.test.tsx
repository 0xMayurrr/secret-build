import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamSection } from "@/components/TeamSection";
import { TEAM_MEMBERS } from "@/components/team-data";

describe("TeamSection", () => {
  it("contains all 17 members in team-data", () => {
    expect(TEAM_MEMBERS).toHaveLength(17);
    expect(TEAM_MEMBERS[0].name).toBe("Karthick Mayur");
    expect(TEAM_MEMBERS[0].role).toBe("Founder & Lead Architect");
    expect(TEAM_MEMBERS.find((m) => m.name === "Tamil TM")?.role).toBe("Applied AI Engineer");
    expect(TEAM_MEMBERS.find((m) => m.name === "Nivethitha Ramesh")?.role).toBe("Applied AI Engineer");
    expect(TEAM_MEMBERS.find((m) => m.name === "Jamuna Rani")?.role).toBe("SDE Intern");
    expect(TEAM_MEMBERS.find((m) => m.name === "Rajeshwari M")?.role).toBe("SDE Intern");
    expect(TEAM_MEMBERS.find((m) => m.name === "Bhuvana Sree S")?.role).toBe("SDE Intern");
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
    expect(screen.getAllByText("Tamil TM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nivethitha Ramesh").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jamuna Rani").length).toBeGreaterThan(0);
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

  it("removes manual scroll buttons (PREV, NEXT, PAUSE) and supports touch-to-stop on marquee track", () => {
    render(<TeamSection />);

    // PREV, NEXT, and PAUSE buttons must not exist
    expect(screen.queryByRole("button", { name: /scroll left/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /scroll right/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pause auto scroll/i })).not.toBeInTheDocument();

    // Marquee track exists and handles touch events
    const track = screen.getByTestId("team-marquee-track");
    expect(track).toBeInTheDocument();

    fireEvent.touchStart(track, { touches: [{ pageX: 100 }] });
    fireEvent.touchEnd(track);
  });
});

