import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Footer } from "@/components/Footer";

describe("Footer Component", () => {
  it("renders social links and status bar", () => {
    render(<Footer />);

    expect(screen.getByText(/LIVE ARENA \/\/ NOV 28, 2026/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Twitter / X")).toBeInTheDocument();
    expect(screen.getByLabelText("Discord")).toBeInTheDocument();
  });

  it("renders BLACKOUT logo initially and toggles to BUILDICY logo", () => {
    render(<Footer />);

    // Initially BLACKOUT logo is displayed
    expect(screen.getByAltText("BLACKOUT")).toBeInTheDocument();
    expect(screen.getByText(/An 8-hour surprise-challenge hackathon/i)).toBeInTheDocument();

    // Click the Buildicy dot to switch to Buildicy
    const buildicyDot = screen.getByTitle("View Buildicy");
    fireEvent.click(buildicyDot);

    // Buildicy logo and branding should now be rendered
    expect(screen.getByAltText("Buildicy")).toBeInTheDocument();
    expect(screen.getByText(/builders_first_ecosystem/i)).toBeInTheDocument();
  });

  it("renders navigation and copyright information", () => {
    render(<Footer />);

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Passes")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText(/© 2026 Buildicy/i)).toBeInTheDocument();
    expect(screen.getByText(/contact@buildicy.com/i)).toBeInTheDocument();
  });
});
