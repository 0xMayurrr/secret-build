import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamSection } from "@/components/TeamSection";
import { TEAM_MEMBERS } from "@/components/team-data";

describe("TeamSection", () => {
  it("contains all 9 members in team-data with Mayur P and Prajwal N at the helm", () => {
    expect(TEAM_MEMBERS).toHaveLength(9);
    expect(TEAM_MEMBERS[0].name).toBe("Mayur P");
    expect(TEAM_MEMBERS[0].role).toBe("Tech Mentors");
    expect(TEAM_MEMBERS[1].name).toBe("Prajwal N");
    expect(TEAM_MEMBERS[1].role).toBe("Tech Mentors");
    expect(TEAM_MEMBERS.find((m) => m.name === "Mohammed Parish Khan K")?.role).toBe("Organizers");
    expect(TEAM_MEMBERS.find((m) => m.name === "ShivaSakthivel L")?.role).toBe("Organizers");
    expect(TEAM_MEMBERS.find((m) => m.name === "Tamil TM")?.role).toBe("Organizers");
    expect(TEAM_MEMBERS.find((m) => m.name === "Nivethitha Ramesh")?.role).toBe("Organizers");
    expect(TEAM_MEMBERS.find((m) => m.name === "Jamuna Rani")?.role).toBe("Organizers");
    expect(TEAM_MEMBERS.find((m) => m.name === "Rajeshwari M")?.role).toBe("Organizers");
    expect(TEAM_MEMBERS.find((m) => m.name === "Bhuvana Sree S")?.role).toBe("Organizers");
  });

  it("renders in OFF state by default showing CLASSIFIED profiles", () => {
    render(<TeamSection />);

    // Shows CLASSIFIED by default when light is off
    expect(screen.getAllByText("CLASSIFIED").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/role: revealing soon/i).length).toBeGreaterThan(0);

    // Profile elements have opacity-0 when light is off
    const revealedElements = screen.getAllByText("Mayur P");
    revealedElements.forEach((el) => {
      expect(el.closest("div")?.className).toContain("opacity-0");
    });
  });

  it("toggles to ON state when bulb is clicked and back to OFF", () => {
    render(<TeamSection />);

    // Click hanging bulb to turn ON
    const bulbButton = screen.getByTestId("hanging-bulb");
    fireEvent.click(bulbButton);

    // Profile elements have opacity-100 when light is on
    const revealedElements = screen.getAllByText("Mayur P");
    revealedElements.forEach((el) => {
      expect(el.closest("div")?.className).toContain("opacity-100");
    });

    // Click hanging bulb to turn back OFF
    fireEvent.click(bulbButton);
    revealedElements.forEach((el) => {
      expect(el.closest("div")?.className).toContain("opacity-0");
    });
  });

  it("opens operative dossier modal when an illuminated card is clicked", () => {
    render(<TeamSection />);

    // Turn ON light first
    const bulbButton = screen.getByTestId("hanging-bulb");
    fireEvent.click(bulbButton);

    // Click on the first member card
    const memberName = screen.getAllByText("Mayur P")[0];
    fireEvent.click(memberName);

    // Modal opens with dossier info
    expect(screen.getByText(/OPERATIVE DOSSIER/i)).toBeInTheDocument();
    expect(screen.getByText(/STATUS: CONFIRMED_BUILDER/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByText("✕ ESC");
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/STATUS: CONFIRMED_BUILDER/i)).not.toBeInTheDocument();
  });

  it("removes 'CLICK TO REVEAL THE PEOPLE' badge and 'CLICK TO REVEAL' button", () => {
    render(<TeamSection />);

    expect(screen.queryByTestId("reveal-people-badge")).not.toBeInTheDocument();
    expect(screen.queryByText("CLICK TO REVEAL THE PEOPLE")).not.toBeInTheDocument();
    expect(screen.queryByText("CLICK TO REVEAL")).not.toBeInTheDocument();
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

