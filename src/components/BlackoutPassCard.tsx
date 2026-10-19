import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Users,
  CreditCard,
  Building,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Receipt,
  Eye,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import blackoutLogo from "@/assets/blackout-logo.png";
import type { RegistrationRecord } from "@/lib/supabase";

interface BlackoutPassCardProps {
  record: RegistrationRecord;
  badgeTopSlot?: React.ReactNode;
  initialShowModal?: boolean;
}

export function BlackoutPassCard({
  record,
  badgeTopSlot,
  initialShowModal = true,
}: BlackoutPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt and glare positions
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Registration Success Popup Modal State
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(initialShowModal);

  // QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [verificationUrl, setVerificationUrl] = useState<string>("");

  // Action states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [passImageModal, setPassImageModal] = useState<{
    open: boolean;
    dataUrl: string;
    blobUrl?: string;
  }>({ open: false, dataUrl: "" });
  const [socialModal, setSocialModal] = useState<{
    open: boolean;
    platform: string;
    message: string;
  }>({ open: false, platform: "", message: "" });

  // Compute Origin & Verification URL
  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://buildicy.com";
    const vUrl = `${origin}/admin?verify=${encodeURIComponent(record.registration_id)}`;
    setVerificationUrl(vUrl);

    // Generate high-resolution local base64 QR code for offline + canvas security
    QRCode.toDataURL(vUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 260,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error("QR Generation error:", err);
      });
  }, [record.registration_id]);

  // Web Audio Synth chime on celebratory mount
  useEffect(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880]; // A major cyber chime
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.08, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.35);
        });
      }
    } catch {
      // AudioContext unavailable or autoplay restricted, graceful ignore
    }
  }, []);

  // 3D Card Hover & Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(record.registration_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Generate Image Blob / DataURL from Pass Card DOM
  const generatePassImageData = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    const cardEl = cardRef.current;

    // Temporarily save & disable tilt styling for crystal clear image capture
    const originalTransform = cardEl.style.transform;
    const originalTransition = cardEl.style.transition;
    cardEl.style.transform = "none";
    cardEl.style.transition = "none";

    // Strictly hide any laser sweep lines and no-download elements in the DOM
    const noDownloadElements = cardEl.querySelectorAll(
      ".scan-laser-line, [data-no-download='true']"
    );
    noDownloadElements.forEach((el) => {
      (el as HTMLElement).style.setProperty("display", "none", "important");
    });

    try {
      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await toPng(cardEl, {
        cacheBust: true,
        pixelRatio: 3, // Ultra-sharp 3x retina quality
        quality: 1,
        backgroundColor: "#050508",
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (
              node.classList.contains("scan-laser-line") ||
              node.getAttribute("data-no-download") === "true" ||
              Boolean(node.closest?.(".scan-laser-line"))
            ) {
              return false;
            }
          }
          return true;
        },
      });

      return dataUrl;
    } catch (err) {
      console.error("Failed to generate pass image:", err);
      return null;
    } finally {
      // Restore tilt styles
      cardEl.style.transform = originalTransform;
      cardEl.style.transition = originalTransition;
      noDownloadElements.forEach((el) => {
        (el as HTMLElement).style.removeProperty("display");
      });
    }
  };

  // Save Pass as native high-res PNG image
  const handleDownloadPass = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await generatePassImageData();
      if (!dataUrl) {
        alert("Failed to render badge image. Please try again.");
        return;
      }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `BLACKOUT-PASS-${record.registration_id}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      // Check if Web Share API with files is supported (e.g. mobile Safari / Chrome)
      const navAny = navigator as unknown as {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      };

      const isTouchDevice =
        typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0);
      const isIOS =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent || "");

      if (isTouchDevice && isIOS && navAny.canShare && navAny.canShare({ files: [file] })) {
        try {
          await navAny.share({
            files: [file],
            title: `BLACKOUT 2026 Pass - ${record.full_name}`,
            text: `My verified clearance pass for BLACKOUT 2026 Hackathon! #BLACKOUT2026`,
          });
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 5000);
          return;
        } catch (shareErr) {
          if ((shareErr as Error)?.name === "AbortError") return;
        }
      }

      // Standard desktop or mobile download anchor trigger
      const link = document.createElement("a");
      link.download = fileName;
      link.href = blobUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Mobile fall-back preview modal
      if (isTouchDevice) {
        setPassImageModal({ open: true, dataUrl, blobUrl });
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error("Pass image download error:", err);
      alert("Unable to download image automatically. Please take a screenshot of your pass.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Mobile Web Share for pass image preview modal
  const handleSharePassImage = async () => {
    if (!passImageModal.dataUrl) return;
    try {
      const res = await fetch(passImageModal.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `BLACKOUT-PASS-${record.registration_id}.png`, {
        type: "image/png",
      });

      const navAny = navigator as unknown as {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      };

      if (navAny.canShare && navAny.canShare({ files: [file] })) {
        await navAny.share({
          files: [file],
          title: "BLACKOUT 2026 Arena Pass",
          text: `My authenticated clearance pass for BLACKOUT 2026 Hackathon! #BLACKOUT2026`,
        });
      } else {
        window.open(passImageModal.blobUrl || passImageModal.dataUrl, "_blank");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        window.open(passImageModal.blobUrl || passImageModal.dataUrl, "_blank");
      }
    }
  };

  // Pre-formatted social caption
  const dossierCaption = `🚨 CLEARANCE UNLOCKED: I am officially registered for BLACKOUT 2026 — the 12-hour surprise-challenge hackathon by Buildicy in Coimbatore!

🔥 Problem statement sealed until lights out.
⚡ Pass ID: ${record.registration_id}
🎯 Division: ${
    record.participation_type === "team"
      ? `Squad (${record.team_size || 2} Builders)`
      : "Solo Infiltrator"
  }
🏛️ Org: ${record.organization}

Claim your pass before early bird runs out: https://buildicy.com/register

#BLACKOUT2026 #Buildicy #Hackathon #Coimbatore #CodeUnderDarkness #DevCommunity #BuildInPublic`;

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(dossierCaption);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  // 1-Click Social Sharing Handlers
  const handleShareLinkedIn = async () => {
    navigator.clipboard.writeText(dossierCaption);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      "https://buildicy.com/register"
    )}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600,noopener,noreferrer");

    try {
      await handleDownloadPass();
    } catch {
      // ignore
    }

    setSocialModal({
      open: true,
      platform: "LINKEDIN",
      message:
        "1. Your badge PNG image has been downloaded!\n2. Your post caption + hashtags have been copied to clipboard.\n3. Simply paste (Ctrl+V) in LinkedIn and attach your downloaded badge image!",
    });
  };

  const handleShareWhatsApp = () => {
    const text = `🚨 I just registered for *BLACKOUT 2026* — the 12-hour secret challenge hackathon by Buildicy!

🔥 Pass ID: *${record.registration_id}*
⚡ Tier: *${record.pass_name}*
📍 Coimbatore Arena · Nov 28, 2026

Get your pass before tickets sell out:
👉 https://buildicy.com/register`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = `Clearance unlocked for @buildicy BLACKOUT 2026! 🚨\n\n12-hour secret challenge hackathon in Coimbatore. Something big is coming.\n\nPass: ${record.registration_id}\n\nRegister now:`;
    const url = "https://buildicy.com/register";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
        url
      )}&hashtags=BLACKOUT2026,Buildicy,Hackathon`,
      "_blank"
    );
  };

  const handleShareReddit = () => {
    const title = `Registered for BLACKOUT 2026 — 12-Hour Secret Hackathon in Coimbatore!`;
    const url = "https://buildicy.com/register";
    window.open(
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(
        title
      )}`,
      "_blank"
    );
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. REGISTRATION SUCCESS POPUP MODAL (SHOWS IMMEDIATELY) */}
      {/* ========================================================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="relative w-full max-w-xl border-4 border-signal bg-[#0a0314] p-6 sm:p-8 shadow-[0_0_60px_rgba(34,197,94,0.35),8px_8px_0_0_var(--primary)] text-foreground">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Header: Big Logo */}
            <div className="text-center pt-2">
              <img
                src={blackoutLogo}
                alt="BLACKOUT"
                className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]"
              />

              <div className="inline-flex items-center gap-2 border border-signal/60 bg-signal/15 px-4 py-1.5 rounded-full mt-3 font-pixel text-[10px] sm:text-xs text-signal tracking-widest">
                <CheckCircle2 className="h-4 w-4" />
                <span>REGISTRATION CONFIRMED // ARENA CLEARANCE GRANTED</span>
              </div>
            </div>

            {/* Operative Registration Summary Card */}
            <div className="mt-6 border-2 border-primary/40 bg-black/60 p-4 sm:p-5 font-mono text-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-muted-foreground uppercase text-[10px] font-pixel">
                  OPERATIVE NAME:
                </span>
                <span className="font-pixel text-sm text-white font-bold">
                  {record.full_name}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-muted-foreground uppercase text-[10px] font-pixel">
                  REGISTRATION ID:
                </span>
                <span className="font-mono text-sm text-signal font-bold tracking-wider">
                  {record.registration_id}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-muted-foreground uppercase text-[10px] font-pixel">
                  PASS TIER & DIVISION:
                </span>
                <span className="text-white font-bold">
                  {record.pass_name} (
                  {record.participation_type === "team"
                    ? `Squad of ${record.team_size || 2}`
                    : "Solo Infiltrator"}
                  )
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-muted-foreground uppercase text-[10px] font-pixel">
                  INSTITUTION / COMPANY:
                </span>
                <span className="text-white/90">{record.organization}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-muted-foreground uppercase text-[10px] font-pixel">
                  OFFICIAL SWAG SIZE:
                </span>
                <span className="text-signal font-bold">
                  HOODIE / TEE SIZE {record.tshirt_size || "L"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-1">
                <span className="text-muted-foreground uppercase text-[10px] font-pixel">
                  TOTAL AMOUNT PAID:
                </span>
                <span className="font-pixel text-base text-signal font-bold">
                  ₹{record.total_price || record.pass_price}
                </span>
              </div>
            </div>

            {/* Modal Primary Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* DOWNLOAD ID PASS NOW BUTTON */}
              <button
                type="button"
                onClick={handleDownloadPass}
                disabled={isDownloading}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 border-2 border-signal bg-signal px-6 py-3.5 font-pixel text-xs text-black shadow-[4px_4px_0_0_var(--primary)] hover:bg-signal/90 transition active:scale-95 disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>GENERATING ID PASS...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>DOWNLOAD ID PASS (PNG)</span>
                  </>
                )}
              </button>

              {/* CLOSE POPUP & VIEW LANYARD + ID CARD */}
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 border-2 border-primary bg-primary/20 px-6 py-3.5 font-pixel text-xs text-primary-foreground shadow-[3px_3px_0_0_var(--signal)] hover:bg-primary hover:text-white transition active:scale-95"
              >
                <Eye className="h-4 w-4 text-signal" />
                <span>VIEW 3D LANYARD & ID CARD ▶</span>
              </button>
            </div>

            <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">
              Closing this popup reveals your 3D interactive physics lanyard and share deck.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HERO HEADLINE: BIG BLACKOUT LOGO (NO CONFETTI POPPER) */}
      {/* ========================================================= */}
      <div className="text-center pt-2 pb-6 max-w-3xl mx-auto px-4">
        {/* Prominent Large BLACKOUT Logo (Replaces "WELCOME TO THE BLACKOUT" text) */}
        <div className="flex flex-col items-center justify-center">
          <img
            src={blackoutLogo}
            alt="BLACKOUT"
            className="h-20 sm:h-28 md:h-32 w-auto object-contain mx-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.9)] animate-pulse"
          />

          <div className="inline-flex items-center gap-2 border border-signal/60 bg-signal/15 px-4 py-1.5 rounded-full mt-4 font-pixel text-[10px] sm:text-xs text-signal tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
            <span>OPERATIVE CLEARANCE UNLOCKED // ARENA ADMISSION VERIFIED</span>
          </div>

          <p className="mt-3 font-mono text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            12-Hour Secret Hackathon · Nov 28, 2026 · Coimbatore. Problem statement sealed until lights out.
          </p>

          {/* Quick Button to Re-Open Registration Receipt Details if needed */}
          <button
            type="button"
            onClick={() => setShowSuccessModal(true)}
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-signal transition border border-primary/30 px-3 py-1 rounded bg-primary/10"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>View Registration Summary Receipt</span>
          </button>
        </div>
      </div>

      {/* Download Success Notice */}
      {downloadSuccess && (
        <div className="max-w-xl mx-auto mb-4 border-2 border-signal bg-signal/15 p-3 text-center font-mono text-xs text-signal flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>✓ Holographic ID Card Pass downloaded as high-res PNG image!</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 3D EVENT LANYARD BADGE (AT THE TOP) */}
      {/* ========================================================= */}
      {badgeTopSlot && <div className="w-full mb-8">{badgeTopSlot}</div>}

      {/* ========================================================= */}
      {/* 4. REDESIGNED ID CARD (ACRYLIC VINYL HOLDER AESTHETIC) */}
      {/* ========================================================= */}
      <div className="flex justify-center px-2 py-4">
        <div
          ref={cardRef}
          id="blackout-pass-badge"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.015, 1.015, 1.015)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
          }}
          className="relative w-full max-w-md sm:max-w-lg rounded-3xl border-2 border-white/30 bg-gradient-to-b from-[#08080c] via-[#050508] to-[#020204] p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(168,85,247,0.25)] overflow-hidden select-none backdrop-blur-xl"
        >
          {/* Subtle Crease / Fold Lines simulating weathered vinyl pouch */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />

          {/* Environmental Lime Streaks in background */}
          <div className="pointer-events-none absolute -left-12 top-28 h-8 w-64 bg-[#bef264]/10 blur-xl rotate-12" />
          <div className="pointer-events-none absolute -right-12 bottom-36 h-10 w-72 bg-[#bef264]/10 blur-xl -rotate-6" />

          {/* Dynamic Glare Sheen (Suppressed during download) */}
          {!isDownloading && (
            <div
              data-no-download="true"
              className="pointer-events-none absolute inset-0 opacity-20 mix-blend-color-dodge transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(216, 180, 254, 0.45) 0%, rgba(190, 242, 100, 0.25) 45%, transparent 70%)`,
              }}
            />
          )}

          {/* Top Lanyard Attachment Simulation (Purple strap + Swivel clasp + Oval cutout) */}
          <div className="flex flex-col items-center -mt-3 mb-4">
            {/* Purple Ribbon Lanyard Segment */}
            <div className="h-6 w-8 bg-gradient-to-b from-[#7e22ce] to-[#6b21a8] rounded-t-sm shadow-md border-x border-purple-400/30" />
            {/* Silver Metal Swivel Clasp */}
            <div className="h-4 w-3 bg-gradient-to-b from-gray-300 via-white to-gray-400 rounded-sm shadow-inner -mt-0.5" />
            <div className="h-2 w-4 bg-gray-400 rounded-full border border-gray-600 -mt-0.5" />

            {/* Oval Cutout Slot in the Acrylic Card Holder */}
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full border border-white/30 bg-black" />
              <div className="h-3 w-28 rounded-full border border-white/40 bg-black/90 shadow-inner flex items-center justify-center">
                <span className="font-mono text-[7px] text-white/50 tracking-widest uppercase">
                  VIP_CARD_HOLDER
                </span>
              </div>
              <div className="h-2 w-2 rounded-full border border-white/30 bg-black" />
            </div>
          </div>

          {/* Top Right Graffiti "(??)" Mark */}
          <div className="absolute top-8 right-6 font-mono text-xl sm:text-2xl font-black text-[#a855f7] rotate-12 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] select-none">
            (??)
          </div>

          {/* Bottom Left Purple Scribble Tag */}
          <div className="absolute bottom-16 left-5 text-[#9333ea] opacity-80 pointer-events-none select-none font-pixel text-xl -rotate-12">
            ⚡
          </div>

          {/* Cyber Crosshairs */}
          <div className="absolute top-12 left-4 font-mono text-[9px] text-white/30 select-none">
            +
          </div>
          <div className="absolute bottom-28 right-5 font-mono text-[9px] text-white/30 select-none">
            +
          </div>

          {/* ========================================================= */}
          {/* CARD BODY 1: OFFICIAL BLACKOUT 3D GRAFFITI LOGO */}
          {/* ========================================================= */}
          <div className="mt-2 flex justify-center">
            <img
              src={blackoutLogo}
              alt="BLACKOUT"
              className="h-14 sm:h-18 w-auto object-contain drop-shadow-[0_0_25px_rgba(168,85,247,0.95)]"
            />
          </div>

          {/* ========================================================= */}
          {/* CARD BODY 2: GIANT DISTRESSED QUESTION MARK "?" */}
          {/* ========================================================= */}
          <div className="my-2 sm:my-3 text-center select-none">
            <span className="font-sans font-black text-8xl sm:text-9xl text-white tracking-tighter drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)]">
              ?
            </span>
          </div>

          {/* ========================================================= */}
          {/* CARD BODY 3: TILTED FLUORESCENT NEON-LIME WARNING TAPE */}
          {/* ========================================================= */}
          <div className="flex justify-center my-3 transform -rotate-2">
            <div className="bg-[#bef264] text-black px-6 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.9)] border border-black/30 inline-block text-center select-none">
              <div className="font-mono font-black text-sm sm:text-base tracking-widest uppercase leading-tight text-black">
                SOMETHING BIG
              </div>
              <div className="font-mono font-black text-sm sm:text-base tracking-[0.25em] uppercase leading-tight text-black mt-0.5">
                IS COMING.
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD BODY 4: OPERATIVE IDENTITY & CLEARANCE DETAILS */}
          {/* ========================================================= */}
          <div className="mt-4 border-t border-white/10 pt-4 text-center">
            {/* Operative Full Name */}
            <h2 className="font-pixel text-xl sm:text-2xl text-white font-bold tracking-wide uppercase leading-tight">
              {record.full_name}
            </h2>

            {/* Division & Tier */}
            <p className="font-mono text-xs sm:text-sm text-[#bef264] font-bold tracking-widest mt-1 uppercase">
              {record.participation_type === "team"
                ? `TEAM: ${record.team_name || "SQUAD BUILDERS"}`
                : "SOLO OPERATIVE"}{" "}
              · {record.pass_name}
            </p>

            {/* Institution / College */}
            <p className="font-mono text-xs text-white/70 tracking-wide mt-0.5">
              {record.organization}
            </p>

            {/* Registration ID Badge Box */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="rounded-lg border border-[#bef264] bg-black/80 px-4 py-1.5 font-mono text-xs sm:text-sm text-[#bef264] font-bold tracking-widest flex items-center gap-2.5 shadow-inner">
                <span>{record.registration_id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-white transition p-0.5"
                  title="Click to copy registration ID"
                >
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-signal" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#bef264]/70" />
                  )}
                </button>
              </div>
            </div>

            {/* Swag Size Allocation */}
            <div className="mt-2 text-[10px] font-mono text-white/60 uppercase">
              OFFICIAL HOODIE / TEE: SIZE {record.tshirt_size || "L"}
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD BODY 5: BARCODE, CHECK-IN QR & WIREFRAME GLOBE */}
          {/* ========================================================= */}
          <div className="mt-6 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4">
            {/* Vertical Barcode */}
            <div className="flex flex-col items-start">
              <div className="flex items-end gap-[2px] h-10 opacity-90">
                {[
                  3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 1, 2, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1,
                  2, 4, 1, 3, 2, 4, 1, 2, 3,
                ].map((w, i) => (
                  <div
                    key={i}
                    className="bg-white"
                    style={{
                      width: `${w}px`,
                      height: i % 2 === 0 ? "100%" : "85%",
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[8px] text-white/40 tracking-widest mt-1">
                AUTHENTICATED_PASS
              </span>
            </div>

            {/* Check-in QR Code */}
            <div className="flex items-center gap-3">
              <div className="relative rounded-lg bg-white p-1.5 shadow-md">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="BLACKOUT Check-in QR"
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-white flex items-center justify-center text-[7px] text-black">
                    QR...
                  </div>
                )}
              </div>

              {/* Wireframe Globe Icon & Cyber Coordinates */}
              <div className="flex flex-col items-center">
                <svg
                  className="h-7 w-7 text-white opacity-85"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <ellipse cx="12" cy="12" rx="5" ry="10" />
                  <path d="M2 12h20" />
                  <path d="M4 6h16" />
                  <path d="M4 18h16" />
                </svg>
                <span className="font-mono text-[10px] text-white font-bold mt-0.5">73</span>
                <span className="font-mono text-[8px] text-[#bef264]">BLCK</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <p className="mt-4 text-center font-mono text-[8px] text-white/40 tracking-widest uppercase">
            COIMBATORE ARENA // NOV 28, 2026 // ADMIT ONE
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. DIRECTLY BELOW ID CARD: DOWNLOAD & 1-CLICK SHARE ON PLATFORMS */}
      {/* ========================================================= */}
      <div className="mt-8 max-w-2xl mx-auto space-y-4 no-print px-4">
        {/* Main Action Buttons: Download Pass & Copy Post Caption */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Download ID Pass PNG */}
          <button
            type="button"
            onClick={handleDownloadPass}
            disabled={isDownloading}
            className="flex items-center gap-2 border-2 border-signal bg-signal px-6 py-3 font-pixel text-xs text-black shadow-[4px_4px_0_0_rgba(255,255,255,0.4)] hover:bg-signal/90 hover:shadow-[6px_6px_0_0_var(--primary)] transition active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>GENERATING BADGE PNG...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>DOWNLOAD ID PASS (PNG)</span>
              </>
            )}
          </button>

          {/* Copy Post Caption */}
          <button
            type="button"
            onClick={handleCopyDossier}
            className="flex items-center gap-2 border-2 border-primary/80 bg-primary/15 px-5 py-3 font-pixel text-xs text-primary shadow-[3px_3px_0_0_var(--primary)] hover:bg-primary hover:text-primary-foreground transition active:scale-95"
          >
            {copiedDossier ? (
              <>
                <Check className="h-4 w-4 text-signal" />
                <span>CAPTION COPIED WITH HASHTAGS!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>COPY POST CAPTION</span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Social Sharing Network (LinkedIn, WhatsApp, X / Twitter, Reddit) */}
        <div className="border-2 border-border bg-card/60 p-4 shadow-[4px_4px_0_0_var(--primary)]">
          <div className="flex items-center justify-between border-b border-border/80 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-signal" />
              <span className="font-pixel text-[10px] text-foreground tracking-wider uppercase font-bold">
                SHARE ON SOCIAL PLATFORMS // BRAGGING RIGHTS
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground hidden sm:inline">
              Pre-filled caption + #BLACKOUT2026 tags
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* LINKEDIN */}
            <button
              type="button"
              onClick={handleShareLinkedIn}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 border border-[#0A66C2] bg-[#0A66C2]/15 hover:bg-[#0A66C2] hover:text-white p-2.5 font-mono text-xs text-[#70B5F9] transition active:scale-95"
              title="Download badge, copy post with hashtags, and open LinkedIn in 1 click"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.54a1.69 1.69 0 1 0-.01-3.38 1.69 1.69 0 0 0 .01 3.38m1.39 9.96v-8.37H5.07v8.37h2.78z" />
              </svg>
              <span className="font-bold">LINKEDIN</span>
            </button>

            {/* WHATSAPP */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 border border-[#25D366] bg-[#25D366]/15 hover:bg-[#25D366] hover:text-black p-2.5 font-mono text-xs text-[#25D366] transition active:scale-95"
              title="Share ticket link on WhatsApp"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 0 1-5.82 2.41c-1.43 0-2.83-.37-4.07-1.08l-.29-.17-3.03.8 1.05-2.96-.19-.3a8.214 8.214 0 0 1-1.21-4.34c0-4.54 3.7-8.24 8.24-8.24m4.54 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.45 1.03 2.62.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z" />
              </svg>
              <span className="font-bold">WHATSAPP</span>
            </button>

            {/* X / TWITTER */}
            <button
              type="button"
              onClick={handleShareTwitter}
              className="flex items-center justify-center gap-2 border border-foreground/40 bg-foreground/10 hover:bg-foreground hover:text-background p-2.5 font-mono text-xs text-foreground transition active:scale-95"
              title="Post on X / Twitter"
            >
              <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="font-bold">X / TWITTER</span>
            </button>

            {/* REDDIT */}
            <button
              type="button"
              onClick={handleShareReddit}
              className="flex items-center justify-center gap-2 border border-[#FF4500] bg-[#FF4500]/15 hover:bg-[#FF4500] hover:text-white p-2.5 font-mono text-xs text-[#FF4500] transition active:scale-95"
              title="Submit to Reddit"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2m5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.11 3.11 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87s-7.004-2.176-7.004-4.87c0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 14c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249m5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249m-4.966 3.966a.35.35 0 0 0-.247.597c.725.725 1.838.995 2.463.995.626 0 1.738-.27 2.463-.995a.35.35 0 0 0-.495-.495c-.524.523-1.393.74-1.968.74-.575 0-1.444-.217-1.968-.74a.34.34 0 0 0-.248-.102z" />
              </svg>
              <span className="font-bold">REDDIT</span>
            </button>
          </div>
        </div>

        {/* Return to Command HQ Button */}
        <div className="flex justify-center pt-2">
          <a
            href="/"
            className="flex items-center gap-2 border-2 border-primary bg-primary px-6 py-3 font-pixel text-xs text-primary-foreground shadow-[4px_4px_0_0_var(--signal)] hover:bg-signal hover:text-black transition active:scale-95"
          >
            <span>RETURN TO COMMAND HQ</span>
            <span>▶</span>
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. SOCIAL SHARE GUIDE MODAL */}
      {/* ========================================================= */}
      {socialModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-md border-4 border-primary bg-[#0d0417] p-6 shadow-[8px_8px_0_0_var(--signal)] text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-signal" />
                <h3 className="font-pixel text-xs text-primary uppercase font-bold">
                  {socialModal.platform} READY TO POST
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSocialModal({ open: false, platform: "", message: "" })}
                className="font-pixel text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs text-muted-foreground">
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-signal shrink-0 mt-0.5" />
                <span>Pass badge downloaded as high-res PNG image.</span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-signal shrink-0 mt-0.5" />
                <span>Post caption with all hashtags copied to clipboard.</span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-signal shrink-0 mt-0.5" />
                <span>LinkedIn composer is open in your new browser tab!</span>
              </div>

              <div className="mt-4 border border-border/80 bg-background/80 p-3 font-mono text-[11px] text-muted-foreground">
                <span className="text-signal font-bold block mb-1">
                  1-CLICK AWAY FROM POSTING:
                </span>
                Simply press <kbd className="bg-muted px-1.5 py-0.5 text-foreground">Ctrl+V</kbd> /{" "}
                <kbd className="bg-muted px-1.5 py-0.5 text-foreground">Cmd+V</kbd> in LinkedIn to paste
                the post content, and drag or attach your downloaded pass image!
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSocialModal({ open: false, platform: "", message: "" })}
                className="border-2 border-signal bg-signal px-5 py-2 font-pixel text-xs text-black shadow-[3px_3px_0_0_var(--primary)] hover:bg-signal/90"
              >
                GOT IT, LETS GO! ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PASS IMAGE PREVIEW & IPHONE SAVE MODAL */}
      {/* ========================================================= */}
      {passImageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="relative w-full max-w-lg border-4 border-signal bg-[#0a0314] p-5 sm:p-6 shadow-[8px_8px_0_0_var(--primary)] text-foreground">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-signal" />
                <h3 className="font-pixel text-xs sm:text-sm text-signal uppercase font-bold tracking-wider">
                  SAVE BADGE TO PHOTOS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPassImageModal({ open: false, dataUrl: "", blobUrl: "" })}
                className="font-pixel text-sm text-muted-foreground hover:text-foreground px-2 py-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* iPhone / Mobile Instructions Banner */}
            <div className="mt-4 border-2 border-primary/60 bg-primary/10 p-3 font-mono text-xs text-primary-foreground space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-signal font-pixel text-[10px]">
                <span>📱 IPHONE / IPAD SAVING GUIDE</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Tap and hold (long press) the pass image below, then choose{" "}
                <span className="text-signal font-bold">&quot;Save to Photos&quot;</span> or{" "}
                <span className="text-signal font-bold">&quot;Save Image&quot;</span>.
              </p>
            </div>

            {/* Generated Pass Image Preview */}
            <div className="mt-4 max-h-[50vh] overflow-auto flex items-center justify-center rounded border-2 border-border bg-black/40 p-2">
              <img
                src={passImageModal.dataUrl}
                alt={`BLACKOUT Pass - ${record.full_name}`}
                className="w-full max-h-[46vh] object-contain select-auto rounded shadow-[0_0_30px_rgba(34,197,94,0.3)]"
              />
            </div>

            {/* Modal Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSharePassImage}
                  className="flex items-center gap-1.5 border border-signal bg-signal px-4 py-2 font-pixel text-[10px] text-black shadow-[2px_2px_0_0_var(--primary)] hover:bg-signal/90 transition active:scale-95"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>SAVE VIA SHARE SHEET</span>
                </button>
                <a
                  href={passImageModal.blobUrl || passImageModal.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 border border-border bg-card px-3.5 py-2 font-pixel text-[10px] text-foreground hover:border-primary transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>OPEN FULL IMAGE</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setPassImageModal({ open: false, dataUrl: "", blobUrl: "" })}
                className="border border-border px-4 py-2 font-pixel text-[10px] text-muted-foreground hover:text-foreground"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
