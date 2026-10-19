import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  QrCode,
  ShieldAlert,
  Sparkles,
  Download,
  AlertCircle,
  Users,
  User,
  CreditCard,
  Building,
  Terminal,
  Lock,
} from "lucide-react";
import blackoutLogo from "@/assets/blackout-logo.png";
import paymentQr from "@/assets/payment-qr.png";
import {
  saveRegistration,
  type RegistrationRecord,
  type TeammateInfo,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { BlackoutPassCard } from "@/components/BlackoutPassCard";
import { ChainedLockOverlay } from "@/components/ChainedLockOverlay";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register // BLACKOUT 2026" },
      {
        name: "description",
        content: "Secure your pass for BLACKOUT 2026. A surprise-challenge hackathon in Coimbatore.",
      },
    ],
  }),
  component: RegisterPage,
});

export interface PassTier {
  id: string;
  name: string;
  price: number;
  tag: string;
  badge: string;
  benefits: string[];
  locked?: boolean;
  lockReason?: string;
}

const COMMON_BENEFITS = [
  "12-Hour Secret Hackathon Entry",
  "Meals, Energy Drinks & Snacks",
  "Official BLACKOUT Hacker Kit",
  "Mentorship & Venture Access",
];

const PASS_TIERS: PassTier[] = [
  {
    id: "early-bird",
    name: "EARLY BIRD",
    price: 499,
    tag: "TIER_01",
    badge: "FIRST 20 SEATS ONLY",
    benefits: COMMON_BENEFITS,
    locked: false,
  },
  {
    id: "builder-pass",
    name: "BUILDER PASS",
    price: 699,
    tag: "TIER_02",
    badge: "STANDARD ENTRY",
    benefits: COMMON_BENEFITS,
    locked: true,
    lockReason: "OPENS AFTER FIRST 20 EARLY BIRD PASSES SELL OUT",
  },
  {
    id: "final-call",
    name: "FINAL CALL",
    price: 799,
    tag: "TIER_03",
    badge: "LATE SLOTS",
    benefits: COMMON_BENEFITS,
    locked: true,
    lockReason: "RESERVED FOR FINAL REGISTRATION PHASE",
  },
];

const DEFAULT_UPI_ID = import.meta.env.VITE_UPI_ID || "9843315832@superyes";
const DEFAULT_UPI_NAME = import.meta.env.VITE_UPI_NAME || "PRAJWAL N";

