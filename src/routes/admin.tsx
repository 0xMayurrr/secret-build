import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Users,
  Download,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  UserCheck,
  Phone,
  Mail,
  Building,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  User,
  Image as ImageIcon,
  Maximize2,
  ExternalLink,
  Copy,
  Calendar,
  CreditCard,
  X,
  Trash2,
} from "lucide-react";
import blackoutLogo from "@/assets/blackout-logo.png";
import {
  getAllRegistrations,
  markAttendance,
  undoAttendance,
  getRegistrationByIdOrToken,
  type RegistrationRecord,
  isSupabaseConfigured,
  getStoredAdminPasskey,
  setStoredAdminPasskey,
  clearStoredAdminPasskey,
  verifyPasskey,
  ADMIN_PASSKEY_STORAGE_KEY,
  signInOrganizer,
  signUpOrganizer,
  signOutOrganizer,
  getOrganizerUser,
  clearAllRegistrations,
  deleteRegistration,
  supabase,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminDeskPage,
});

export function AdminDeskPage({ initialAuth }: { initialAuth?: boolean } = {}) {
  // Authentication clearance state
  const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof initialAuth === "boolean") return initialAuth;
    if (isTestEnv) return true;
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem(ADMIN_PASSKEY_STORAGE_KEY));
  });
  const [authTab, setAuthTab] = useState<"PASSKEY" | "EMAIL">("PASSKEY");
  const [enteredPasskey, setEnteredPasskey] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessNotice, setAuthSuccessNotice] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [currentOrganizer, setCurrentOrganizer] = useState<{ email?: string } | null>(null);

  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "CHECKED_IN" | "PENDING">("ALL");

  // Selected attendee for the full details popup modal
  const [selectedAttendee, setSelectedAttendee] = useState<RegistrationRecord | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  // Fullscreen zoom for payment screenshot lightbox
  const [isZoomedScreenshot, setIsZoomedScreenshot] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomedScreenshot) {
          setIsZoomedScreenshot(false);
        } else {
          setSelectedAttendee(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomedScreenshot]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  // Check active Supabase session on mount & subscribe to auth changes
  useEffect(() => {
    const checkSession = async () => {
      const user = await getOrganizerUser();
      if (user) {
        setCurrentOrganizer(user);
        setIsAuthenticated(true);
      }
    };
    checkSession();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentOrganizer(session.user);
          setIsAuthenticated(true);
        }
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Load registrations from Supabase / localStorage using authorized passkey
  const loadData = async (passkeyOverride?: string) => {
    setIsLoading(true);
    try {
      const data = await getAllRegistrations(passkeyOverride);
      setRegistrations(data);
    } catch (err) {
      console.error("Failed to load attendees:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }

    // Check if URL has ?verify=BLK-2026-XXXX
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const verifyId = params.get("verify") || params.get("id") || params.get("token");
      if (verifyId && isAuthenticated) {
        handleLookupToken(verifyId);
      }
    }
  }, [isAuthenticated]);

  // Audio feedback synth
  const playBeep = (type: "success" | "warn" | "error") => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "success") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } else if (type === "warn") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(370, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } else {
          osc.type = "square";
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      }
    } catch {
      // Audio unavailable or blocked
    }
  };

  // Passkey authentication handler
  const handlePasskeyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    if (verifyPasskey(enteredPasskey)) {
      setStoredAdminPasskey(enteredPasskey);
      setIsAuthenticated(true);
      setCurrentOrganizer({ email: "VOLUNTEER DESK (PASSKEY)" });
      setAuthError("");
      setFailedAttempts(0);
      loadData(enteredPasskey);
      playBeep("success");
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setLockoutTimer(60);
        setAuthError("CRITICAL: Maximum clearance attempts exceeded. Terminal locked for 60 seconds.");
      } else {
        setAuthError(`ACCESS DENIED: Invalid Passkey. ${5 - nextFailed} attempts remaining.`);
      }
      playBeep("error");
    }
  };

  // Supabase Email & Password authentication handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setIsAuthenticating(true);
    setAuthError("");
    setAuthSuccessNotice("");

    if (isSigningUp) {
      const res = await signUpOrganizer(emailInput, passwordInput);
      setIsAuthenticating(false);
      if (res.success) {
        if (res.confirmationRequired) {
          setAuthSuccessNotice("Registration submitted! Check email for confirmation link or notify administrator.");
          setIsSigningUp(false);
        } else {
          setCurrentOrganizer(res.user);
          setIsAuthenticated(true);
          loadData();
          playBeep("success");
        }
      } else {
        setAuthError(res.error || "Organizer account registration failed.");
        playBeep("error");
      }
    } else {
      const res = await signInOrganizer(emailInput, passwordInput);
      setIsAuthenticating(false);
      if (res.success) {
        setCurrentOrganizer(res.user);
        setIsAuthenticated(true);
        loadData();
        playBeep("success");
      } else {
        setAuthError(res.error || "Invalid organizer credentials.");
        playBeep("error");
      }
    }
  };

  // Lock terminal and purge active session
  const handleLockTerminal = async () => {
    await signOutOrganizer();
    setIsAuthenticated(false);
    setCurrentOrganizer(null);
    setRegistrations([]);
    setSelectedAttendee(null);
    setEnteredPasskey("");
    setEmailInput("");
    setPasswordInput("");
    setAuthError("");
    setAuthSuccessNotice("");
  };

  // Look up token from URL or search
  const handleLookupToken = async (rawInput: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");

    let clean = rawInput.trim();
    if (clean.includes("?verify=")) {
      const parts = clean.split("?verify=");
      if (parts[1]) clean = parts[1].split("&")[0];
    } else if (clean.includes("|")) {
      const parts = clean.split("|");
      const foundToken = parts.find((p) => p.startsWith("BLK-") || p.startsWith("REG:"));
      if (foundToken) {
        clean = foundToken.replace("REG:", "");
      }
    }

    const found = await getRegistrationByIdOrToken(clean);
    if (found) {
      setSelectedAttendee(found);
      if (found.checked_in) {
        playBeep("warn");
      } else {
        playBeep("success");
      }
    } else {
      playBeep("error");
      setActionErrorMsg(`No registered operative found matching: "${clean}"`);
    }
  };

  // Perform Check-in
  const handleCheckIn = async (registrationId: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");

    const res = await markAttendance(registrationId, "Registration Desk");
    if (res.success && res.data) {
      if (selectedAttendee?.registration_id === registrationId) {
        setSelectedAttendee(res.data);
      }
      setActionSuccessMsg(`SUCCESS: ${res.data.full_name} admitted to arena!`);
      playBeep("success");

      setRegistrations((prev) =>
        prev.map((r) => (r.registration_id === registrationId ? res.data! : r))
      );
    } else {
      setActionErrorMsg(res.error || "Failed to mark attendance.");
      playBeep("error");
    }
  };

  // Undo Check-in
  const handleUndoCheckIn = async (registrationId: string) => {
    const res = await undoAttendance(registrationId);
    if (res.success && res.data) {
      if (selectedAttendee?.registration_id === registrationId) {
        setSelectedAttendee(res.data);
      }
      setActionSuccessMsg(`Status reverted to PENDING for ${res.data.full_name}.`);

      setRegistrations((prev) =>
        prev.map((r) => (r.registration_id === registrationId ? res.data! : r))
      );
    } else {
      setActionErrorMsg(res.error || "Failed to revert check-in.");
    }
  };

  // Export CSV of Attendees
  const handleExportCSV = () => {
    const headers = [
      "Registration ID",
      "Full Name",
      "Email",
      "Phone",
      "Pass Tier",
      "Division",
      "Team Name",
      "Team Size",
      "Amount Paid",
      "College / Org",
      "UTR Number",
      "Checked In",
      "Checked In At",
    ];

    const rows = registrations.map((r) => [
      `"${r.registration_id}"`,
      `"${r.full_name}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.pass_name}"`,
      `"${r.participation_type}"`,
      `"${r.team_name || ""}"`,
      r.team_size || 1,
      r.total_price || r.pass_price,
      `"${r.organization}"`,
      `"${r.utr_number}"`,
      r.checked_in ? "YES" : "NO",
      `"${r.checked_in_at || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BLACKOUT-2026-Attendance-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Purge all test data
  const handlePurgeAllData = async () => {
    if (
      !window.confirm(
        "CRITICAL ACTION: Are you sure you want to delete all registration data from the database? This cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setActionSuccessMsg("");
    setActionErrorMsg("");

    const res = await clearAllRegistrations();
    setIsLoading(false);

    if (res.success) {
      setRegistrations([]);
      setSelectedAttendee(null);
      setActionSuccessMsg("SUCCESS: All fake/test registration data has been purged.");
      playBeep("success");
    } else {
      // If direct delete is restricted by database RLS, advise user of the 1-line SQL query
      setRegistrations([]);
      setSelectedAttendee(null);
      setActionErrorMsg(
        `Local cache cleared. To wipe Supabase table completely, execute 'TRUNCATE TABLE public.registrations CASCADE;' in your Supabase SQL Editor.`
      );
      playBeep("warn");
    }
  };

  // Delete single attendee
  const handleDeleteAttendee = async (registrationId: string, fullName: string) => {
    if (!window.confirm(`Delete record for ${fullName} (${registrationId})?`)) {
      return;
    }

    const res = await deleteRegistration(registrationId);
    if (res.success) {
      setRegistrations((prev) => prev.filter((r) => r.registration_id !== registrationId));
      if (selectedAttendee?.registration_id === registrationId) {
        setSelectedAttendee(null);
      }
      setActionSuccessMsg(`Deleted record: ${fullName}`);
      playBeep("success");
    } else {
      setActionErrorMsg(res.error || "Failed to delete record.");
      playBeep("error");
    }
  };

  // Computed metrics
  const totalRegistrations = registrations.length;
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const pendingCount = totalRegistrations - checkedInCount;
  const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;
  const soloCount = registrations.filter((r) => r.participation_type !== "team").length;
  const teamCount = registrations.filter((r) => r.participation_type === "team").length;

  // Filtered registrations
  const filteredList = registrations.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registration_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.team_name && r.team_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "CHECKED_IN") return r.checked_in;
    if (activeTab === "PENDING") return !r.checked_in;
    return true;
  });

  // RENDER CLEARANCE PORTAL IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="crt min-h-screen bg-[#07020d] text-foreground flex flex-col justify-between p-4 sm:p-8 select-none">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4 max-w-lg mx-auto w-full">
          <a
            href="/"
            className="flex items-center gap-2 font-pixel text-[9px] text-muted-foreground hover:text-signal transition"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>HQ HOME</span>
          </a>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive animate-pulse" />
            <span className="font-pixel text-[9px] text-destructive">RESTRICTED TERMINAL</span>
          </div>
        </div>

        {/* CLEARANCE PORTAL CARD */}
        <div className="max-w-md mx-auto w-full border-2 border-primary/60 bg-card/95 p-6 sm:p-8 shadow-[8px_8px_0_0_var(--primary)] backdrop-blur-md">
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary shadow-[0_0_15px_var(--primary)]">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="font-pixel text-base sm:text-lg text-foreground font-bold">
              BLACKOUT 2026 // ADMIN GATEWAY
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-1.5">
              Organizer authentication required to access live attendee roster &amp; records.
            </p>
          </div>

          {/* DUAL AUTH MODE SELECTOR TABS */}
          <div className="grid grid-cols-2 gap-2 border-2 border-border p-1 bg-black/60 mb-5 font-pixel text-[8px]">
            <button
              type="button"
              onClick={() => {
                setAuthTab("PASSKEY");
                setAuthError("");
                setAuthSuccessNotice("");
              }}
              className={`py-2 px-3 flex items-center justify-center gap-1.5 transition ${
                authTab === "PASSKEY"
                  ? "bg-signal text-black font-bold shadow-[2px_2px_0_0_rgba(255,255,255,0.8)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="h-3 w-3" />
              <span>EVENT PASSKEY</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthTab("EMAIL");
                setAuthError("");
                setAuthSuccessNotice("");
              }}
              className={`py-2 px-3 flex items-center justify-center gap-1.5 transition ${
                authTab === "EMAIL"
                  ? "bg-primary text-primary-foreground font-bold shadow-[2px_2px_0_0_var(--signal)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3 w-3" />
              <span>SUPABASE LOGIN</span>
            </button>
          </div>

          {authError && (
            <div className="mb-4 border-2 border-destructive bg-destructive/15 p-3 font-mono text-xs text-destructive flex items-center gap-2 animate-shake">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccessNotice && (
            <div className="mb-4 border-2 border-signal bg-signal/15 p-3 font-mono text-xs text-signal flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{authSuccessNotice}</span>
            </div>
          )}

          {/* PASSKEY FORM */}
          {authTab === "PASSKEY" && (
            <form onSubmit={handlePasskeyAuth} className="space-y-4">
              <div>
                <label className="font-pixel text-[9px] text-muted-foreground uppercase block mb-1.5">
                  EVENT CLEARANCE PASSKEY
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter event passkey..."
                    value={enteredPasskey}
                    onChange={(e) => setEnteredPasskey(e.target.value)}
                    disabled={lockoutTimer > 0}
                    className="w-full border-2 border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground focus:border-signal focus:outline-none"
                    autoFocus
                  />
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mt-1.5">
                  Default passkey: <code className="text-signal font-mono font-bold">BLACKOUT@DESK2026</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0 || !enteredPasskey.trim()}
                className="w-full border-2 border-signal bg-signal py-3 font-pixel text-[9px] text-black font-bold uppercase shadow-[4px_4px_0_0_rgba(255,255,255,0.8)] hover:translate-x-0.5 hover:translate-y-0.5 transition disabled:opacity-50"
              >
                {lockoutTimer > 0 ? `TERMINAL LOCKED (${lockoutTimer}s)` : "VERIFY PASSKEY & ENTER DESK ▶"}
              </button>
            </form>
          )}

          {/* SUPABASE EMAIL & PASSWORD FORM */}
          {authTab === "EMAIL" && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="font-pixel text-[9px] text-muted-foreground uppercase block mb-1">
                  ORGANIZER EMAIL
                </label>
                <input
                  type="email"
                  placeholder="organizer@blackout.hackathon"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={lockoutTimer > 0}
                  required
                  className="w-full border-2 border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-pixel text-[9px] text-muted-foreground uppercase block mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    disabled={lockoutTimer > 0}
                    required
                    className="w-full border-2 border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0 || isAuthenticating || !emailInput || !passwordInput}
                className="w-full border-2 border-primary bg-primary py-3 font-pixel text-[9px] text-primary-foreground font-bold uppercase shadow-[4px_4px_0_0_var(--signal)] hover:translate-x-0.5 hover:translate-y-0.5 transition disabled:opacity-50"
              >
                {isAuthenticating
                  ? "AUTHENTICATING..."
                  : isSigningUp
                  ? "CREATE ORGANIZER ACCOUNT"
                  : "SIGN IN TERMINAL ▶"}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsSigningUp(!isSigningUp)}
                  className="font-mono text-xs text-muted-foreground hover:text-signal underline"
                >
                  {isSigningUp
                    ? "Already have an organizer account? Sign In"
                    : "Need an account? Register as Organizer"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="text-center font-mono text-[10px] text-muted-foreground/60 py-4">
          BLACKOUT 2026 // SECURE ORGANIZER PORTAL · ZERO-KNOWLEDGE CLEARANCE
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN AUTHENTICATED DASHBOARD PORTAL
  // =========================================================================
  return (
    <div className="crt min-h-screen bg-[#07020d] text-foreground pb-20 select-none">
      {/* CLEAN TOP EXECUTIVE NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-[#07020d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <img
                src={blackoutLogo}
                alt="BLACKOUT"
                className="h-7 w-auto drop-shadow-[0_0_12px_rgba(168,85,247,0.7)] group-hover:scale-105 transition"
              />
              <div className="border-l border-border/80 pl-2.5">
                <span className="font-pixel text-[10px] text-foreground block font-bold leading-none tracking-wider">
                  REGISTRATION DESK
                </span>
                <span className="font-mono text-[9px] text-signal block mt-1 tracking-wider font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
                  LIVE CHECK-IN &amp; ATTENDANCE
                </span>
              </div>
            </a>
          </div>

          {/* Right: Clean Controls */}
          <div className="flex items-center gap-2">
            {/* Operator Identity Pill */}
            <div className="hidden sm:flex items-center gap-1.5 border border-border/80 bg-background/80 px-2.5 py-1 font-mono text-[10px]">
              <User className="h-3 w-3 text-signal" />
              <span className="text-signal font-bold truncate max-w-[140px]">
                {currentOrganizer?.email || "DESK VOLUNTEER"}
              </span>
            </div>

            {/* Sync */}
            <button
              type="button"
              onClick={() => loadData()}
              title="Refresh attendance records"
              className="flex items-center gap-1.5 border border-border bg-card/60 px-2.5 py-1 font-mono text-xs text-muted-foreground hover:text-foreground hover:border-signal transition active:scale-95"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline font-pixel text-[8px]">SYNC</span>
            </button>

            {/* Lock Terminal */}
            <button
              type="button"
              onClick={handleLockTerminal}
              title="Lock terminal and sign out"
              className="flex items-center gap-1.5 border border-destructive/60 bg-destructive/10 px-2.5 py-1 font-pixel text-[8px] text-destructive hover:bg-destructive hover:text-white transition active:scale-95"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">LOCK</span>
            </button>

            {/* Return HQ */}
            <a
              href="/"
              title="Return to HQ"
              className="flex items-center gap-1.5 border border-border px-2.5 py-1 font-pixel text-[8px] text-muted-foreground hover:border-signal hover:text-signal transition"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>HQ</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        {/* LIVE VENUE ADMISSION PROGRESS GAUGE */}
        <div className="border-2 border-border bg-card/40 p-3 sm:p-4 mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
              <span className="font-pixel text-[9px] text-foreground font-bold uppercase tracking-wider">
                VENUE ADMISSION CAPACITY // ARENA CLEARANCE
              </span>
            </div>
            <span className="text-signal font-bold font-mono text-xs">
              {checkedInCount} / {totalRegistrations} Admitted ({checkInRate}%)
            </span>
          </div>
          <div className="w-full bg-black/80 h-2.5 border border-border/80 overflow-hidden rounded-sm">
            <div
              className="h-full bg-gradient-to-r from-primary via-signal to-signal shadow-[0_0_12px_rgba(34,197,94,0.8)] transition-all duration-500"
              style={{ width: `${Math.max(checkInRate, 2)}%` }}
            />
          </div>
        </div>

        {/* STATS DECK - 3 BALANCED OPERATIONAL KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="border-2 border-border bg-card/60 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
              TOTAL REGISTERED
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-pixel text-2xl sm:text-3xl text-foreground font-bold">
                {totalRegistrations}
              </span>
              <span className="font-mono text-xs text-muted-foreground">builders</span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground mt-1 block">
              {soloCount} Solo · {teamCount} Squads
            </span>
          </div>

          <div className="border-2 border-signal/60 bg-signal/5 p-4 shadow-[4px_4px_0_0_var(--signal)] flex flex-col justify-between">
            <span className="font-pixel text-[8px] text-signal uppercase block font-bold">
              CHECKED IN (PRESENT)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-pixel text-2xl sm:text-3xl text-signal font-bold">
                {checkedInCount}
              </span>
              <span className="font-mono text-xs text-signal font-bold">
                ({checkInRate}%)
              </span>
            </div>
            <span className="font-mono text-[9px] text-signal/80 mt-1 block">
              Admitted to arena
            </span>
          </div>

          <div className="border-2 border-amber-500/60 bg-amber-500/5 p-4 shadow-[4px_4px_0_0_rgba(245,158,11,0.5)] flex flex-col justify-between">
            <span className="font-pixel text-[8px] text-amber-400 uppercase block">
              PENDING ADMITTANCE
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-pixel text-2xl sm:text-3xl text-amber-400 font-bold">
                {pendingCount}
              </span>
              <span className="font-mono text-xs text-muted-foreground">remaining</span>
            </div>
            <span className="font-mono text-[9px] text-amber-400/80 mt-1 block">
              Awaiting desk arrival
            </span>
          </div>
        </div>

        {/* TOP STATUS ALERTS */}
        {actionSuccessMsg && (
          <div className="mb-4 flex items-center justify-between border-2 border-signal bg-signal/15 p-3.5 font-mono text-xs text-signal animate-fade-in shadow-[4px_4px_0_0_var(--signal)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMsg("")}
              className="text-xs hover:underline font-pixel text-[8px]"
            >
              DISMISS
            </button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="mb-4 flex items-center justify-between border-2 border-destructive bg-destructive/15 p-3.5 font-mono text-xs text-destructive animate-fade-in shadow-[4px_4px_0_0_var(--destructive)]">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionErrorMsg("")}
              className="text-xs hover:underline font-pixel text-[8px]"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* ATTENDEE DIRECTORY ROSTER */}
        <section className="border-2 border-border bg-card p-5 sm:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4 mb-5">
            <div>
              <h3 className="font-pixel text-base sm:text-lg text-foreground">
                ATTENDEE ROSTER DIRECTORY
              </h3>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                {isSupabaseConfigured
                  ? "Connected to Supabase live database · Click any operative to view full dossier & payment screenshot"
                  : "Local vault mode active · Click any operative to view full dossier & payment screenshot"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Filter Tabs */}
              <div className="inline-flex border-2 border-border p-0.5 bg-background font-pixel text-[8px]">
                {(["ALL", "CHECKED_IN", "PENDING"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 transition ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground font-bold shadow-[2px_2px_0_0_var(--signal)]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "ALL"
                      ? `ALL (${totalRegistrations})`
                      : tab === "CHECKED_IN"
                      ? `PRESENT (${checkedInCount})`
                      : `PENDING (${pendingCount})`}
                  </button>
                ))}
              </div>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-pixel text-[8px] text-muted-foreground hover:text-foreground hover:border-primary transition"
              >
                <Download className="h-3 w-3" />
                <span>EXPORT CSV</span>
              </button>

              {/* Purge All Test Data */}
              <button
                type="button"
                onClick={handlePurgeAllData}
                className="flex items-center gap-1.5 border border-destructive/60 bg-destructive/10 px-3 py-1.5 font-pixel text-[8px] text-destructive hover:bg-destructive hover:text-white transition active:scale-95"
                title="Wipe fake/test data from database"
              >
                <Trash2 className="h-3 w-3" />
                <span>PURGE TEST DATA</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by operative name, token, email, squad, or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-border bg-background pl-10 pr-4 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto border-2 border-border">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b-2 border-border bg-[#0d0417] font-pixel text-[8px] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">OPERATIVE / EMAIL</th>
                  <th className="px-4 py-3">TIER &amp; SQUAD</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredList.length > 0 ? (
                  filteredList.map((record) => (
                    <tr
                      key={record.registration_id}
                      onClick={() => setSelectedAttendee(record)}
                      className={`cursor-pointer transition hover:bg-primary/10 ${
                        selectedAttendee?.registration_id === record.registration_id
                          ? "bg-primary/15"
                          : ""
                      }`}
                      title="Click to view full operative dossier & payment screenshot"
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-foreground block group-hover:text-primary transition">
                          {record.full_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {record.email} · {record.organization}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[9px] text-signal font-bold">
                            {record.registration_id}
                          </span>
                          {record.payment_proof_url && (
                            <span
                              className="inline-flex items-center gap-1 border border-primary/60 bg-primary/15 px-1.5 py-0.5 font-pixel text-[7px] text-primary"
                              title="Payment proof attached"
                            >
                              <ImageIcon className="h-2.5 w-2.5" />
                              <span>PROOF</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-signal block text-[11px]">
                          {record.pass_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {record.participation_type === "team"
                            ? `Team: ${record.team_name || "Squad"} (${record.team_size || 1})`
                            : "Solo"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {record.checked_in ? (
                          <span className="inline-flex items-center gap-1 font-pixel text-[8px] text-signal font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                            PRESENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-pixel text-[8px] text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 opacity-60" />
                            PENDING
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAttendee(record);
                            }}
                            className="border border-border hover:border-primary bg-background/80 px-2.5 py-1 font-pixel text-[7px] text-muted-foreground hover:text-foreground transition"
                            title="Open full dossier & screenshot popup"
                          >
                            DOSSIER
                          </button>

                          {!record.checked_in ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckIn(record.registration_id);
                              }}
                              className="border border-signal/60 bg-signal/15 px-3 py-1 font-pixel text-[8px] text-signal hover:bg-signal hover:text-black transition"
                            >
                              CHECK IN
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndoCheckIn(record.registration_id);
                              }}
                              className="border border-border px-2 py-1 font-pixel text-[7px] text-muted-foreground hover:text-destructive transition"
                            >
                              UNDO
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No operatives found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================== */}
        {/* INDIVIDUAL OPERATIVE FULL DETAILS & SCREENSHOT POP-UP MODAL   */}
        {/* ============================================================== */}
        {selectedAttendee && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in"
            onClick={() => setSelectedAttendee(null)}
          >
            <div
              className="relative w-full max-w-4xl border-2 border-primary bg-[#0d0417] p-5 sm:p-6 shadow-[8px_8px_0_0_var(--signal)] max-h-[92vh] flex flex-col text-foreground overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="flex items-start justify-between border-b-2 border-border/80 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="border border-primary bg-primary/20 px-2 py-0.5 font-pixel text-[8px] text-primary font-bold">
                      OPERATIVE DOSSIER // FULL DETAILS
                    </span>
                    <span className="font-mono text-xs text-signal font-bold bg-signal/10 px-2 py-0.5 border border-signal/30">
                      {selectedAttendee.registration_id}
                    </span>
                    <span className="border border-border bg-background/80 px-2 py-0.5 font-pixel text-[8px] text-foreground">
                      {selectedAttendee.pass_name}
                    </span>
                  </div>
                  <h2 className="font-pixel text-lg sm:text-xl text-foreground font-bold">
                    {selectedAttendee.full_name}
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {selectedAttendee.organization} · {selectedAttendee.participation_type === "team" ? "Squad Team" : "Solo Builder"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAttendee(null)}
                  className="border-2 border-border p-1.5 font-pixel text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition"
                  aria-label="Close operative dossier"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Attendance Status & Action Banner */}
              <div className="mb-5 border-2 border-border/80 bg-background/60 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {selectedAttendee.checked_in ? (
                    <>
                      <div className="h-3 w-3 rounded-full bg-signal animate-pulse" />
                      <div>
                        <span className="font-pixel text-[9px] text-signal font-bold block">
                          ADMITTED &amp; PRESENT IN ARENA
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Marked present at{" "}
                          {selectedAttendee.checked_in_at
                            ? new Date(selectedAttendee.checked_in_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Desk arrival"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div>
                        <span className="font-pixel text-[9px] text-amber-400 font-bold block">
                          PENDING ADMITTANCE // NOT CHECKED IN
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Pass confirmed. Awaiting physical check-in at registration desk.
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  {!selectedAttendee.checked_in ? (
                    <button
                      type="button"
                      onClick={() => handleCheckIn(selectedAttendee.registration_id)}
                      className="flex items-center gap-2 border-2 border-signal bg-signal px-4 py-2 font-pixel text-[9px] text-black font-bold shadow-[2px_2px_0_0_rgba(255,255,255,0.8)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>ADMIT PARTICIPANT &amp; MARK PRESENT ▶</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUndoCheckIn(selectedAttendee.registration_id)}
                      className="border border-border hover:border-destructive px-3 py-1.5 font-pixel text-[8px] text-muted-foreground hover:text-destructive transition"
                    >
                      REVERT / UNDO ADMISSION
                    </button>
                  )}
                </div>
              </div>

              {/* Two-Column Responsive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
                {/* LEFT: Operative Contact, Tier & Squad Info */}
                <div className="space-y-4">
                  {/* Contact Uplink */}
                  <div className="border border-border/80 bg-background/50 p-4 space-y-2">
                    <span className="font-pixel text-[8px] text-primary uppercase block tracking-wider font-bold">
                      CONTACT &amp; PROFILE DETAILS
                    </span>

                    <div className="font-mono text-xs space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        <a
                          href={`mailto:${selectedAttendee.email}`}
                          className="text-foreground hover:text-signal underline truncate"
                        >
                          {selectedAttendee.email}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-signal shrink-0" />
                        <a
                          href={`tel:${selectedAttendee.phone}`}
                          className="text-foreground hover:text-signal"
                        >
                          {selectedAttendee.phone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{selectedAttendee.organization}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground text-[10px]">
                          Registered on:{" "}
                          <span className="text-foreground">
                            {selectedAttendee.created_at
                              ? new Date(selectedAttendee.created_at).toLocaleString()
                              : "Confirmed"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pass & Team Information */}
                  <div className="border border-border/80 bg-background/50 p-4 space-y-2">
                    <span className="font-pixel text-[8px] text-signal uppercase block tracking-wider font-bold">
                      PASS TICKET &amp; SQUAD INFORMATION
                    </span>

                    <div className="font-mono text-xs space-y-2 pt-1">
                      <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Pass Tier:</span>
                        <span className="font-pixel text-xs text-foreground font-bold">
                          {selectedAttendee.pass_name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Participation Type:</span>
                        <span className="text-signal font-bold uppercase">
                          {selectedAttendee.participation_type === "team" ? "Squad Team" : "Solo Operative"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                        <span className="text-muted-foreground">Registration Fee:</span>
                        <span className="text-foreground font-mono font-bold">
                          ₹{selectedAttendee.total_price || selectedAttendee.pass_price}
                        </span>
                      </div>

                      {/* Squad Members Details */}
                      {selectedAttendee.participation_type === "team" && (
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-muted-foreground font-bold">
                              Squad: {selectedAttendee.team_name || "Team Squad"}
                            </span>
                            <span className="font-pixel text-[8px] text-signal">
                              {selectedAttendee.team_size || 1} BUILDERS
                            </span>
                          </div>

                          {selectedAttendee.team_members_details &&
                          selectedAttendee.team_members_details.length > 0 ? (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {selectedAttendee.team_members_details.map((member, idx) => (
                                <div
                                  key={idx}
                                  className="border border-border/60 bg-black/40 p-2 text-[10px] space-y-0.5"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-foreground">
                                      {idx + 1}. {member.full_name || "Operative"}
                                    </span>
                                    {member.role && (
                                      <span className="font-pixel text-[7px] text-signal border border-signal/40 px-1">
                                        {member.role}
                                      </span>
                                    )}
                                  </div>
                                  {member.email && (
                                    <div className="text-muted-foreground truncate">{member.email}</div>
                                  )}
                                  {member.phone && (
                                    <div className="text-muted-foreground">{member.phone}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : selectedAttendee.team_members && selectedAttendee.team_members.length > 0 ? (
                            <div className="bg-black/40 p-2 border border-border/60 text-[11px] space-y-1">
                              {selectedAttendee.team_members.map((m, idx) => (
                                <div key={idx} className="text-muted-foreground truncate">
                                  • {m}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Payment Screenshot Proof & UTR Audit */}
                <div className="border border-border/80 bg-background/50 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
                      <div className="flex items-center gap-2 font-pixel text-[9px] text-foreground font-bold">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <span>PAYMENT SCREENSHOT PROOF</span>
                      </div>
                      {selectedAttendee.payment_proof_url ? (
                        <span className="border border-signal bg-signal/15 px-2 py-0.5 font-pixel text-[8px] text-signal font-bold">
                          ✔ SCREENSHOT ATTACHED
                        </span>
                      ) : (
                        <span className="border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 font-pixel text-[8px] text-amber-400 font-bold">
                          ⚠ NO IMAGE ATTACHED
                        </span>
                      )}
                    </div>

                    {/* UTR Number */}
                    <div className="mb-3 border border-border/60 bg-black/60 p-2.5 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-muted-foreground block text-[9px] font-mono">
                          TRANSACTION REFERENCE / UTR:
                        </span>
                        <span className="font-mono text-sm font-bold text-signal tracking-wider">
                          {selectedAttendee.utr_number || "NO UTR PROVIDED"}
                        </span>
                      </div>
                      {selectedAttendee.utr_number && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(selectedAttendee.utr_number);
                            setActionSuccessMsg("Copied UTR: " + selectedAttendee.utr_number);
                          }}
                          className="flex items-center gap-1 border border-border hover:border-signal px-2 py-1 font-pixel text-[8px] text-muted-foreground hover:text-signal transition"
                        >
                          <Copy className="h-3 w-3" />
                          <span>COPY</span>
                        </button>
                      )}
                    </div>

                    {/* Image Preview Container */}
                    <div className="border-2 border-dashed border-border/80 bg-black/80 p-2 flex flex-col items-center justify-center min-h-[260px] relative group overflow-hidden">
                      {selectedAttendee.payment_proof_url ? (
                        <>
                          <img
                            src={selectedAttendee.payment_proof_url}
                            alt={`Payment screenshot for ${selectedAttendee.full_name}`}
                            className="max-h-[280px] w-full object-contain cursor-pointer transition group-hover:scale-102"
                            onClick={() => setIsZoomedScreenshot(true)}
                            title="Click to view full image in lightbox"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsZoomedScreenshot(true)}
                              className="flex items-center gap-1 border border-primary bg-primary/20 px-2.5 py-1 font-pixel text-[8px] text-primary hover:bg-primary hover:text-black transition"
                            >
                              <Maximize2 className="h-3 w-3" />
                              <span>ENLARGE PREVIEW</span>
                            </button>
                            <a
                              href={selectedAttendee.payment_proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 border border-border px-2.5 py-1 font-pixel text-[8px] text-muted-foreground hover:text-foreground hover:border-signal transition"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>OPEN IN NEW TAB</span>
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <CreditCard className="h-8 w-8 text-amber-400/60 mx-auto" />
                          <p className="font-pixel text-[9px] text-amber-400">
                            NO PAYMENT SCREENSHOT WAS UPLOADED
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            Participant submitted transaction reference without attaching an image.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Bottom Actions */}
                  <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAttendee(
                          selectedAttendee.registration_id,
                          selectedAttendee.full_name
                        )
                      }
                      className="border border-destructive/60 bg-destructive/10 hover:bg-destructive hover:text-white px-3 py-1.5 font-pixel text-[8px] text-destructive transition flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>DELETE RECORD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedAttendee(null)}
                      className="border-2 border-border px-4 py-1.5 font-pixel text-[9px] text-muted-foreground hover:text-foreground hover:border-signal transition"
                    >
                      CLOSE DOSSIER
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FULLSCREEN LIGHTBOX FOR SCREENSHOT */}
        {isZoomedScreenshot && selectedAttendee?.payment_proof_url && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-fade-in"
            onClick={() => setIsZoomedScreenshot(false)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[94vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-xs font-mono">
                <span className="text-signal font-bold">
                  {selectedAttendee.full_name} · Payment Proof · UTR: {selectedAttendee.utr_number}
                </span>
                <button
                  type="button"
                  onClick={() => setIsZoomedScreenshot(false)}
                  className="border border-border p-1 hover:border-destructive hover:text-destructive"
                  aria-label="Close zoomed image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <img
                src={selectedAttendee.payment_proof_url}
                alt={`Zoomed payment screenshot for ${selectedAttendee.full_name}`}
                className="max-h-[82vh] max-w-full object-contain border-2 border-primary shadow-2xl"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
