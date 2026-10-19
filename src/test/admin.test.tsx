import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  saveRegistration,
  getAllRegistrations,
  getRegistrationByIdOrToken,
  markAttendance,
  undoAttendance,
  type RegistrationRecord,
} from "@/lib/supabase";
import { AdminDeskPage } from "@/routes/admin";

let memoryRegistrations: RegistrationRecord[] = [];

vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return {
    ...actual,
    saveRegistration: vi.fn(async (record: RegistrationRecord) => {
      memoryRegistrations = [record, ...memoryRegistrations.filter((r) => r.registration_id !== record.registration_id)];
      return { success: true, data: record };
    }),
    getAllRegistrations: vi.fn(async () => {
      return [...memoryRegistrations];
    }),
    getRegistrationByIdOrToken: vi.fn(async (tokenOrId: string) => {
      return memoryRegistrations.find((r) => r.registration_id === tokenOrId || r.check_in_token === tokenOrId) || null;
    }),
    markAttendance: vi.fn(async (tokenOrId: string, checkedInBy: string = "Admin Desk") => {
      const idx = memoryRegistrations.findIndex((r) => r.registration_id === tokenOrId || r.check_in_token === tokenOrId);
      if (idx === -1) return { success: false, error: "Not found" };
      const updated = {
        ...memoryRegistrations[idx],
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: checkedInBy,
      };
      memoryRegistrations[idx] = updated;
      return { success: true, record: updated, data: updated };
    }),
    undoAttendance: vi.fn(async (registrationId: string) => {
      const idx = memoryRegistrations.findIndex((r) => r.registration_id === registrationId);
      if (idx === -1) return { success: false, error: "Not found" };
      const updated = {
        ...memoryRegistrations[idx],
        checked_in: false,
        checked_in_at: null,
        checked_in_by: null,
      };
      memoryRegistrations[idx] = updated;
      return { success: true, record: updated, data: updated };
    }),
  };
});