export function RegisterPage() {
  const navigate = useNavigate();

  // Wizard Step: 1 = Pass, 2 = Details, 3 = Payment, 4 = Success Pass
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States - Early Bird is the active open tier
  const [selectedPass, setSelectedPass] = useState<PassTier>(PASS_TIERS[0]);
  const [participationType, setParticipationType] = useState<"solo" | "team">("solo");

  // Hacker Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [tshirtSize, setTshirtSize] = useState("L");

  // Team Squad Details
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState<number>(2); // 2, 3, or 4 members
  const [teammates, setTeammates] = useState<TeammateInfo[]>([
    {
      full_name: "",
      email: "",
      phone: "",
      organization: "",
      tshirt_size: "L",
      github: "",
      linkedin: "",
    },
  ]);

  const handleTeamSizeChange = (newSize: number) => {
    setTeamSize(newSize);
    const needed = newSize - 1;
    setTeammates((prev) => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({
          full_name: "",
          email: "",
          phone: "",
          organization: organization || "",
          tshirt_size: "L",
          github: "",
          linkedin: "",
        });
      }
      return next.slice(0, needed);
    });
  };

  const updateTeammate = (index: number, field: keyof TeammateInfo, value: string) => {
    setTeammates((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const copyLeadCollege = (index: number) => {
    if (!organization) return;
    updateTeammate(index, "organization", organization);
  };

  // Dynamic calculations based on team size
  const activeCount = participationType === "team" ? teamSize : 1;
  const totalAmount = selectedPass.price * activeCount;

  // Payment Details
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentProofBase64, setPaymentProofBase64] = useState<string>("");
  const [paymentProofName, setPaymentProofName] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedRecord, setConfirmedRecord] = useState<RegistrationRecord | null>(null);

  // Blackout Initiation Transition state
  const [isInitiatingBlackout, setIsInitiatingBlackout] = useState(false);
  const [initiationStep, setInitiationStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL query param on mount if provided (e.g. /register?pass=early-bird)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const passParam = params.get("pass");
      if (passParam) {
        const found = PASS_TIERS.find(
          (p) => p.id === passParam || p.name.toLowerCase().includes(passParam.toLowerCase())
        );
        if (found) setSelectedPass(found);
      }
    }
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(DEFAULT_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB limit.");
      return;
    }

    setErrorMsg("");
    setPaymentProofName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentProofBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step 2 Form Validation
  const validateStep2 = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim() || !email.includes("@")) return "A valid email address is required.";
    if (!phone.trim() || phone.length < 10) return "A valid 10-digit WhatsApp/phone number is required.";
    if (!organization.trim()) return "College or company name is required.";

    if (participationType === "team") {
      if (!teamName.trim()) return "Squad / Team name is required for team registration.";

      for (let i = 0; i < teammates.length; i++) {
        const tm = teammates[i];
        const num = i + 2;
        if (!tm.full_name.trim()) {
          return `Please enter the full name for Teammate ${num} (Operative 0${num}).`;
        }
        if (!tm.email.trim() || !tm.email.includes("@")) {
          return `Please enter a valid email address for Teammate ${num} (Operative 0${num}).`;
        }
        if (!tm.phone.trim() || tm.phone.length < 10) {
          return `Please enter a valid 10-digit WhatsApp/phone number for Teammate ${num} (Operative 0${num}).`;
        }
        if (!tm.organization.trim()) {
          return `Please enter the college or company for Teammate ${num} (Operative 0${num}).`;
        }
      }
    }
    return "";
  };

  // Step 3 Payment Validation
  const validateStep3 = () => {
    if (!utrNumber.trim() || utrNumber.length < 6) {
      return "Please enter the valid 12-digit UPI / UTR Transaction Reference ID.";
    }
    if (!paymentProofBase64) {
      return "Please upload the payment screenshot as proof of transaction.";
    }
    return "";
  };

  const handleSubmitRegistration = async () => {
    const err = validateStep3();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Generate unique registration ID: BLK-2026-XXXXXX
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const regId = `BLK-2026-${randomHex}`;

    const record: RegistrationRecord = {
      registration_id: regId,
      pass_name: selectedPass.name,
      pass_price: selectedPass.price,
      participation_type: participationType,
      team_size: activeCount,
      total_price: totalAmount,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organization: organization.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
      team_name: participationType === "team" ? teamName.trim() : undefined,
      team_members:
        participationType === "team"
          ? teammates
              .filter((t) => t.full_name.trim())
              .map((t) => `${t.full_name.trim()} (${t.tshirt_size || "L"})`)
          : undefined,
      team_members_details:
        participationType === "team"
          ? [
              {
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                organization: organization.trim(),
                tshirt_size: tshirtSize,
                github: github.trim(),
                linkedin: linkedin.trim(),
              },
              ...teammates.filter((t) => t.full_name.trim()),
            ]
          : undefined,
      utr_number: utrNumber.trim(),
      payment_proof_url: paymentProofBase64,
      qr_code_data: `BLACKOUT_PASS|${regId}|${fullName.trim()}|${selectedPass.name}|${activeCount}`,
      check_in_token: regId,
      checked_in: false,
      checked_in_at: null,
      checked_in_by: null,
      status: "pending_verification",
      created_at: new Date().toISOString(),
    };

    const res = await saveRegistration(record);
    setIsSubmitting(false);

    if (res.success) {
      setConfirmedRecord(record);
      setIsInitiatingBlackout(true);
      setInitiationStep(1);

      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(160, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch {
        // audio context blocked or unavailable, ignore
      }

      setTimeout(() => setInitiationStep(2), 350);
      setTimeout(() => setInitiationStep(3), 750);
      setTimeout(() => {
        setIsInitiatingBlackout(false);
        setStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1200);
    } else {
      setErrorMsg(res.error || "Failed to submit registration. Please try again.");
    }
  };

  // Dynamic UPI Deep Link
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(DEFAULT_UPI_ID)}&pn=${encodeURIComponent(
    DEFAULT_UPI_NAME
  )}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`BLACKOUT_${selectedPass.name.replace(/\s+/g, "_")}_${activeCount}X`)}`;

  return (
    <div className="crt min-h-screen bg-[#07020d] text-foreground select-none pb-24">
      {/* FULL-SCREEN BLACKOUT OVERRIDE SEQUENCE */}
      {isInitiatingBlackout && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black text-foreground p-6 select-none overflow-hidden animate-fade-in">
          {/* Background CRT scanline and purple grid */}
          <div className="absolute inset-0 pixel-grid opacity-20" />
          <div className="absolute inset-0 scanline pointer-events-none opacity-40" />

          {/* Big Flickering Blackout Logo */}
          <div className="relative mb-8">
            <img
              src={blackoutLogo}
              alt="BLACKOUT"
              className="h-16 md:h-24 w-auto object-contain animate-flicker drop-shadow-[0_0_45px_rgba(168,85,247,0.95)]"
            />
          </div>

          {/* Terminal Sequence Box */}
          <div className="relative z-10 w-full max-w-md border-2 border-primary bg-[#08020e]/95 p-6 shadow-[8px_8px_0_0_var(--signal)]">
            <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
              <span className="font-pixel text-[9px] text-signal flex items-center gap-2">
                <span className="animate-blink">●</span>
                <span>REGISTRATION CONFIRMED</span>
              </span>
              <span className="font-mono text-xs text-muted-foreground">ARENA 2026</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs sm:text-sm">
              <p className="text-signal flex items-center gap-2">
                <span>&gt;</span>
                <span>PAYMENT PROOF LOGGED: [VERIFIED]</span>
              </p>

              {initiationStep >= 2 && (
                <p className="text-primary flex items-center gap-2 animate-fade-in">
                  <span>&gt;</span>
                  <span>GENERATING BLACKOUT PASS...</span>
                </p>
              )}

              {initiationStep >= 3 && (
                <p className="text-foreground font-bold flex items-center gap-2 animate-fade-in">
                  <span>&gt;</span>
                  <span className="text-signal font-pixel text-xs">
                    WELCOME TO THE BLACKOUT!
                  </span>
                </p>
              )}
            </div>

            {/* Skip Button */}
            <div className="mt-5 flex justify-end border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsInitiatingBlackout(false);
                  setStep(4);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-signal/60 bg-signal/10 px-3 py-1 font-pixel text-[8px] text-signal hover:bg-signal hover:text-black transition active:scale-95"
              >
                SKIP ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP RETRO NAV BAR */}
      <header className="sticky top-0 z-50 border-b-2 border-border/70 bg-[#07020d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 border-2 border-border px-3 py-1.5 font-pixel text-[9px] text-muted-foreground hover:border-signal hover:text-signal transition"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>HQ / RETURN</span>
          </Link>

          <div className="flex items-center gap-2">
            <img src={blackoutLogo} alt="BLACKOUT" className="h-6 w-auto" />
            <span className="hidden sm:inline-block font-pixel text-[10px] text-primary">
              REGISTRATION_GATEWAY
            </span>
          </div>

          <div className="flex items-center gap-2 font-pixel text-[9px] text-signal">
            <span className="animate-blink">●</span>
            <span className="hidden sm:inline">LIVE ARENA 2026</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-10">
        {/* PROGRESS STEPPER */}
        <div className="mb-10">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 font-pixel text-[8px] sm:text-[10px] text-center">
            {[
              { num: 1, label: "01 // PASS" },
              { num: 2, label: "02 // INTEL" },
              { num: 3, label: "03 // CLEARANCE" },
              { num: 4, label: "04 // RECEIPT" },
            ].map((s) => (
              <div
                key={s.num}
                className={`border-2 py-2.5 transition-all ${
                  step === s.num
                    ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--signal)] font-bold"
                    : step > s.num
                    ? "border-signal/70 bg-signal/10 text-signal"
                    : "border-border/50 bg-background/50 text-muted-foreground"
                }`}
              >
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 border-2 border-destructive bg-destructive/15 p-4 font-mono text-xs text-destructive animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: SELECT PASS TIER & PARTICIPATION TYPE */}
        {/* ============================================================== */}
        {step === 1 && (
          <section className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="font-pixel text-2xl sm:text-4xl text-foreground">
                SELECT YOUR <span className="text-primary">PASS TIER</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-mono">
                12-Hour Hackathon · Early Bird valid for first 20 members only.
              </p>
            </div>

            {/* Participation Type Toggle */}
            <div className="mb-6 flex justify-center">
              <div className="inline-flex border-2 border-border p-1 bg-background">
                <button
                  type="button"
                  onClick={() => setParticipationType("solo")}
                  className={`flex items-center gap-2 px-5 py-2 font-pixel text-[9px] transition-all ${
                    participationType === "solo"
                      ? "bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--signal)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>SOLO HACKER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setParticipationType("team")}
                  className={`flex items-center gap-2 px-5 py-2 font-pixel text-[9px] transition-all ${
                    participationType === "team"
                      ? "bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--signal)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>TEAM SQUAD</span>
                </button>
              </div>
            </div>

            {/* Team Squad Size Selector */}
            {participationType === "team" && (
              <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 animate-fade-in">
                <span className="font-pixel text-[9px] text-muted-foreground uppercase">
                  SQUAD SIZE:
                </span>
                {[2, 3, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleTeamSizeChange(size)}
                    className={`border-2 px-4 py-1.5 font-pixel text-[10px] transition ${
                      teamSize === size
                        ? "border-primary bg-primary text-primary-foreground font-bold shadow-[2px_2px_0_0_var(--signal)]"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size} BUILDERS
                  </button>
                ))}
              </div>
            )}

            {/* Passes Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {PASS_TIERS.map((tier) => {
                const isSelected = selectedPass.id === tier.id;
                const tierTotal = tier.price * activeCount;

                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      if (tier.locked) return;
                      setSelectedPass(tier);
                    }}
                    className={`relative border-2 p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden select-none ${
                      tier.locked
                        ? "border-border/50 bg-[#090312]/60 cursor-not-allowed"
                        : isSelected
                        ? "border-primary bg-primary/10 shadow-[8px_8px_0_0_var(--primary)] -translate-y-1 cursor-pointer"
                        : "border-border bg-background/60 hover:border-foreground/50 hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.5)] cursor-pointer"
                    }`}
                  >
                    {/* Chained and Locked Overlay for Locked Tiers */}
                    {tier.locked && (
                      <ChainedLockOverlay
                        tierName={tier.name}
                        badgeText="TIER LOCKED // SEALED"
                        subText="OPENS AFTER FIRST 20 EARLY BIRD PASSES SELL OUT"
                      />
                    )}

                    <div>
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <span className="font-term text-lg text-signal">{tier.tag}</span>
                        <span className="font-pixel text-[8px] bg-card px-2 py-0.5 border border-border text-muted-foreground">
                          {tier.badge}
                        </span>
                      </div>

                      <h3 className="mt-4 font-pixel text-base text-foreground">{tier.name}</h3>

                      <div className="mt-4 flex items-baseline gap-1.5">
                        <span className="font-pixel text-3xl sm:text-4xl text-foreground font-bold">
                          ₹{tierTotal}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {participationType === "team"
                            ? `(${activeCount} × ₹${tier.price})`
                            : "/ builder"}
                        </span>
                      </div>

                      <ul className="mt-5 space-y-2 border-t border-border/40 pt-4 font-term text-lg text-muted-foreground">
                        {tier.benefits.map((b) => (
                          <li key={b} className="flex items-center gap-2">
                            <span className="text-signal font-bold">✔</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={tier.locked}
                      onClick={(e) => {
                        if (tier.locked) {
                          e.stopPropagation();
                          return;
                        }
                        setSelectedPass(tier);
                      }}
                      className={`mt-6 w-full border-2 py-2.5 font-pixel text-[9px] uppercase tracking-wider transition ${
                        tier.locked
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--signal)] font-bold"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {tier.locked ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Lock className="h-3 w-3 text-amber-400" />
                          <span>LOCKED // SEALED</span>
                        </span>
                      ) : isSelected ? (
                        "● SELECTED"
                      ) : (
                        "SELECT TIER"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Actions */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div className="font-mono text-xs sm:text-sm">
                <span className="text-muted-foreground">TOTAL: </span>
                <span className="font-pixel text-lg sm:text-xl text-signal font-bold">₹{totalAmount}</span>
                <span className="text-muted-foreground text-xs ml-2">
                  ({selectedPass.name} · {activeCount} {activeCount === 1 ? "builder" : "builders"})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 border-2 border-primary bg-primary px-8 py-3.5 font-pixel text-xs text-primary-foreground shadow-[5px_5px_0_0_var(--signal)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95"
              >
                <span>CONTINUE TO DETAILS (₹{totalAmount})</span>
                <span>▶</span>
              </button>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 2: PARTICIPANT / SQUAD DETAILS */}
        {/* ============================================================== */}
        {step === 2 && (
          <section className="animate-fade-in">
            <div className="border-2 border-border bg-background p-6 sm:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.8)]">
              <div className="border-b-2 border-border pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-pixel text-xl sm:text-2xl text-foreground">
                    HACKER DETAILS
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {participationType === "team"
                      ? `Team Lead + ${teamSize - 1} Teammates (${teamSize} Builders Total)`
                      : "Solo Registrant"}
                  </p>
                </div>
                <div className="border border-signal bg-signal/10 px-3.5 py-1.5 font-pixel text-[10px] text-signal font-bold shadow-[2px_2px_0_0_var(--signal)]">
                  TOTAL DUE: ₹{totalAmount}
                </div>
              </div>

              {/* SQUAD NAME & SIZE CONFIG (FOR TEAMS) */}
              {participationType === "team" && (
                <div className="mb-8 border-2 border-primary/50 bg-primary/10 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/30 pb-3">
                    <div className="flex items-center gap-2 font-pixel text-[10px] text-primary">
                      <Users className="h-4 w-4" />
                      <span>SQUAD REGISTRATION // {teamSize} BUILDERS TOTAL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[8px] text-muted-foreground uppercase">
                        SQUAD SIZE:
                      </span>
                      {[2, 3, 4].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleTeamSizeChange(size)}
                          className={`border-2 px-3 py-1 font-pixel text-[9px] transition ${
                            teamSize === size
                              ? "border-signal bg-signal text-black font-bold shadow-[2px_2px_0_0_var(--primary)]"
                              : "border-border bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {size}P
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      Squad / Team Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ZeroDay Hustlers"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* OPERATIVE 01 // SQUAD LEAD (PRIMARY REGISTRANT) */}
              {/* ============================================================== */}
              <div className="border-2 border-border/90 bg-card/40 p-5 sm:p-6 mb-8 space-y-5 shadow-[4px_4px_0_0_rgba(0,0,0,0.6)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
                    <span className="font-pixel text-[10px] text-signal font-bold">
                      {participationType === "team"
                        ? "⚡ OPERATIVE 01 // SQUAD LEAD (PRIMARY REGISTRANT)"
                        : "OPERATIVE CREDENTIALS"}
                    </span>
                  </div>
                  {participationType === "team" && (
                    <span className="border border-signal/60 bg-signal/15 px-2.5 py-0.5 font-pixel text-[8px] text-signal">
                      PRIMARY CONTACT
                    </span>
                  )}
                </div>

                {/* Full Name & Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karthick Mayur"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. karthick@buildicy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone & Organization */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      College / Company *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PSG Tech / Builder"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* GitHub & LinkedIn */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      GitHub URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/handle"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      LinkedIn URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/handle"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* T-Shirt Size */}
                <div>
                  <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                    Official Swag Hoodie / T-Shirt Size
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {["S", "M", "L", "XL", "XXL"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTshirtSize(sz)}
                        className={`border-2 px-3.5 py-1.5 font-pixel text-[10px] transition ${
                          tshirtSize === sz
                            ? "border-primary bg-primary text-primary-foreground font-bold shadow-[2px_2px_0_0_var(--signal)]"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ============================================================== */}
              {/* OPERATIVES 02, 03, 04 // SQUAD TEAMMATES WITH COMPLETE PROFILES */}
              {/* ============================================================== */}
              {participationType === "team" && (
                <div className="space-y-6">
                  {teammates.map((tm, idx) => {
                    const memberNumber = idx + 2;
                    return (
                      <div
                        key={idx}
                        className="border-2 border-primary/50 bg-[#0d0417] p-5 sm:p-6 space-y-5 animate-fade-in shadow-[6px_6px_0_0_var(--primary)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-[10px] text-primary font-bold">
                              👥 OPERATIVE 0{memberNumber} // SQUAD TEAMMATE
                            </span>
                          </div>
                          {organization && (
                            <button
                              type="button"
                              onClick={() => copyLeadCollege(idx)}
                              className="border border-border/80 bg-background/80 px-2.5 py-1 font-mono text-[10px] text-muted-foreground hover:border-signal hover:text-signal transition active:scale-95"
                            >
                              🏢 COPY LEAD'S COLLEGE
                            </button>
                          )}
                        </div>

                        {/* Full Name & Email */}
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              placeholder={`e.g. Teammate ${memberNumber} Name`}
                              value={tm.full_name}
                              onChange={(e) => updateTeammate(idx, "full_name", e.target.value)}
                              className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              placeholder={`e.g. teammate${memberNumber}@buildicy.com`}
                              value={tm.email}
                              onChange={(e) => updateTeammate(idx, "email", e.target.value)}
                              className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* WhatsApp Phone & Organization */}
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                              WhatsApp / Phone Number *
                            </label>
                            <input
                              type="tel"
                              placeholder="+91 98765 00000"
                              value={tm.phone}
                              onChange={(e) => updateTeammate(idx, "phone", e.target.value)}
                              className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                              College / Company *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. PSG Tech / Builder"
                              value={tm.organization}
                              onChange={(e) => updateTeammate(idx, "organization", e.target.value)}
                              className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* GitHub & LinkedIn */}
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                              GitHub URL (Optional)
                            </label>
                            <input
                              type="url"
                              placeholder="https://github.com/handle"
                              value={tm.github || ""}
                              onChange={(e) => updateTeammate(idx, "github", e.target.value)}
                              className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                              LinkedIn URL (Optional)
                            </label>
                            <input
                              type="url"
                              placeholder="https://linkedin.com/in/handle"
                              value={tm.linkedin || ""}
                              onChange={(e) => updateTeammate(idx, "linkedin", e.target.value)}
                              className="w-full border-2 border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* T-Shirt Size */}
                        <div>
                          <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                            Official Swag Hoodie / T-Shirt Size
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            {["S", "M", "L", "XL", "XXL"].map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => updateTeammate(idx, "tshirt_size", sz)}
                                className={`border-2 px-3.5 py-1.5 font-pixel text-[10px] transition ${
                                  tm.tshirt_size === sz
                                    ? "border-primary bg-primary text-primary-foreground font-bold shadow-[2px_2px_0_0_var(--signal)]"
                                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 border-2 border-border px-5 py-2.5 font-pixel text-[9px] text-muted-foreground hover:border-foreground hover:text-foreground transition"
                >
                  ◀ BACK
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const err = validateStep2();
                    if (err) {
                      setErrorMsg(err);
                      return;
                    }
                    setErrorMsg("");
                    setStep(3);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 border-2 border-primary bg-primary px-8 py-3.5 font-pixel text-xs text-primary-foreground shadow-[5px_5px_0_0_var(--signal)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95"
                >
                  <span>PROCEED TO PAYMENT (₹{totalAmount})</span>
                  <span>▶</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 3: UPI PAYMENT CLEARANCE & PROOF UPLOAD */}
        {/* ============================================================== */}
        {step === 3 && (
          <section className="animate-fade-in">
            <div className="border-2 border-border bg-background p-6 sm:p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.8)]">
              <div className="border-b-2 border-border pb-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-pixel text-xl sm:text-2xl text-foreground">
                    UPI PAYMENT
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    Scan QR or use UPI ID · Attach transaction screenshot
                  </p>
                </div>
                <div className="border-2 border-signal bg-signal/10 px-3.5 py-1.5 font-pixel text-xs text-signal font-bold shadow-[2px_2px_0_0_var(--signal)]">
                  TOTAL DUE: ₹{totalAmount}
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* LEFT: QR CODE DISPLAY & UPI DETAILS */}
                <div className="flex flex-col items-center justify-center border-2 border-primary/40 bg-card/60 p-6 text-center">
                  <div className="flex items-center gap-2 font-pixel text-[9px] text-primary mb-3">
                    <QrCode className="h-4 w-4" />
                    <span>SCAN &amp; PAY ₹{totalAmount}</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="relative rounded-2xl border-4 border-foreground bg-white p-3.5 shadow-[6px_6px_0_0_var(--primary)] group overflow-hidden">
                    <div className="relative flex flex-col items-center justify-center h-52 w-52 bg-white">
                      <img
                        src={paymentQr}
                        alt="BLACKOUT Payment QR Code (9843315832@superyes)"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="scanline pointer-events-none absolute inset-0 opacity-20" />
                  </div>

                  {/* Payee Info & UPI ID Copy Pill */}
                  <div className="mt-5 w-full rounded-lg border-2 border-border bg-background p-3.5 text-left font-mono text-xs">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-pixel mb-1.5">
                      <span>PAYEE: PRAJWAL N</span>
                      <span className="text-signal font-bold">VERIFIED UPI</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/60">
                      <span className="text-foreground select-all font-bold tracking-wider">
                        {DEFAULT_UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="flex items-center gap-1 border border-signal/60 bg-signal/15 px-2.5 py-1 font-pixel text-[8px] text-signal hover:bg-signal hover:text-black transition active:scale-95"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="h-3 w-3" /> COPIED!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> COPY UPI ID
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: UTR NUMBER & SCREENSHOT PROOF UPLOAD */}
                <div className="flex flex-col justify-between space-y-5">
                  {/* UTR Number */}
                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      12-Digit UPI / UTR Transaction ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 429381749201"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="w-full border-2 border-border bg-card px-4 py-2.5 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 font-term text-sm text-muted-foreground">
                      Found in your GPay / PhonePe / Paytm receipt
                    </p>
                  </div>

                  {/* Payment Proof Upload Area */}
                  <div>
                    <label className="block font-pixel text-[9px] text-muted-foreground uppercase mb-2">
                      Payment Screenshot Proof *
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {paymentProofBase64 ? (
                      <div className="relative border-2 border-primary bg-primary/10 p-4 text-center">
                        <img
                          src={paymentProofBase64}
                          alt="Payment Screenshot Proof"
                          className="mx-auto max-h-44 object-contain rounded border border-border"
                        />
                        <p className="mt-2 font-mono text-xs text-signal truncate">
                          ✔ {paymentProofName}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 inline-block border border-border px-3 py-1 font-pixel text-[8px] text-muted-foreground hover:text-foreground hover:border-primary transition"
                        >
                          CHANGE SCREENSHOT
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-border bg-card/40 p-5 text-center hover:border-primary transition"
                      >
                        <Upload className="mx-auto h-7 w-7 text-primary mb-1.5" />
                        <p className="font-pixel text-[9px] text-foreground">
                          CLICK TO UPLOAD SCREENSHOT
                        </p>
                        <p className="mt-1 font-term text-sm text-muted-foreground">
                          JPG, PNG, or WEBP (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Database persistence status pill */}
                  <div className="border border-border/60 bg-card/60 p-2.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <Terminal className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      {isSupabaseConfigured
                        ? "Connected to Supabase live database."
                        : "Ready for Supabase (local vault enabled)."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 border-2 border-border px-5 py-2.5 font-pixel text-[9px] text-muted-foreground hover:border-foreground hover:text-foreground transition"
                >
                  ◀ BACK
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitRegistration}
                  className="flex items-center gap-2 border-2 border-primary bg-primary px-8 py-3.5 font-pixel text-xs text-primary-foreground shadow-[5px_5px_0_0_var(--signal)] hover:translate-x-0.5 hover:translate-y-0.5 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>SUBMITTING...</span>
                  ) : (
                    <>
                      <span>SUBMIT &amp; CLAIM PASS (₹{totalAmount})</span>
                      <span>▶</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 4: PASS CONFIRMED & "WELCOME TO THE BLACKOUT" SHOWCASE */}
        {/* ============================================================== */}
        {step === 4 && confirmedRecord && (
          <section className="animate-fade-in max-w-4xl mx-auto">
            <BlackoutPassCard record={confirmedRecord} />
          </section>
        )}
      </main>
    </div>
  );
}
