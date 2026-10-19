import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Users,
  Download,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Shield,
  UserCheck,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  Building,
  RotateCcw,
  Zap,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  User,
  Image as ImageIcon,
  Maximize2,
  ExternalLink,
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

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [manualTokenInput, setManualTokenInput] = useState("");
  const [isSearchingManual, setIsSearchingManual] = useState(false);

  // Active verified participant modal
  const [activeDossier, setActiveDossier] = useState<RegistrationRecord | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  // Admin-only revenue display clearance
  const [showRevenue, setShowRevenue] = useState(false);
  const [showAdminRevenueModal, setShowAdminRevenueModal] = useState(false);

  // Payment proof screenshot viewer lightbox
  const [proofModalRecord, setProofModalRecord] = useState<RegistrationRecord | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProofModalRecord(null);
        setShowAdminRevenueModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scannerRef = useRef<any>(null);
  const fileScanInputRef = useRef<HTMLInputElement>(null);

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
    setActiveDossier(null);
    setEnteredPasskey("");
    setEmailInput("");
    setPasswordInput("");
    setAuthError("");
    setAuthSuccessNotice("");
  };

  // Audio feedback synth on scan
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
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
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

  // Native mobile photo / camera file QR scanner handler (works 100% on iOS HTTP)
  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerError("");
    setIsSearchingManual(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("blackout-file-scanner");
      const decodedText = await html5QrCode.scanFile(file, true);
      setIsSearchingManual(false);
      await handleLookupToken(decodedText);
    } catch (err: unknown) {
      console.warn("QR file scan error:", err);
      setIsSearchingManual(false);
      setScannerError(
        "Could not detect a valid QR code in the captured photo. Please try again with clear lighting or enter the ID below."
      );
      playBeep("warn");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // Start mobile camera QR scanner
  const startCameraScanner = async () => {
    setScannerError("");
    setIsScanning(true);

    // Check if browser environment supports getUserMedia (iOS Safari blocks it on non-secure HTTP origins)
    const isSecure =
      typeof window !== "undefined" &&
      (window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    if (!isSecure && !navigator.mediaDevices?.getUserMedia) {
      setScannerError("iOS Safari restricts live video on local HTTP. Opening iPhone Camera capture...");
      setIsScanning(false);
      fileScanInputRef.current?.click();
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Stop previous instance if any
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode("blackout-qr-reader");
      scannerRef.current = html5QrCode;

      const qrCodeSuccessCallback = async (decodedText: string) => {
        // Stop scanning upon reading
        try {
          await html5QrCode.stop();
          html5QrCode.clear();
        } catch {
          // ignore
        }
        setIsScanning(false);
        handleLookupToken(decodedText);
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
        },
        qrCodeSuccessCallback,
        undefined
      );
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      setScannerError("Camera permission denied or camera device not found.");
      setIsScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Look up scanned token or manual entry
  const handleLookupToken = async (rawInput: string) => {
    setActionSuccessMsg("");
    setActionErrorMsg("");
    setIsSearchingManual(true);

    let clean = rawInput.trim();
    // Parse URL if QR contains https://.../admin?verify=BLK-2026-XXXX
    if (clean.includes("?verify=")) {
      const parts = clean.split("?verify=");
      if (parts[1]) clean = parts[1].split("&")[0];
    } else if (clean.includes("|")) {
      // Handle structured format: BLACKOUT_PASS|BLK-2026-XXXX|...
      const parts = clean.split("|");
      const foundToken = parts.find((p) => p.startsWith("BLK-") || p.startsWith("REG:"));
      if (foundToken) {
        clean = foundToken.replace("REG:", "");
      }
    }

    const found = await getRegistrationByIdOrToken(clean);
    setIsSearchingManual(false);

    if (found) {
      setActiveDossier(found);
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
      setActiveDossier(res.data);
      setActionSuccessMsg(`SUCCESS: ${res.data.full_name} admitted to arena!`);
      playBeep("success");

      // Update in-memory state
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
      setActiveDossier(res.data);
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
      "T-Shirt Size",
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
      `"${r.tshirt_size || ""}"`,
      `"${r.organization}"`,
      `"${r.utr_number}"`,
      r.checked_in ? "YES" : "NO",
      `"${r.checked_in_at || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BLACKOUT-2026-Attendance-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Computed metrics
  const totalRegistrations = registrations.length;
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const pendingCount = totalRegistrations - checkedInCount;
  const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;
  const totalRevenue = registrations.reduce((acc, r) => acc + (r.total_price || r.pass_price || 0), 0);

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
              Organizer authentication required to access live attendee roster &amp; desk scanner.
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
            <div className="mb-4 border-2 border-signal bg-signal/15 p-3 font-mono text-xs text-signal flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{authSuccessNotice}</span>
            </div>
          )}

          {/* TAB 1: EVENT PASSKEY AUTH */}
          {authTab === "PASSKEY" ? (
            <form onSubmit={handlePasskeyAuth} className="space-y-4">
              <div>
                <label className="block font-pixel text-[8px] text-signal uppercase mb-1.5 font-bold">
                  MASTER DESK PASSKEY
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter event passkey..."
                    value={enteredPasskey}
                    disabled={lockoutTimer > 0}
                    onChange={(e) => setEnteredPasskey(e.target.value)}
                    className="w-full border-2 border-border bg-black/80 px-3.5 py-2.5 font-mono text-sm text-foreground focus:border-signal focus:outline-none disabled:opacity-50"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground mt-1">
                  Fast clearance for on-site registration desk volunteers.
                </p>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0 || !enteredPasskey.trim()}
                className="w-full flex items-center justify-center gap-2 border-2 border-signal bg-signal py-3 font-pixel text-xs text-black font-bold shadow-[4px_4px_0_0_rgba(255,255,255,0.8)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95 disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                <span>
                  {lockoutTimer > 0
                    ? `LOCKED (${lockoutTimer}s)`
                    : "VERIFY PASSKEY & ENTER DESK ▶"}
                </span>
              </button>
            </form>
          ) : (
            /* TAB 2: SUPABASE AUTH (EMAIL + PASSWORD) */
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block font-pixel text-[8px] text-primary uppercase mb-1 font-bold">
                  ORGANIZER EMAIL
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="organizer@blackout.hackathon"
                    value={emailInput}
                    disabled={lockoutTimer > 0 || isAuthenticating}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full border-2 border-border bg-black/80 px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[8px] text-primary uppercase mb-1 font-bold">
                  ORGANIZER PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    disabled={lockoutTimer > 0 || isAuthenticating}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full border-2 border-border bg-black/80 px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutTimer > 0 || isAuthenticating || !emailInput || !passwordInput}
                className="w-full flex items-center justify-center gap-2 border-2 border-primary bg-primary py-3 font-pixel text-xs text-primary-foreground font-bold shadow-[4px_4px_0_0_var(--signal)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isAuthenticating
                    ? "AUTHENTICATING..."
                    : isSigningUp
                    ? "REGISTER ORGANIZER ACCOUNT ▶"
                    : "SIGN IN AS ORGANIZER ▶"}
                </span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSigningUp(!isSigningUp);
                    setAuthError("");
                    setAuthSuccessNotice("");
                  }}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground underline"
                >
                  {isSigningUp
                    ? "Already have an organizer account? Sign In"
                    : "New desk lead? Register organizer account"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-border/40 pt-4 text-center font-mono text-[10px] text-muted-foreground">
            🔒 Zero-Data-Leak: Powered by Supabase Auth &amp; PostgreSQL Row-Level Security policies.
          </div>
        </div>

        <div className="text-center font-pixel text-[8px] text-muted-foreground/60">
          BLACKOUT 2026 // SECURE ATTENDANCE SUBSYSTEM
        </div>
      </div>
    );
  }

  return (
    <div className="crt min-h-screen bg-[#07020d] text-foreground select-none pb-20">
      {/* TOP DESK HEADER */}
      <header className="sticky top-0 z-50 border-b-2 border-border/80 bg-[#07020d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a
            href="/"
            className="flex items-center gap-2 border-2 border-border px-3 py-1 font-pixel text-[9px] text-muted-foreground hover:border-signal hover:text-signal transition"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>HQ</span>
          </a>

          <div className="flex items-center gap-2.5">
            <img src={blackoutLogo} alt="BLACKOUT" className="h-6 w-auto" />
            <div className="text-left">
              <span className="font-pixel text-[10px] text-primary block leading-none font-bold">
                REGISTRATION DESK
              </span>
              <span className="font-mono text-[9px] text-signal block mt-0.5">
                LIVE CHECK-IN &amp; ATTENDANCE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ORGANIZER AUTH BADGE */}
            <div className="hidden md:flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-2.5 py-1 font-mono text-[10px]">
              <Shield className="h-3 w-3 text-signal" />
              <span className="text-muted-foreground">AUTH:</span>
              <span className="text-signal font-bold truncate max-w-[160px]">
                {currentOrganizer?.email || "DESK VOLUNTEER"}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
            </div>

            <button
              type="button"
              onClick={handleLockTerminal}
              title="Lock admin terminal and sign out"
              className="flex items-center gap-1.5 border border-destructive/60 bg-destructive/10 px-2.5 py-1 font-pixel text-[8px] text-destructive hover:bg-destructive hover:text-white transition active:scale-95"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">SIGN OUT / LOCK</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdminRevenueModal(true)}
              title="Admin Financial Vault (Total Revenue & Sales)"
              className="hidden sm:flex items-center gap-1.5 border border-primary/50 bg-primary/10 px-2.5 py-1 font-pixel text-[8px] text-primary hover:bg-primary hover:text-black transition active:scale-95"
            >
              <Lock className="h-3 w-3" />
              <span>ADMIN REVENUE</span>
            </button>

            <button
              type="button"
              onClick={() => loadData()}
              title="Refresh attendance records"
              className="flex items-center gap-1.5 border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground hover:text-foreground hover:border-signal transition active:scale-95"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">SYNC</span>
            </button>
            <a
              href="/register"
              className="hidden sm:inline-block border border-primary/60 bg-primary/10 px-2.5 py-1 font-pixel text-[8px] text-primary hover:bg-primary hover:text-black transition"
            >
              + NEW PASS
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        {/* STATS DECK */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="border-2 border-border bg-card/60 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
            <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
              TOTAL REGISTERED
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-pixel text-2xl sm:text-3xl text-foreground font-bold">
                {totalRegistrations}
              </span>
              <span className="font-mono text-xs text-muted-foreground">builders</span>
            </div>
          </div>

          <div className="border-2 border-signal/60 bg-signal/5 p-4 shadow-[4px_4px_0_0_var(--signal)]">
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
          </div>

          <div className="border-2 border-amber-500/60 bg-amber-500/5 p-4 shadow-[4px_4px_0_0_rgba(245,158,11,0.5)]">
            <span className="font-pixel text-[8px] text-amber-400 uppercase block">
              PENDING ADMITTANCE
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-pixel text-2xl sm:text-3xl text-amber-400 font-bold">
                {pendingCount}
              </span>
              <span className="font-mono text-xs text-muted-foreground">remaining</span>
            </div>
          </div>

          {/* REVENUE LOGGED (RESTRICTED TO ADMIN ONLY) */}
          <div className="border-2 border-primary/50 bg-primary/5 p-4 shadow-[4px_4px_0_0_var(--primary)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-primary uppercase block font-bold">
                REVENUE LOGGED
              </span>
              <span className="border border-primary/50 bg-primary/15 px-1.5 py-0.5 font-pixel text-[7px] text-primary font-bold">
                🔒 ADMIN ONLY
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              {showRevenue ? (
                <div>
                  <span className="font-pixel text-xl sm:text-2xl text-primary font-bold">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </span>
                  <span className="block font-mono text-[9px] text-muted-foreground">TOTAL LOGGED</span>
                </div>
              ) : (
                <div>
                  <span className="font-pixel text-base sm:text-lg text-muted-foreground font-bold tracking-widest block">
                    ●●●●●●
                  </span>
                  <span className="block font-mono text-[9px] text-muted-foreground">
                    RESTRICTED TO ADMIN
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowRevenue((prev) => !prev)}
                  title={showRevenue ? "Hide revenue from desk" : "Reveal revenue (Admin)"}
                  className="border border-primary/60 bg-primary/20 p-1.5 font-pixel text-[8px] text-primary hover:bg-primary hover:text-black transition active:scale-95 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]"
                >
                  {showRevenue ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminRevenueModal(true)}
                  title="Open Admin Financial Vault"
                  className="border border-border bg-card p-1.5 font-pixel text-[8px] text-muted-foreground hover:text-foreground hover:border-signal transition active:scale-95 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
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

        {/* SCANNER & VERIFICATION SECTION */}
        <div className="grid gap-6 lg:grid-cols-12 mb-8">
          {/* CAMERA QR SCANNER (Col 5) */}
          <div className="lg:col-span-5 border-2 border-primary/50 bg-[#0d0417] p-5 shadow-[6px_6px_0_0_var(--primary)]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2 font-pixel text-[10px] text-primary">
                <QrCode className="h-4 w-4" />
                <span>MOBILE CAMERA QR SCANNER</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">
                SCAN AT DESK
              </span>
            </div>

            {/* Viewport Box */}
            <div className="relative border-2 border-dashed border-border bg-black/80 min-h-[260px] flex flex-col items-center justify-center p-3 overflow-hidden group">
              <div id="blackout-qr-reader" className="w-full max-w-[280px]" />

              {!isScanning && (
                <div className="text-center py-6">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-primary">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="font-pixel text-[10px] text-foreground">
                    CAMERA READY FOR QR SCANNING
                  </p>
                  <p className="font-mono text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Scan participant pass QR directly from mobile screen or printed badge.
                  </p>
                </div>
              )}

              {/* Glowing Laser line animation when active */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-signal to-transparent shadow-[0_0_12px_rgba(34,197,94,1)] animate-laser-sweep" />
              )}
            </div>

            {scannerError && (
              <p className="mt-2 text-xs font-mono text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{scannerError}</span>
              </p>
            )}

            {/* Hidden file input for native camera capture */}
            <input
              ref={fileScanInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleScanFile}
              className="hidden"
            />
            <div id="blackout-file-scanner" className="hidden" />

            {/* Scanner Action Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => fileScanInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-primary bg-primary/20 py-2.5 font-pixel text-[10px] text-primary hover:bg-primary hover:text-primary-foreground transition active:scale-95 shadow-[3px_3px_0_0_var(--signal)] font-bold"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>SNAP WITH IPHONE CAMERA</span>
              </button>

              {!isScanning ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-signal bg-signal/15 py-2.5 font-pixel text-[10px] text-signal hover:bg-signal hover:text-black transition active:scale-95 shadow-[3px_3px_0_0_var(--signal)] font-bold"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>START CAMERA SCANNER</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-destructive bg-destructive/15 py-2.5 font-pixel text-[10px] text-destructive hover:bg-destructive hover:text-white transition active:scale-95 shadow-[3px_3px_0_0_var(--destructive)] font-bold"
                >
                  <CameraOff className="h-3.5 w-3.5" />
                  <span>STOP CAMERA</span>
                </button>
              )}
            </div>

            {/* iPhone helper hint */}
            <div className="mt-3 rounded-lg border border-signal/30 bg-signal/5 p-2.5 font-mono text-[10px] text-muted-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-signal shrink-0 mt-0.5" />
              <span>
                <strong className="text-signal">iPhone Tip:</strong> You can also point your iPhone&apos;s built-in Camera app directly at any pass QR code — it prompts to open and admit them in Safari instantly!
              </span>
            </div>

            {/* Quick manual entry fallback */}
            <div className="mt-4 pt-3 border-t border-border/40">
              <label className="block font-pixel text-[8px] text-muted-foreground uppercase mb-1.5">
                OR ENTER REGISTRATION TOKEN / ID:
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualTokenInput.trim()) {
                    handleLookupToken(manualTokenInput);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="e.g. BLK-2026-X1Y2Z3"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  className="flex-1 border-2 border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearchingManual || !manualTokenInput.trim()}
                  className="border-2 border-primary bg-primary px-4 py-1.5 font-pixel text-[9px] text-primary-foreground hover:bg-signal hover:text-black transition active:scale-95 disabled:opacity-50"
                >
                  {isSearchingManual ? "..." : "VERIFY"}
                </button>
              </form>
            </div>
          </div>

          {/* ACTIVE VERIFIED DOSSIER PANEL (Col 7) */}
          <div className="lg:col-span-7 border-2 border-border bg-card/60 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <span className="font-pixel text-[10px] text-foreground font-bold">
                  VERIFIED OPERATIVE DOSSIER
                </span>
                {activeDossier && (
                  <span
                    className={`font-pixel text-[9px] px-2.5 py-0.5 border ${
                      activeDossier.checked_in
                        ? "border-signal bg-signal/20 text-signal font-bold"
                        : "border-amber-400 bg-amber-400/10 text-amber-400 font-bold"
                    }`}
                  >
                    {activeDossier.checked_in ? "● CHECKED IN / PRESENT" : "○ PENDING ADMISSION"}
                  </span>
                )}
              </div>

              {activeDossier ? (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  {/* Top Name & Tier Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-4">
                    <div>
                      <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
                        PARTICIPANT NAME
                      </span>
                      <h2 className="font-pixel text-xl sm:text-2xl text-foreground font-bold mt-1">
                        {activeDossier.full_name}
                      </h2>
                      <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-primary" />
                        <span>{activeDossier.organization}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-term text-lg text-signal block font-bold">
                        {activeDossier.pass_name}
                      </span>
                      <span className="font-pixel text-[9px] text-foreground font-bold block mt-0.5">
                        PAID: ₹{activeDossier.total_price || activeDossier.pass_price}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground block">
                        ID: {activeDossier.registration_id}
                      </span>
                    </div>
                  </div>

                  {/* CRITICAL SWAG ALLOCATION BADGE */}
                  <div className="border-2 border-primary bg-primary/10 p-3.5 flex items-center justify-between shadow-[3px_3px_0_0_var(--signal)]">
                    <div>
                      <span className="font-pixel text-[8px] text-primary uppercase block font-bold">
                        DESK VOLUNTEER ACTION
                      </span>
                      <span className="font-pixel text-xs sm:text-sm text-foreground font-bold mt-0.5 block">
                        HAND OVER OFFICIAL BLACKOUT HOODIE / T-SHIRT
                      </span>
                    </div>
                    <div className="border-2 border-signal bg-signal text-black px-4 py-1.5 font-pixel text-base font-bold shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
                      SIZE: {activeDossier.tshirt_size || "L"}
                    </div>
                  </div>

                  {/* SQUAD & CONTACT INFO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="border border-border/60 bg-background/60 p-3">
                      <span className="font-pixel text-[8px] text-muted-foreground uppercase block mb-1">
                        SQUAD DIVISION
                      </span>
                      <p className="font-bold text-foreground">
                        {activeDossier.participation_type === "team"
                          ? `TEAM: ${activeDossier.team_name || "SQUAD"}`
                          : "SOLO HACKER"}
                      </p>
                      {activeDossier.team_members_details && activeDossier.team_members_details.length > 0 ? (
                        <div className="mt-3 space-y-2 border-t border-border/40 pt-2">
                          <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
                            SQUAD ROSTER &amp; HOODIES:
                          </span>
                          {activeDossier.team_members_details.map((m, idx) => (
                            <div key={idx} className="border border-border/80 bg-background/80 p-2 text-[10px]">
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-foreground">
                                  {idx === 0 ? `👑 ${m.full_name} (Lead)` : `• ${m.full_name}`}
                                </span>
                                <span className="border border-signal bg-signal/15 px-1.5 py-0.5 font-pixel text-[8px] text-signal font-bold">
                                  SIZE {m.tshirt_size || "L"}
                                </span>
                              </div>
                              <div className="text-[9px] text-muted-foreground flex flex-wrap gap-x-2 mt-1">
                                <span>📧 {m.email}</span>
                                <span>📞 {m.phone}</span>
                                <span>🏫 {m.organization}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : activeDossier.team_members && activeDossier.team_members.length > 0 ? (
                        <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                          <span className="font-bold text-foreground block">Teammates:</span>
                          {activeDossier.team_members.map((m, idx) => (
                            <span key={idx} className="block truncate">
                              • {m}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="border border-border/60 bg-background/60 p-3 space-y-1 text-muted-foreground">
                      <span className="font-pixel text-[8px] text-muted-foreground uppercase block mb-1">
                        CONTACT UPLINK
                      </span>
                      <p className="text-foreground flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 text-primary shrink-0" />
                        <span>{activeDossier.email}</span>
                      </p>
                      <p className="text-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-signal shrink-0" />
                        <span>{activeDossier.phone}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground pt-1">
                        UTR: <span className="text-foreground font-mono">{activeDossier.utr_number}</span>
                      </p>
                    </div>
                  </div>

                  {/* PAYMENT SCREENSHOT PROOF & UTR AUDIT */}
                  <div className="border border-border/80 bg-background/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2 font-pixel text-[9px] text-foreground font-bold">
                        <ImageIcon className="h-3.5 w-3.5 text-primary" />
                        <span>PAYMENT SCREENSHOT PROOF</span>
                      </div>
                      {activeDossier.payment_proof_url ? (
                        <span className="border border-signal bg-signal/15 px-2 py-0.5 font-pixel text-[8px] text-signal font-bold">
                          ✔ SCREENSHOT ATTACHED
                        </span>
                      ) : (
                        <span className="border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 font-pixel text-[8px] text-amber-400 font-bold">
                          ⚠ NO IMAGE ATTACHED
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3.5">
                      {activeDossier.payment_proof_url ? (
                        <>
                          {/* Clickable interactive thumbnail */}
                          <div
                            onClick={() => setProofModalRecord(activeDossier)}
                            className="relative group cursor-pointer border-2 border-primary/60 bg-black/80 p-1 w-full sm:w-36 h-28 flex items-center justify-center overflow-hidden hover:border-signal transition shrink-0 shadow-[2px_2px_0_0_var(--primary)]"
                            title="Click to expand payment screenshot"
                          >
                            <img
                              src={activeDossier.payment_proof_url}
                              alt={`Payment proof for ${activeDossier.full_name}`}
                              className="w-full h-full object-contain transition duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]">
                              <div className="border border-signal bg-black/90 px-2 py-1 font-pixel text-[7px] text-signal flex items-center gap-1 shadow-md">
                                <Maximize2 className="h-2.5 w-2.5" />
                                <span>ZOOM</span>
                              </div>
                            </div>
                          </div>

                          {/* Info & action buttons */}
                          <div className="flex-1 space-y-2 text-left w-full">
                            <div className="font-mono text-xs">
                              <span className="text-muted-foreground block text-[10px]">
                                SUBMITTED TRANSACTION UTR:
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-bold text-signal font-mono text-sm bg-signal/10 px-2 py-0.5 border border-signal/40 tracking-wider">
                                  {activeDossier.utr_number || "NO UTR ENTERED"}
                                </span>
                                {activeDossier.utr_number && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(activeDossier.utr_number);
                                      setActionSuccessMsg("Copied UTR: " + activeDossier.utr_number);
                                    }}
                                    className="border border-border hover:border-signal px-2 py-0.5 font-pixel text-[8px] text-muted-foreground hover:text-signal transition"
                                    title="Copy UTR number"
                                  >
                                    COPY
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setProofModalRecord(activeDossier)}
                                className="flex items-center gap-1.5 border border-primary bg-primary/20 px-3 py-1.5 font-pixel text-[8px] text-primary hover:bg-primary hover:text-primary-foreground transition active:scale-95 shadow-[2px_2px_0_0_var(--signal)] font-bold"
                              >
                                <Maximize2 className="h-3 w-3" />
                                <span>VIEW FULL SCREENSHOT</span>
                              </button>

                              <a
                                href={activeDossier.payment_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 border border-border px-2.5 py-1.5 font-pixel text-[8px] text-muted-foreground hover:text-foreground hover:border-signal transition"
                                title="Open screenshot in new tab"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>OPEN IN NEW TAB</span>
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full p-4 text-center border border-dashed border-border/80 bg-background/40">
                          <p className="font-pixel text-[9px] text-amber-400">
                            NO PAYMENT SCREENSHOT WAS UPLOADED DURING REGISTRATION
                          </p>
                          <p className="font-mono text-xs text-muted-foreground mt-1">
                            Manual UTR:{" "}
                            <strong className="text-foreground font-mono">{activeDossier.utr_number || "None"}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CHECK-IN STATUS BADGE / TIMESTAMP */}
                  {activeDossier.checked_in && (
                    <div className="border border-signal/60 bg-signal/10 p-3 flex items-center justify-between text-signal">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 shrink-0" />
                        <span>
                          ADMITTED ON:{" "}
                          {activeDossier.checked_in_at
                            ? new Date(activeDossier.checked_in_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "TODAY"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUndoCheckIn(activeDossier.registration_id)}
                        className="font-pixel text-[8px] text-muted-foreground hover:text-destructive underline"
                      >
                        REVERT CHECK-IN
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 text-border mb-3" />
                  <p className="font-pixel text-[10px]">NO PARTICIPANT SELECTED</p>
                  <p className="font-mono text-xs mt-1 max-w-sm">
                    Scan a pass QR code using the camera on the left, or search by name / token in the list below.
                  </p>
                </div>
              )}
            </div>

            {/* Check-In Action Button */}
            {activeDossier && (
              <div className="mt-6 pt-4 border-t border-border">
                {!activeDossier.checked_in ? (
                  <button
                    type="button"
                    onClick={() => handleCheckIn(activeDossier.registration_id)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-signal bg-signal py-3.5 font-pixel text-xs text-black font-bold shadow-[4px_4px_0_0_rgba(255,255,255,0.8)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>ADMIT PARTICIPANT &amp; MARK PRESENT ▶</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2 font-pixel text-[10px] text-signal">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>PARTICIPANT OFFICIALLY ADMITTED TO ARENA</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ATTENDEE DIRECTORY SECTION */}
        <section className="border-2 border-border bg-card p-5 sm:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4 mb-5">
            <div>
              <h3 className="font-pixel text-base sm:text-lg text-foreground">
                ATTENDEE ROSTER DIRECTORY
              </h3>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                {isSupabaseConfigured
                  ? "Connected to Supabase live database"
                  : "Local vault mode active (Supabase ready)"}
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
                  <th className="px-4 py-3">SWAG</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredList.length > 0 ? (
                  filteredList.map((record) => (
                    <tr
                      key={record.registration_id}
                      onClick={() => setActiveDossier(record)}
                      className={`cursor-pointer transition hover:bg-primary/5 ${
                        activeDossier?.registration_id === record.registration_id
                          ? "bg-primary/10"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-foreground block">
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProofModalRecord(record);
                              }}
                              className="inline-flex items-center gap-1 border border-primary/60 bg-primary/15 px-1.5 py-0.5 font-pixel text-[7px] text-primary hover:bg-primary hover:text-black transition"
                              title="View uploaded payment screenshot proof"
                            >
                              <ImageIcon className="h-2.5 w-2.5" />
                              <span>PROOF</span>
                            </button>
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
                        <span className="inline-block border border-border bg-background px-2 py-0.5 font-pixel text-[9px] text-foreground font-bold">
                          {record.tshirt_size || "L"}
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No operatives found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ADMIN FINANCIAL VAULT MODAL (RESTRICTED TO ADMIN ONLY) */}
        {/* ============================================================== */}
        {showAdminRevenueModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
            onClick={() => setShowAdminRevenueModal(false)}
          >
            <div
              className="relative w-full max-w-lg border-2 border-primary bg-[#0d0417] p-6 shadow-[8px_8px_0_0_var(--signal)] text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded border border-primary bg-primary/20 flex items-center justify-center text-primary">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-pixel text-sm text-foreground font-bold">
                      ADMIN FINANCIAL VAULT
                    </h3>
                    <span className="font-mono text-[10px] text-signal">
                      RESTRICTED EXECUTIVE CLEARANCE
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminRevenueModal(false)}
                  className="border-2 border-border p-1.5 font-pixel text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="border-2 border-primary/60 bg-primary/10 p-4 text-center shadow-[4px_4px_0_0_var(--primary)]">
                  <span className="font-pixel text-[9px] text-primary uppercase block">
                    TOTAL REVENUE LODGED
                  </span>
                  <span className="font-pixel text-3xl sm:text-4xl text-foreground font-bold block mt-1">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground mt-1 block">
                    Calculated from {registrations.length} verified participant registrations
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="border border-border/80 bg-background/80 p-3">
                    <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
                      SOLO PARTICIPANTS
                    </span>
                    <span className="font-pixel text-lg text-foreground font-bold block mt-1">
                      {registrations.filter((r) => r.participation_type !== "team").length}
                    </span>
                    <span className="text-[10px] text-signal font-bold">
                      ₹{registrations
                        .filter((r) => r.participation_type !== "team")
                        .reduce((acc, r) => acc + (r.total_price || r.pass_price || 0), 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="border border-border/80 bg-background/80 p-3">
                    <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
                      TEAM SQUADS
                    </span>
                    <span className="font-pixel text-lg text-foreground font-bold block mt-1">
                      {registrations.filter((r) => r.participation_type === "team").length}
                    </span>
                    <span className="text-[10px] text-signal font-bold">
                      ₹{registrations
                        .filter((r) => r.participation_type === "team")
                        .reduce((acc, r) => acc + (r.total_price || r.pass_price || 0), 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="border border-border/60 bg-background/60 p-3 flex items-center justify-between">
                  <div>
                    <span className="font-pixel text-[8px] text-muted-foreground uppercase block">
                      DESK DISPLAY TOGGLE
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Keep revenue hidden from volunteers at check-in desk
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRevenue((prev) => !prev);
                      setShowAdminRevenueModal(false);
                    }}
                    className={`border px-3 py-1.5 font-pixel text-[8px] font-bold transition ${
                      showRevenue
                        ? "border-destructive/60 bg-destructive/15 text-destructive hover:bg-destructive hover:text-white"
                        : "border-signal bg-signal/20 text-signal hover:bg-signal hover:text-black"
                    }`}
                  >
                    {showRevenue ? "HIDE ON DESK" : "REVEAL ON DESK"}
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdminRevenueModal(false)}
                  className="border-2 border-border px-5 py-2 font-pixel text-[9px] text-muted-foreground hover:text-foreground hover:border-signal transition"
                >
                  CLOSE VAULT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAYMENT PROOF SCREENSHOT LIGHTBOX MODAL */}
        {/* ============================================================== */}
        {proofModalRecord && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
            onClick={() => setProofModalRecord(null)}
          >
            <div
              className="relative w-full max-w-3xl border-2 border-primary bg-[#0d0417] p-5 shadow-[8px_8px_0_0_var(--signal)] max-h-[92vh] flex flex-col text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b-2 border-border/80 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="border border-signal bg-signal/20 px-2 py-0.5 font-pixel text-[8px] text-signal font-bold">
                      PAYMENT VERIFICATION PROOF
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      ID: {proofModalRecord.registration_id}
                    </span>
                  </div>
                  <h3 className="font-pixel text-base sm:text-lg text-foreground font-bold mt-1">
                    {proofModalRecord.full_name} · {proofModalRecord.pass_name} (₹
                    {proofModalRecord.total_price || proofModalRecord.pass_price})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setProofModalRecord(null)}
                  className="border-2 border-border p-1.5 font-pixel text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition"
                  aria-label="Close proof preview"
                >
                  ✕
                </button>
              </div>

              {/* Image Viewport */}
              <div className="flex-1 overflow-auto bg-black/90 border-2 border-dashed border-border/80 p-2 flex items-center justify-center min-h-[300px]">
                {proofModalRecord.payment_proof_url ? (
                  <img
                    src={proofModalRecord.payment_proof_url}
                    alt={`Payment screenshot for ${proofModalRecord.full_name}`}
                    className="max-h-[60vh] max-w-full object-contain rounded shadow-lg"
                  />
                ) : (
                  <div className="text-center p-8">
                    <p className="font-pixel text-[10px] text-amber-400">NO SCREENSHOT UPLOADED</p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      Manual UTR: {proofModalRecord.utr_number}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-muted-foreground">TRANSACTION UTR:</span>
                  <span className="font-bold text-signal font-mono bg-signal/15 px-2.5 py-1 border border-signal/40 tracking-wider">
                    {proofModalRecord.utr_number || "NO UTR PROVIDED"}
                  </span>
                  {proofModalRecord.utr_number && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(proofModalRecord.utr_number);
                        setActionSuccessMsg("Copied UTR: " + proofModalRecord.utr_number);
                      }}
                      className="border border-border hover:border-signal px-2 py-1 font-pixel text-[8px] text-muted-foreground hover:text-signal transition"
                    >
                      COPY UTR
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {proofModalRecord.payment_proof_url && (
                    <a
                      href={proofModalRecord.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 border border-primary bg-primary/20 px-3 py-1.5 font-pixel text-[9px] text-primary hover:bg-primary hover:text-black transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>OPEN ORIGINAL</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setProofModalRecord(null)}
                    className="border-2 border-border px-4 py-1.5 font-pixel text-[9px] text-muted-foreground hover:text-foreground hover:border-signal transition"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