describe("Admin Registration Desk & QR Check-in System", () => {
  const mockRegistration: RegistrationRecord = {
    registration_id: "BLK-2026-TEST01",
    pass_name: "CYBER EARLY BIRD",
    pass_price: 499,
    participation_type: "team",
    team_size: 3,
    total_price: 1497,
    full_name: "Ada Lovelace",
    email: "ada@analytical.engine",
    phone: "+91 9999888877",
    organization: "Babbage Labs",
    tshirt_size: "M",
    team_name: "ALGORITHM_ONE",
    team_members: ["Charles Babbage", "Lord Byron"],
    utr_number: "987654321098",
    payment_proof_url: "data:image/png;base64,mockproof",
    qr_code_data: "BLACKOUT_PASS|BLK-2026-TEST01|Ada Lovelace|CYBER EARLY BIRD|3",
    check_in_token: "BLK-2026-TEST01",
    checked_in: false,
    checked_in_at: null,
    checked_in_by: null,
    status: "verified",
    created_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    localStorage.clear();
    memoryRegistrations = [{ ...mockRegistration, checked_in: false, checked_in_at: null, checked_in_by: null }];
  });

  it("retrieves registration by unique registration ID or check-in token", async () => {
    const foundById = await getRegistrationByIdOrToken("BLK-2026-TEST01");
    expect(foundById).not.toBeNull();
    expect(foundById?.full_name).toBe("Ada Lovelace");
    expect(foundById?.checked_in).toBe(false);

    const foundByToken = await getRegistrationByIdOrToken("BLK-2026-TEST01");
    expect(foundByToken?.registration_id).toBe("BLK-2026-TEST01");
  });

  it("marks attendance and updates database status correctly", async () => {
    const checkInResult = await markAttendance("BLK-2026-TEST01", "Gate Alpha Desk");
    expect(checkInResult.success).toBe(true);
    expect(checkInResult.record?.checked_in).toBe(true);
    expect(checkInResult.record?.checked_in_by).toBe("Gate Alpha Desk");
    expect(checkInResult.record?.checked_in_at).toBeTruthy();

    // Verify persisted state in storage
    const verified = await getRegistrationByIdOrToken("BLK-2026-TEST01");
    expect(verified?.checked_in).toBe(true);
    expect(verified?.checked_in_by).toBe("Gate Alpha Desk");
  });

  it("supports undoing attendance in case of accidental desk scans", async () => {
    await markAttendance("BLK-2026-TEST01", "Gate Alpha Desk");
    const checkInRecord = await getRegistrationByIdOrToken("BLK-2026-TEST01");
    expect(checkInRecord?.checked_in).toBe(true);

    const undoResult = await undoAttendance("BLK-2026-TEST01");
    expect(undoResult.success).toBe(true);

    const revertedRecord = await getRegistrationByIdOrToken("BLK-2026-TEST01");
    expect(revertedRecord?.checked_in).toBe(false);
    expect(revertedRecord?.checked_in_at).toBeNull();
  });

  it("renders Admin Desk page with camera scanner controls and stats deck", async () => {
    render(<AdminDeskPage />);

    // Header & Badge
    expect(screen.getByText("REGISTRATION DESK")).toBeInTheDocument();
    expect(screen.getByText("LIVE CHECK-IN & ATTENDANCE")).toBeInTheDocument();

    // Scanning action buttons
    expect(screen.getByText("MOBILE CAMERA QR SCANNER")).toBeInTheDocument();
    expect(screen.getByText("START CAMERA SCANNER")).toBeInTheDocument();

    // Stats deck
    expect(screen.getByText(/TOTAL REGISTERED/i)).toBeInTheDocument();
    expect(screen.getByText(/CHECKED IN/i)).toBeInTheDocument();
    expect(screen.getByText(/PENDING ADMITTANCE/i)).toBeInTheDocument();

    // Roster and Search
    expect(screen.getByPlaceholderText(/Search by operative name/i)).toBeInTheDocument();

    // Wait for attendee to be loaded from local storage
    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
      expect(screen.getByText("BLK-2026-TEST01")).toBeInTheDocument();
      expect(screen.getByText("M")).toBeInTheDocument();
    });
  });

  it("filters attendees by status tabs (ALL, PRESENT, PENDING)", async () => {
    render(<AdminDeskPage />);

    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });

    // Check PENDING tab
    const pendingTab = screen.getByRole("button", { name: /PENDING/i });
    fireEvent.click(pendingTab);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    // Check PRESENT tab (Ada is currently pending, not present)
    const presentTab = screen.getByRole("button", { name: /PRESENT/i });
    fireEvent.click(presentTab);
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getByText(/No operatives found matching filter criteria/i)).toBeInTheDocument();
  });

  it("renders authentication gateway when locked and allows switching between Passkey and Supabase login", () => {
    render(<AdminDeskPage initialAuth={false} />);

    expect(screen.getByText("BLACKOUT 2026 // ADMIN GATEWAY")).toBeInTheDocument();
    expect(screen.getByText("EVENT PASSKEY")).toBeInTheDocument();
    expect(screen.getByText("SUPABASE LOGIN")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter event passkey/i)).toBeInTheDocument();

    // Switch to Supabase login tab
    const supabaseTab = screen.getByRole("button", { name: /SUPABASE LOGIN/i });
    fireEvent.click(supabaseTab);
    expect(screen.getByPlaceholderText(/organizer@blackout.hackathon/i)).toBeInTheDocument();
  });

  it("unlocks admin terminal when valid event passkey is submitted", async () => {
    render(<AdminDeskPage initialAuth={false} />);

    const passkeyInput = screen.getByPlaceholderText(/Enter event passkey/i);
    fireEvent.change(passkeyInput, { target: { value: "BLACKOUT@DESK2026" } });

    const unlockBtn = screen.getByRole("button", { name: /VERIFY PASSKEY & ENTER DESK/i });
    fireEvent.click(unlockBtn);

    await waitFor(() => {
      expect(screen.getByText("REGISTRATION DESK")).toBeInTheDocument();
      expect(screen.getByText("LIVE CHECK-IN & ATTENDANCE")).toBeInTheDocument();
    });
  });

  it("renders dashboard operational KPIs, swag dispatch tracker, and verifies revenue card is removed", async () => {
    render(<AdminDeskPage />);

    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });

    // Verify operational dashboard KPI cards
    expect(screen.getByText(/TOTAL REGISTERED/i)).toBeInTheDocument();
    expect(screen.getByText(/CHECKED IN/i)).toBeInTheDocument();
    expect(screen.getByText(/PENDING ADMITTANCE/i)).toBeInTheDocument();
    expect(screen.getByText(/HOODIES & SWAG PACKS/i)).toBeInTheDocument();

    // Verify Revenue Logged is completely removed from the dashboard
    expect(screen.queryByText(/REVENUE LOGGED/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ADMIN REVENUE/i)).not.toBeInTheDocument();

    // Switch to SWAG LOGISTICS dashboard view tab
    const logisticsTab = screen.getByRole("button", { name: /SWAG LOGISTICS/i });
    fireEvent.click(logisticsTab);

    // Verify Swag inventory console is visible
    expect(screen.getByText(/OFFICIAL HOODIE & T-SHIRT INVENTORY TALLY/i)).toBeInTheDocument();
    expect(screen.getByText(/SIZE M/i)).toBeInTheDocument();
    expect(screen.getByText(/SQUAD VS SOLO DISTRIBUTION/i)).toBeInTheDocument();
  });

  it("displays uploaded payment screenshot proof in dossier and opens lightbox modal", async () => {
    render(<AdminDeskPage />);

    await waitFor(() => {
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });

    // Select attendee row to open active dossier
    const row = screen.getByText("Ada Lovelace").closest("tr");
    expect(row).not.toBeNull();
    fireEvent.click(row!);

    // Check payment screenshot section in dossier
    await waitFor(() => {
      expect(screen.getByText("PAYMENT SCREENSHOT PROOF")).toBeInTheDocument();
      expect(screen.getByText("✔ SCREENSHOT ATTACHED")).toBeInTheDocument();
      expect(screen.getAllByText("987654321098").length).toBeGreaterThanOrEqual(1);
    });

    // Click "VIEW FULL SCREENSHOT" button to open lightbox
    const viewProofBtn = screen.getByRole("button", { name: /VIEW FULL SCREENSHOT/i });
    fireEvent.click(viewProofBtn);

    // Lightbox modal should be open
    expect(screen.getByText("PAYMENT VERIFICATION PROOF")).toBeInTheDocument();
    const modalImg = screen.getByAltText(/Payment screenshot for Ada Lovelace/i);
    expect(modalImg).toBeInTheDocument();
    expect(modalImg).toHaveAttribute("src", "data:image/png;base64,mockproof");

    // Close lightbox
    const closeBtn = screen.getByRole("button", { name: "Close proof preview" });
    fireEvent.click(closeBtn);
    expect(screen.queryByText("PAYMENT VERIFICATION PROOF")).not.toBeInTheDocument();

    // Also test table row quick PROOF button
    const tableProofBtn = screen.getByTitle(/View uploaded payment screenshot proof/i);
    fireEvent.click(tableProofBtn);
    expect(screen.getByText("PAYMENT VERIFICATION PROOF")).toBeInTheDocument();
  });
});
