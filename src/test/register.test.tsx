import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegisterPage } from "@/routes/register";
import { saveRegistration, type RegistrationRecord } from "@/lib/supabase";
import { BlackoutPassCard } from "@/components/BlackoutPassCard";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to, href, ...props }: { children: React.ReactNode; to?: string; href?: string }) => (
      <a href={to || href} {...props}>
        {children}
      </a>
    ),
  };
});

describe("Registration Page & Supabase Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders pass selection tiers in step 1", () => {
    render(<RegisterPage />);

    expect(screen.getByText(/SELECT YOUR/i)).toBeInTheDocument();
    expect(screen.getByText("EARLY BIRD")).toBeInTheDocument();
    expect(screen.getAllByText("BUILDER PASS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("FINAL CALL").length).toBeGreaterThanOrEqual(1);
  });

  it("toggles between solo and team squad participation mode and updates pricing", () => {
    render(<RegisterPage />);

    const teamButton = screen.getByText(/TEAM SQUAD/i).closest("button");
    expect(teamButton).toBeInTheDocument();

    if (teamButton) {
      fireEvent.click(teamButton);
      expect(screen.getByText(/SQUAD SIZE:/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /2 BUILDERS/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /3 BUILDERS/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /4 BUILDERS/i })).toBeInTheDocument();

      // Click 3 Builders
      fireEvent.click(screen.getByRole("button", { name: /3 BUILDERS/i }));

      // With default EARLY BIRD (₹499), 3 builders should equal ₹1497
      expect(screen.getByText(/TOTAL/i)).toBeInTheDocument();
      expect(screen.getAllByText("₹1497").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/CONTINUE TO DETAILS \(₹1497\)/i)).toBeInTheDocument();

      // Attempting to click locked BUILDER PASS should not select it
      fireEvent.click(screen.getAllByText("BUILDER PASS")[0]);
      expect(screen.getAllByText("₹1497").length).toBeGreaterThanOrEqual(1);
    }
  });

  it("locks BUILDER PASS and FINAL CALL with chain and padlock overlay", () => {
    render(<RegisterPage />);

    expect(screen.getAllByText(/TIER LOCKED \/\/ SEALED/i).length).toBe(2);
    expect(screen.getAllByText(/LOCKED \/\/ SEALED/i).length).toBeGreaterThanOrEqual(2);
  });

  it("navigates from pass selection to hacker details step", () => {
    render(<RegisterPage />);

    const continueBtn = screen.getByText(/CONTINUE TO DETAILS/i);
    fireEvent.click(continueBtn);

    expect(screen.getByText("HACKER DETAILS")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Karthick Mayur/i)).toBeInTheDocument();
  });

  it("validates required fields before proceeding to payment step", () => {
    render(<RegisterPage />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText(/CONTINUE TO DETAILS/i));

    // Try proceeding with empty fields
    const toPaymentBtn = screen.getByText(/PROCEED TO PAYMENT/i);
    fireEvent.click(toPaymentBtn);

    // Validation error should show
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
  });

  it("proceeds to UPI payment step after filling valid details", () => {
    render(<RegisterPage />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText(/CONTINUE TO DETAILS/i));

    // Fill form inputs
    fireEvent.change(screen.getByPlaceholderText(/Karthick Mayur/i), { target: { value: "Linus Hacker" } });
    fireEvent.change(screen.getByPlaceholderText(/karthick@buildicy.com/i), { target: { value: "linus@buildicy.com" } });
    fireEvent.change(screen.getByPlaceholderText(/98765 43210/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText(/PSG Tech/i), { target: { value: "MIT Coimbatore" } });

    // Step 2 -> Step 3
    fireEvent.click(screen.getByText(/PROCEED TO PAYMENT/i));

    // Step 3 should now be visible
    expect(screen.getByText("UPI PAYMENT")).toBeInTheDocument();
    expect(screen.getByText(/SCAN & PAY/i)).toBeInTheDocument();
    expect(screen.getByAltText(/9843315832@superyes/i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL DUE: ₹499/i)).toBeInTheDocument();
  });

  it("saves registration records cleanly to storage / supabase fallback", async () => {
    const testRecord: RegistrationRecord = {
      registration_id: "BLK-2026-TEST99",
      pass_name: "BUILDER PASS",
      pass_price: 699,
      participation_type: "solo",
      team_size: 1,
      total_price: 699,
      full_name: "Linus Hacker",
      email: "linus@buildicy.com",
      phone: "+91 9876543210",
      organization: "MIT Coimbatore",
      utr_number: "123456789012",
      status: "pending_verification",
    };

    const res = await saveRegistration(testRecord);
    expect(res.success).toBe(true);

    const saved = JSON.parse(localStorage.getItem("blackout_registrations") || "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0].registration_id).toBe("BLK-2026-TEST99");
    expect(saved[0].full_name).toBe("Linus Hacker");
    expect(saved[0].total_price).toBe(699);
  });

  it("renders the Welcome to the Blackout creative pass card with hologram and details", () => {
    const testRecord: RegistrationRecord = {
      registration_id: "BLK-2026-ALPHA1",
      pass_name: "BUILDER PASS",
      pass_price: 699,
      participation_type: "team",
      team_size: 3,
      total_price: 2097,
      team_name: "CYBER_NOMADS",
      team_members: ["Ada", "Grace"],
      full_name: "Linus Hacker",
      email: "linus@buildicy.com",
      phone: "+91 9876543210",
      organization: "MIT Coimbatore",
      utr_number: "123456789012",
      tshirt_size: "XL",
      status: "pending_verification",
    };

    render(<BlackoutPassCard record={testRecord} />);

    expect(screen.getByText(/WELCOME TO/i)).toBeInTheDocument();
    expect(screen.getByText(/THE BLACKOUT\./i)).toBeInTheDocument();
    expect(screen.getByText("Linus Hacker")).toBeInTheDocument();
    expect(screen.getByText("BLK-2026-ALPHA1")).toBeInTheDocument();
    expect(screen.getByText("BUILDER PASS")).toBeInTheDocument();
    expect(screen.getByText(/SQUAD: CYBER_NOMADS/i)).toBeInTheDocument();
    expect(screen.getByText(/PAID: ₹2097/i)).toBeInTheDocument();
    expect(screen.getByText("SAVE PASS AS IMAGE (PNG)")).toBeInTheDocument();
    expect(screen.getByText("COPY POST CAPTION")).toBeInTheDocument();
    expect(screen.getByText("LINKEDIN")).toBeInTheDocument();
    expect(screen.getByText("WHATSAPP")).toBeInTheDocument();
  });

  it("renders detailed profile forms for every squad member in team mode", () => {
    render(<RegisterPage />);

    // Switch to TEAM mode
    fireEvent.click(screen.getByText("TEAM SQUAD"));

    // Advance to Step 2
    fireEvent.click(screen.getByText(/CONTINUE TO DETAILS/i));

    // Squad meta & Operative 01 (Lead)
    expect(screen.getByText(/SQUAD REGISTRATION/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. ZeroDay Hustlers/i)).toBeInTheDocument();
    expect(screen.getByText(/OPERATIVE 01 \/\/ SQUAD LEAD/i)).toBeInTheDocument();

    // Operative 02 (Teammate)
    expect(screen.getByText(/OPERATIVE 02 \/\/ SQUAD TEAMMATE/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Teammate 2 Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/teammate2@buildicy\.com/i)).toBeInTheDocument();
  });
});


