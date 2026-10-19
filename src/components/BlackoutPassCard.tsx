import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  Sparkles,
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  CreditCard,
  Building,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import blackoutLogo from "@/assets/blackout-logo.png";
import type { RegistrationRecord } from "@/lib/supabase";

interface BlackoutPassCardProps {
  record: RegistrationRecord;
}

export function BlackoutPassCard({ record }: BlackoutPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Tilt and glare positions
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedDossier, setCopiedDossier] = useState(false);

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

  // Cyber confetti canvas animation on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#a855f7", "#d946ef", "#22c55e", "#ffffff", "#e879f9"];
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      spin: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.4),
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 5,
        speedY: Math.random() * 3 + 2,
        spin: Math.random() * 0.2 - 0.1,
        opacity: 1,
      });
    }

    let frameId: number;
    let elapsed = 0;

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed++;

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.05;

        if (elapsed > 120) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 240) {
        frameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 3D Card Hover & Tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

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

    // Temporarily save & disable tilt styling for a crystal clear, flat image capture
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
      // Small pause to let DOM flush layout and unmount moving laser bar
      await new Promise((r) => setTimeout(r, 120));

      const dataUrl = await toPng(cardEl, {
        cacheBust: true,
        pixelRatio: 3, // Ultra-sharp 3x retina quality
        quality: 1,
        backgroundColor: "#07020d",
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

  // 1. SAVE PASS AS NATIVE VISUAL PNG IMAGE (WITH FULL IPHONE / IOS SUPPORT)
  const handleDownloadPass = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await generatePassImageData();
      if (!dataUrl) {
        alert("Failed to render badge image. Please try again.");
        return;
      }

      // Convert dataUrl to a real Blob & File for iOS Web Share & cross-platform downloads
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileName = `BLACKOUT-PASS-${record.registration_id}.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);

      // Detect iOS Safari / WebKit or mobile devices where programmatic <a> downloads fail
      const isIOS =
        typeof navigator !== "undefined" &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

      // On iOS: Try Web Share API which brings up the native iOS Share sheet with "Save Image" to Photos
      if (isIOS) {
        if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `BLACKOUT 2026 Pass - ${record.full_name}`,
              text: `BLACKOUT 2026 Operative Pass // ${record.full_name} (${record.registration_id})`,
            });
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3500);
            return;
          } catch (err: unknown) {
            if ((err as Error)?.name === "AbortError") {
              // User dismissed the iOS share sheet, don't show alert
              return;
            }
            console.warn("iOS native share failed, falling back to image modal:", err);
          }
        }

        // If Web Share isn't supported or failed, open the preview modal with tap & hold to save
        setPassImageModal({ open: true, dataUrl, blobUrl });
        return;
      }

      // Desktop & Android: Trigger direct file download with blob URL
      const link = document.createElement("a");
      link.download = fileName;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("Pass download error:", err);
      // Fallback: render dataUrl in preview modal
      try {
        const dataUrl = await generatePassImageData();
        if (dataUrl) {
          setPassImageModal({ open: true, dataUrl, blobUrl: dataUrl });
        }
      } catch {}
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper for saving from the iOS preview modal
  const handleSharePassImage = async () => {
    if (!passImageModal.dataUrl) return;
    try {
      const res = await fetch(passImageModal.dataUrl);
      const blob = await res.blob();
      const fileName = `BLACKOUT-PASS-${record.registration_id}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `BLACKOUT 2026 Pass - ${record.full_name}`,
        });
      } else if (passImageModal.blobUrl) {
        window.open(passImageModal.blobUrl, "_blank");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        console.warn("Share modal failed:", err);
      }
    }
  };

  // Operative Initials
  const initials =
    record.full_name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OP";

  // Share Content Text Templates with Hashtags
  const linkedInCaption = `🚨 I just secured my operative pass for BLACKOUT 2026! ⚡👾\n\n12 hours. Complete darkness. Problem statement sealed until the lights go out.\n\n👤 Operative: ${record.full_name}\n🎟️ Pass Tier: ${record.pass_name} (₹${record.pass_price})\n🆔 Clearance ID: ${record.registration_id}\n👥 Division: ${record.participation_type === "team" ? `Squad ${record.team_name || "Team"} (${record.team_size || 1} Builders)` : "Solo Infiltrator"}\n👕 Swag Allocation: Official Hoodie Size ${record.tshirt_size || "L"}\n📍 Venue: Coimbatore, Tamil Nadu\n📅 Date: November 28, 2026\n\nVerified Security Desk Check-in Link:\n${verificationUrl}\n\nReady to build in the dark. See you on the grid!\n\n#BLACKOUT2026 #Buildicy #Hackathon #BuildInTheDark #Coimbatore #Cyberpunk #SoftwareEngineering #TechEvent #SecretHackathon`;

  const whatsAppMessage = `⚡ *BLACKOUT 2026 // PASS CONFIRMED* ⚡\n\nI just registered for BLACKOUT 2026, the 12-hour secret challenge hackathon in Coimbatore!\n\n👤 *Operative:* ${record.full_name}\n🎟️ *Pass:* ${record.pass_name}\n🆔 *Clearance ID:* ${record.registration_id}\n${record.team_name ? `👥 *Squad:* ${record.team_name}\n` : ""}\n🔍 *Verify Pass & Security Clearance:*\n${verificationUrl}\n\n#BLACKOUT2026 #Buildicy #BuildInTheDark`;

  const twitterMessage = `⚡ Just secured my operative pass for @Buildicy's #BLACKOUT2026! 12 hours of coding in the dark with secret challenges in Coimbatore.\n\nOperative ID: ${record.registration_id}\n\nClearance verification: ${verificationUrl}\n\n#BLACKOUT2026 #Buildicy #BuildInTheDark #Hackathon`;

  const redditTitle = `Secured my operative pass for BLACKOUT 2026 (12-Hour Secret Hackathon in Coimbatore)! Anyone else building?`;

  // 2. SOCIAL SHARING HANDLERS
  const handleShareLinkedIn = async () => {
    setIsDownloading(true);

    // Step A: Auto-generate and download the PNG badge image so the user has the image ready
    let dataUrl: string | null = null;
    try {
      dataUrl = await generatePassImageData();
      if (dataUrl) {
        const link = document.createElement("a");
        link.download = `BLACKOUT-PASS-${record.registration_id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      // ignore
    } finally {
      setIsDownloading(false);
    }

    // Step B: Copy post content with hashtags to clipboard
    try {
      await navigator.clipboard.writeText(linkedInCaption);
    } catch {
      // ignore
    }

    // Step C: Try Web Share API with file if supported on mobile
    if (dataUrl && typeof navigator !== "undefined" && navigator.canShare) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `BLACKOUT-PASS-${record.registration_id}.png`, {
          type: "image/png",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "BLACKOUT 2026 Pass",
            text: linkedInCaption,
            files: [file],
            url: verificationUrl,
          });
          return;
        }
      } catch {
        // Fall back to direct LinkedIn browser intent
      }
    }

    // Step D: Open LinkedIn's feed composer with pre-filled content
    const linkedInIntentUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedInCaption)}`;
    window.open(linkedInIntentUrl, "_blank", "noopener,noreferrer");

    // Step E: Display guide modal so the user knows their image is in downloads & text in clipboard
    setSocialModal({
      open: true,
      platform: "LinkedIn",
      message:
        "1. Pass badge image has been downloaded to your device.\n2. Caption with hashtags has been copied to your clipboard.\n3. LinkedIn feed is opened in a new tab! Simply paste (Ctrl+V) and attach your downloaded pass image to publish.",
    });
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareReddit = () => {
    const url = `https://reddit.com/submit?url=${encodeURIComponent(verificationUrl)}&title=${encodeURIComponent(redditTitle)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Copy Clearance Dossier
  const handleCopyDossier = () => {
    navigator.clipboard.writeText(linkedInCaption);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  return (
    <div className="relative">
      {/* Background Cyber Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      />

      {/* ========================================================= */}
      {/* SUCCESS HERO BANNER: UNIQUE "WELCOME TO THE BLACKOUT" */}
      {/* ========================================================= */}
      <div className="text-center mb-10 animate-fade-in">
        {/* Pulsing Status Badge */}
        <div className="inline-flex items-center gap-2 border-2 border-signal bg-signal/15 px-4 py-1.5 font-pixel text-[10px] text-signal shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <span className="animate-blink">●</span>
          <span>CLEARANCE CONFIRMED // LIVE GRID REGISTERED</span>
        </div>

        {/* Dramatic Blackout Welcome Headline */}
        <h1 className="mt-5 font-pixel text-3xl sm:text-5xl text-foreground tracking-tight leading-tight">
          WELCOME TO <br />
          <span className="text-primary drop-shadow-[0_0_35px_rgba(168,85,247,0.9)] animate-pulse">
            THE BLACKOUT.
          </span>
        </h1>

        <p className="mt-3 font-term text-2xl text-signal max-w-xl mx-auto">
          &gt; operative_{record.full_name.toLowerCase().replace(/\s+/g, "_")}: ARENA_CLEARANCE_UNLOCKED
        </p>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-mono max-w-lg mx-auto">
          12-Hour Secret Hackathon · Nov 28, 2026 · Coimbatore. Problem statement sealed until lights out.
        </p>
      </div>

      {/* Download Success Notice */}
      {downloadSuccess && (
        <div className="max-w-xl mx-auto mb-4 border-2 border-signal bg-signal/15 p-3 text-center font-mono text-xs text-signal flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>✓ Holographic Cyber Pass badge downloaded as high-res PNG image!</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE 3D HOLOGRAPHIC CYBER PASS BADGE (CAPTURE TARGET) */}
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
          className="relative w-full max-w-xl rounded-2xl border border-white/20 bg-gradient-to-b from-[#130722] via-[#090312] to-[#05010a] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(168,85,247,0.2)] overflow-hidden select-none backdrop-blur-xl"
        >
          {/* Subtle Cyber Corner Accents */}
          <div className="absolute top-3 left-3 font-mono text-[9px] text-white/25 select-none pointer-events-none">⌜</div>
          <div className="absolute top-3 right-3 font-mono text-[9px] text-white/25 select-none pointer-events-none">⌝</div>
          <div className="absolute bottom-3 left-3 font-mono text-[9px] text-white/25 select-none pointer-events-none">⌞</div>
          <div className="absolute bottom-3 right-3 font-mono text-[9px] text-white/25 select-none pointer-events-none">⌟</div>

          {/* Dynamic Holographic Glare Sheen that moves with mouse (Suppressed on download) */}
          {!isDownloading && (
            <div
              data-no-download="true"
              className="pointer-events-none absolute inset-0 opacity-25 mix-blend-color-dodge transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(216, 180, 254, 0.5) 0%, rgba(34, 197, 94, 0.2) 45%, transparent 70%)`,
              }}
            />
          )}

          {/* Diagonal Holographic Rainbow Edge Lines */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(168,85,247,0.06)_50%,transparent_100%)]" />

          {/* Minimalist Lanyard Cutout Slot at Top */}
          <div className="flex justify-center -mt-2 mb-6">
            <div className="relative flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-5 py-1 backdrop-blur-md shadow-inner">
              <div className="h-1.5 w-6 rounded-full bg-white/20" />
              <span className="font-mono text-[9px] tracking-[0.25em] text-white/60 uppercase font-semibold">
                VIP_ALL_ACCESS
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
            </div>
          </div>

          {/* Pass Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={blackoutLogo}
                alt="BLACKOUT"
                className="h-8 w-auto drop-shadow-[0_0_16px_rgba(168,85,247,0.8)]"
              />
              <div className="border-l border-white/10 pl-3">
                <span className="font-pixel text-[11px] text-white tracking-widest block font-bold">
                  BLACKOUT 2026
                </span>
                <span className="font-mono text-[9px] text-signal/90 tracking-wider block mt-0.5">
                  SURPRISE-CHALLENGE ARENA
                </span>
              </div>
            </div>

            {/* Token Pill with 1-Click Copy */}
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs text-white hover:border-signal hover:text-signal transition-all active:scale-95"
              title="Click to copy registration ID"
            >
              <span className="font-bold tracking-wider">{record.registration_id}</span>
              {copiedId ? <Check className="h-3.5 w-3.5 text-signal" /> : <Copy className="h-3.5 w-3.5 text-white/50" />}
            </button>
          </div>

          {/* Operative Identity & Tier Badge */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              {/* Operative Initials Monogram */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-gradient-to-br from-primary/25 to-black/80 text-foreground shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                <span className="font-pixel text-lg font-bold text-signal">{initials}</span>
                <div className="scanline pointer-events-none absolute inset-0 opacity-20" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[8px] text-muted-foreground uppercase">
                    OPERATIVE NAME
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-signal animate-ping" />
                </div>
                <h2 className="font-pixel text-xl sm:text-2xl text-foreground font-bold leading-tight mt-1">
                  {record.full_name}
                </h2>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  {record.organization}
                </p>
              </div>
            </div>

            {/* Pass Tier Pill */}
            <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/20 via-purple-950/30 to-black/60 px-4 py-2.5 text-right shadow-[0_0_25px_rgba(168,85,247,0.2)] self-start sm:self-center">
              <span className="font-term text-2xl text-signal block leading-none font-bold">
                {record.pass_name}
              </span>
              <span className="font-pixel text-[8px] text-foreground font-bold block mt-1 tracking-wider">
                PAID: ₹{record.total_price || record.pass_price}
              </span>
              {record.team_size && record.team_size > 1 && (
                <span className="font-mono text-[9px] text-muted-foreground block mt-0.5">
                  (₹{record.pass_price} × {record.team_size})
                </span>
              )}
            </div>
          </div>

          {/* Dossier Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
            <div className="space-y-4">
              <div>
                <span className="font-pixel text-[8px] text-muted-foreground uppercase block font-semibold">
                  PARTICIPATION DIVISION
                </span>
                <p className="font-term text-2xl text-foreground font-bold mt-1 flex items-center gap-2">
                  {record.participation_type === "team" ? (
                    <>
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span>SQUAD: {record.team_name || "TEAM BUILDERS"}</span>
                    </>
                  ) : (
                    <span>SOLO INFILTRATOR</span>
                  )}
                </p>
              </div>

              {/* Team Members List (if applicable) */}
              {record.team_members && record.team_members.length > 0 && (
                <div>
                  <span className="font-pixel text-[8px] text-muted-foreground uppercase block mb-1.5 font-semibold">
                    SQUAD OPERATIVES ({record.team_members.length + 1})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-md border border-signal/60 bg-signal/15 px-2.5 py-0.5 text-[10px] text-signal font-bold">
                      ★ {record.full_name} (Lead)
                    </span>
                    {record.team_members.map((m, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-foreground/90"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="font-pixel text-[8px] text-muted-foreground uppercase block font-semibold">
                  COMMUNICATION UPLINK
                </span>
                <p className="text-foreground mt-0.5">{record.email}</p>
                <p className="text-muted-foreground text-[11px]">{record.phone}</p>
              </div>

              <div>
                <span className="font-pixel text-[8px] text-muted-foreground uppercase block font-semibold">
                  SWAG ALLOCATION
                </span>
                <div className="mt-1 inline-flex items-center gap-2 rounded-lg border border-signal/40 bg-signal/10 px-3 py-1 text-signal font-pixel text-xs font-bold">
                  <span>OFFICIAL HOODIE / TEE: SIZE {record.tshirt_size || "L"}</span>
                </div>
              </div>
            </div>

            {/* Check-in QR Code Box with Laser Sweep (Laser hidden during download) */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-5 text-center backdrop-blur-sm shadow-inner">
              <div className="relative rounded-xl bg-white p-3 shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-hidden">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="BLACKOUT Clearance Check-in QR"
                    className="h-36 w-36 object-contain"
                  />
                ) : (
                  <div className="h-36 w-36 flex items-center justify-center bg-white text-black font-mono text-[9px]">
                    GENERATING QR...
                  </div>
                )}

                {/* Animated Green/Purple Scanning Laser Beam - STRICTLY HIDDEN DURING DOWNLOAD */}
                {!isDownloading && (
                  <div
                    data-no-download="true"
                    className="scan-laser-line pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-signal to-transparent shadow-[0_0_12px_rgba(34,197,94,1)] animate-laser-sweep"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5 font-pixel text-[8px] text-signal uppercase font-bold tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ENTRY CLEARANCE QR</span>
              </div>
              <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                Scan with Mobile Camera at Event Desk
              </p>
            </div>
          </div>

          {/* Authentic Barcode at the Bottom */}
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-center justify-between text-muted-foreground font-mono text-[10px] tracking-wider gap-2">
              <span>EVENT: BLACKOUT_2026</span>
              <span>12-HR SPRINT</span>
              <span>DATE: 28.11.2026</span>
            </div>

            {/* Barcode Graphic Representation */}
            <div className="mt-3.5 flex items-center justify-center">
              <div className="flex items-end gap-[2px] h-9 opacity-85">
                {[
                  3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 1, 2, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1,
                  2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3,
                ].map((w, i) => (
                  <div
                    key={i}
                    className="bg-foreground"
                    style={{
                      width: `${w}px`,
                      height: i % 2 === 0 ? "100%" : "85%",
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-center font-mono text-[10px] text-muted-foreground tracking-[0.25em] mt-1.5">
              * {record.registration_id} *
            </p>
            <p className="text-center font-mono text-[8px] text-white/35 tracking-[0.2em] uppercase mt-2 select-none">
              ISSUED BY BUILDICY TECH // CRYPTOGRAPHIC ARENA PASS
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PRIMARY ACTION DECK: DOWNLOAD PNG (NO A4 SHEET), 1-CLICK SOCIAL */}
      {/* ========================================================= */}
      <div className="mt-8 max-w-2xl mx-auto space-y-4 no-print">
        {/* Main Badge Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* 1. DOWNLOAD PASS (PNG - EXACT SCREEN VISUAL) */}
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
                <span>SAVE PASS AS IMAGE (PNG)</span>
              </>
            )}
          </button>

          {/* 2. COPY DOSSIER */}
          <button
            type="button"
            onClick={handleCopyDossier}
            className="flex items-center gap-2 border-2 border-primary/80 bg-primary/15 px-5 py-3 font-pixel text-xs text-primary shadow-[3px_3px_0_0_var(--primary)] hover:bg-primary hover:text-primary-foreground transition active:scale-95"
          >
            {copiedDossier ? (
              <>
                <Check className="h-4 w-4 text-signal" />
                <span>COPIED WITH HASHTAGS!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>COPY POST CAPTION</span>
              </>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 1-CLICK SOCIAL SHARING NETWORK (LINKEDIN, WHATSAPP, X, REDDIT) */}
        {/* ========================================================= */}
        <div className="border-2 border-border bg-card/60 p-4 shadow-[4px_4px_0_0_var(--primary)]">
          <div className="flex items-center justify-between border-b border-border/80 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-signal" />
              <span className="font-pixel text-[10px] text-foreground tracking-wider uppercase font-bold">
                1-CLICK SOCIAL BROADCAST // BRAGGING RIGHTS
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground hidden sm:inline">
              Pre-filled caption + #BLACKOUT2026 hashtags
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
              title="Share ticket link and squad invite on WhatsApp"
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
      {/* SOCIAL SHARE MODAL / GUIDE */}
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
      {/* PASS IMAGE PREVIEW & IPHONE SAVE MODAL */}
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
