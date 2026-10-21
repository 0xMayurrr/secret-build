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
  Lock,
} from "lucide-react";
import blackoutLogo from "@/assets/blackout-logo.png";
import paymentQr from "@/assets/payment-qr.png";
import {
  saveRegistration,
  type RegistrationRecord,
  type TeammateInfo,
} from "@/lib/supabase";
import { BlackoutPassCard } from "@/components/BlackoutPassCard";
import { Lanyard } from "@/components/Lanyard";
import { generateBadgeFrontSvg, generateBadgeBackSvg } from "@/lib/badgeTexture";
import { blackoutAudio } from "@/lib/blackout-audio";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register // BLACKOUT 2026" },
      {
        name: "description",
        content: "Secure your pass for BLACKOUT 2026. A 12-hour surprise-challenge hackathon in Coimbatore.",
      },
      { property: "og:site_name", content: "BLACKOUT 2026 — Buildicy" },
      { property: "og:title", content: "Register // BLACKOUT 2026" },
      {
        property: "og:description",
        content: "Secure your pass for BLACKOUT 2026. A 12-hour surprise-challenge hackathon in Coimbatore.",
      },
      { property: "og:url", content: "https://blackout.buildicy.com/register" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://blackout.buildicy.com/og-banner.png" },
      { property: "og:image:secure_url", content: "https://blackout.buildicy.com/og-banner.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "471" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Register // BLACKOUT 2026" },
      {
        name: "twitter:description",
        content: "Secure your pass for BLACKOUT 2026. A 12-hour surprise-challenge hackathon in Coimbatore.",
      },
      { name: "twitter:image", content: "https://blackout.buildicy.com/og-banner.png" },
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

type AudienceType = "student" | "developer" | "professional";

const AUDIENCE_OPTIONS: {
  id: AudienceType;
  label: string;
  tag: string;
  glyph: string;
  title: string;
  description: string;
  benefits: string[];
}[] = [
  {
    id: "student",
    label: "THE NEXT GENERATION",
    tag: "PATH_01",
    glyph: "◈",
    title: "STUDENT",
    description: "Build your skills, take on a mystery challenge, and explore new career opportunities.",
    benefits: [
      "12-hour BLACKOUT hackathon entry",
      "Complimentary access to the 30-day AI Tools Accelerator Program worth ₹1,500",
      "Potential internship consideration based on performance and eligibility",
    ],
  },
  {
    id: "developer",
    label: "THE BUILDER",
    tag: "PATH_02",
    glyph: "⌘",
    title: "DEVELOPER",
    description: "Put your technical skills to the test and build something under pressure.",
    benefits: [
      "12-hour BLACKOUT hackathon entry",
      "Complimentary access to the 30-day AI Tools Accelerator Program worth ₹1,500",
      "Opportunities to showcase technical skills and explore potential project collaborations",
    ],
  },
  {
    id: "professional",
    label: "THE INNOVATOR",
    tag: "PATH_03",
    glyph: "◆",
    title: "PROFESSIONAL",
    description: "Experiment with new ideas, explore AI workflows, and connect with other builders.",
    benefits: [
      "12-hour BLACKOUT hackathon entry",
      "Complimentary access to the 30-day AI Tools Accelerator Program worth ₹1,500",
      "Networking and potential professional, product, or startup collaboration opportunities",
    ],
  },
];

const BLACKOUT_PASS_PRICE = 799;

const COMMON_BENEFITS = [
  "12-Hour Secret Hackathon Entry",
  "Meals, Energy Drinks & Snacks",
  "Official BLACKOUT Hacker Kit",
  "Mentorship & Venture Access",
];

const PASS_TIERS: PassTier[] = [
  {
    id: "blackout-builder",
    name: "BLACKOUT BUILDER PASS",
    price: BLACKOUT_PASS_PRICE,
    tag: "TIER_01",
    badge: "ALL BUILDERS",
    benefits: COMMON_BENEFITS,
    locked: false,
  },
];

const DEFAULT_UPI_ID = import.meta.env.VITE_UPI_ID || "9843315832@superyes";
const DEFAULT_UPI_NAME = import.meta.env.VITE_UPI_NAME || "PRAJWAL N";

export function RegisterPage() {
  const navigate = useNavigate();

  // Wizard Step: 1 = Pass, 2 = Details, 3 = Payment, 4 = Success Pass
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Audio Engine State
  const [isAudioMuted, setIsAudioMuted] = useState(blackoutAudio.getIsMuted());

  useEffect(() => {
    // Attempt ambient music immediately on mount
    blackoutAudio.startAmbientMusic();

    const unlockAudio = () => {
      blackoutAudio.startAmbientMusic();
      setIsAudioMuted(blackoutAudio.getIsMuted());
      window.removeEventListener("pointerdown", unlockAudio, { capture: true });
      window.removeEventListener("touchstart", unlockAudio, { capture: true });
      window.removeEventListener("keydown", unlockAudio, { capture: true });
    };

    window.addEventListener("pointerdown", unlockAudio, { capture: true });
    window.addEventListener("touchstart", unlockAudio, { capture: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio, { capture: true });
      window.removeEventListener("touchstart", unlockAudio, { capture: true });
      window.removeEventListener("keydown", unlockAudio, { capture: true });
    };
  }, []);

  const handleToggleAudio = () => {
    const muted = blackoutAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  // Form States - Audience + single pass
  const [selectedPass] = useState<PassTier>(PASS_TIERS[0]);
  const [audienceType, setAudienceType] = useState<AudienceType>("student");
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
      audience_type: audienceType,
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
    <div className="crt min-h-screen bg-[#07020d] text-foreground select-none pb-24" style={{ zoom: "90%" }}>
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

          <div className="w-20 hidden sm:block" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-10">
        {/* PROGRESS STEPPER — minimal dot + line */}
        <div className="mb-10 flex items-center justify-center gap-0">
          {[
            { num: 1, label: "PATH" },
            { num: 2, label: "INFO" },
            { num: 3, label: "PAY" },
            { num: 4, label: "PASS" },
          ].map((s, i) => (
            <>
              {/* Dot + label */}
              <div key={s.num} className="flex flex-col items-center gap-1.5">
                <div className={`h-7 w-7 flex items-center justify-center border-2 font-pixel text-[9px] transition-all ${
                  step === s.num
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                    : step > s.num
                    ? "border-signal bg-signal/20 text-signal"
                    : "border-border/40 bg-transparent text-muted-foreground/50"
                }`}>
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className={`font-pixel text-[8px] tracking-widest ${
                  step === s.num ? "text-primary" : step > s.num ? "text-signal" : "text-muted-foreground/40"
                }`}>{s.label}</span>
              </div>
              {/* Connector line */}
              {i < 3 && (
                <div className={`h-px w-12 sm:w-20 mb-5 mx-1 transition-all ${
                  step > s.num ? "bg-signal" : "bg-border/30"
                }`} />
              )}
            </>
          ))}
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
                WHO ARE <span className="text-primary">YOU?</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-mono">
                Select your path · BLACKOUT BUILDER PASS · ₹{BLACKOUT_PASS_PRICE} per participant
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
                <span className="font-pixel text-[9px] text-muted-foreground uppercase">SQUAD SIZE:</span>
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

            {/* Audience Path Cards */}
            <div className="grid gap-5 md:grid-cols-3">
              {AUDIENCE_OPTIONS.map((opt) => {
                const isSelected = audienceType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setAudienceType(opt.id)}
                    className={`relative flex flex-col border-2 p-6 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-[8px_8px_0_0_var(--primary)] -translate-y-1"
                        : "border-border bg-background/60 hover:border-foreground/50 hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    {/* Tag + glyph */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <span className="font-term text-lg text-signal">{opt.tag}</span>
                      <span className={`font-pixel text-2xl ${
                        isSelected ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]" : "text-muted-foreground"
                      }`}>{opt.glyph}</span>
                    </div>

                    {/* Title + label */}
                    <h3 className="mt-4 font-pixel text-base text-foreground">{opt.title}</h3>
                    <p className={`mt-1 font-term text-lg ${
                      isSelected ? "text-primary" : "text-muted-foreground"
                    }`}>{opt.label}</p>

                    {/* Description */}
                    <p className="mt-3 font-mono text-xs text-muted-foreground leading-relaxed">
                      &gt; {opt.description}
                    </p>

                    {/* Benefits */}
                    <ul className="mt-4 space-y-2 border-t border-border/40 pt-4 font-term text-base text-muted-foreground flex-1">
                      {opt.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className="text-signal font-bold shrink-0">✔</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Select button */}
                    <button
                      type="button"
                      onClick={() => setAudienceType(opt.id)}
                      className={`mt-6 w-full border-2 py-2.5 font-pixel text-[9px] uppercase tracking-wider transition ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--signal)] font-bold"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {isSelected ? "● SELECTED" : "SELECT PATH"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pass summary */}
            <div className="mt-8 border-2 border-primary/40 bg-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="font-pixel text-[9px] text-primary">BLACKOUT BUILDER PASS</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    ₹{BLACKOUT_PASS_PRICE} × {activeCount} {activeCount === 1 ? "builder" : "builders"} · All paths include the same benefits
                  </p>
                </div>
              </div>
              <div className="font-pixel text-xl text-signal font-bold">₹{totalAmount}</div>
            </div>

            {/* Step 1 Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div className="font-mono text-xs sm:text-sm">
                <span className="text-muted-foreground">TOTAL: </span>
                <span className="font-pixel text-lg sm:text-xl text-signal font-bold">₹{totalAmount}</span>
                <span className="text-muted-foreground text-xs ml-2">
                  ({audienceType.toUpperCase()} · {activeCount} {activeCount === 1 ? "builder" : "builders"})
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
                    Scan QR with any UPI app · Attach transaction screenshot
                  </p>
                </div>
                <div className="border-2 border-signal bg-signal/10 px-3.5 py-1.5 font-pixel text-xs text-signal font-bold shadow-[2px_2px_0_0_var(--signal)]">
                  TOTAL DUE: ₹{totalAmount}
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* LEFT: QR CODE DISPLAY */}
                <div className="flex flex-col items-center justify-center border-2 border-primary/40 bg-card/60 p-6 text-center">
                  <div className="flex items-center gap-2 font-pixel text-[9px] text-primary mb-3">
                    <QrCode className="h-4 w-4" />
                    <span>SCAN &amp; PAY ₹{totalAmount}</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="relative rounded-2xl border-4 border-foreground bg-white p-3.5 shadow-[6px_6px_0_0_var(--primary)] group overflow-hidden">
                    <div className="relative flex flex-col items-center justify-center h-60 w-60 bg-white">
                      <img
                        src={paymentQr}
                        alt="BLACKOUT Payment QR Code (9843315832@superyes)"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="scanline pointer-events-none absolute inset-0 opacity-20" />
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

              {/* Assistance & Helpline */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded border border-border/60 bg-card/40 px-4 py-2.5 font-mono text-xs text-muted-foreground">
                <span className="text-foreground">Need registration or payment assistance?</span>
                <div className="flex flex-wrap items-center gap-4">
                  <a href="mailto:buildicy@gmail.com" className="text-primary hover:underline">
                    buildicy@gmail.com
                  </a>
                  <span>·</span>
                  <a href="tel:+919843315832" className="text-signal hover:underline">
                    +91 9843315832
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* STEP 4: PASS CONFIRMED & "WELCOME TO THE BLACKOUT" SHOWCASE */}
        {/* ============================================================== */}
        {step === 4 && confirmedRecord && (
          <section className="animate-fade-in max-w-4xl mx-auto space-y-8">
            {/* WHATSAPP COMMUNITY CTA BANNER */}
            <div className="border-2 border-[#25D366] bg-[#25D366]/10 p-4 sm:p-5 text-center shadow-[4px_4px_0_0_#25D366] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <span className="font-pixel text-[9px] text-[#25D366] uppercase tracking-wider block">
                  ✦ OFFICIAL BUILDER COMM PROTOCOL ✦
                </span>
                <h3 className="font-pixel text-sm sm:text-base text-foreground mt-0.5">
                  JOIN THE OFFICIAL BLACKOUT WHATSAPP COMMUNITY
                </h3>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  Connect with fellow hackers, find teammates, and receive secret challenge drops.
                </p>
              </div>
              <a
                href="https://chat.whatsapp.com/HkVymLAsg5dFZlcwstg9xK?s=cl&p=a&mlu=4&ilr=4"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 border-2 border-[#25D366] bg-[#25D366] px-5 py-3 font-pixel text-xs text-black font-bold shadow-[3px_3px_0_0_#000] hover:bg-[#25D366]/90 transition active:scale-95 cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 0 1-5.82 2.41c-1.43 0-2.83-.37-4.07-1.08l-.29-.17-3.03.8 1.05-2.96-.19-.3a8.214 8.214 0 0 1-1.21-4.34c0-4.54 3.7-8.24 8.24-8.24m4.54 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.62.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
                </svg>
                <span>JOIN WHATSAPP COMMUNITY ▶</span>
              </a>
            </div>

            <BlackoutPassCard
              record={confirmedRecord}
              badgeTopSlot={
                <div className="relative w-screen left-1/2 -translate-x-1/2 flex flex-col items-center justify-center overflow-visible pointer-events-auto select-none my-2">
                  <div className="h-[680px] sm:h-[760px] md:h-[840px] w-full flex items-center justify-center relative overflow-visible">
                    <Lanyard
                      frontImage={generateBadgeFrontSvg(confirmedRecord)}
                      backImage={generateBadgeBackSvg(confirmedRecord)}
                      cardColor="#0a0314"
                      finish="glossy"
                      metal="silver"
                      strapColor="#7e22ce"
                      orientation="portrait"
                      size={0.68}
                      strapLength={0.52}
                      interactive={true}
                      intro={true}
                    />
                  </div>

                  <p className="mt-1 text-center font-pixel text-[8px] sm:text-[9px] text-muted-foreground tracking-widest select-none">
                    ✦ PHYSICAL LANYARD &amp; RFID BADGE ISSUED AT COIMBATORE CHECK-IN DESK ✦
                  </p>
                </div>
              }
            />
          </section>
        )}
      </main>

      {/* FLOATING CYBERPUNK AUDIO CONTROLLER */}
      <button
        type="button"
        onClick={handleToggleAudio}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 border-2 border-foreground bg-background/95 px-2.5 py-1.5 font-pixel text-[8px] md:text-[9px] tracking-wider text-foreground shadow-[4px_4px_0_0_var(--primary)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--signal)] active:translate-y-0 active:shadow-none cursor-pointer"
        title="Toggle Sound"
      >
        <span className="flex items-center gap-0.5">
          {!isAudioMuted ? (
            <>
              <span className="inline-block h-3 w-0.5 bg-primary animate-pulse" />
              <span className="inline-block h-4 w-0.5 bg-primary animate-[pulse_0.8s_ease-in-out_infinite]" />
              <span className="inline-block h-2 w-0.5 bg-primary animate-pulse" />
            </>
          ) : (
            <span className="text-muted-foreground font-bold">✕</span>
          )}
        </span>
        <span>{!isAudioMuted ? "AUDIO: ON" : "AUDIO: MUTED"}</span>
      </button>
    </div>
  );
}
