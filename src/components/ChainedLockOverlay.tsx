import React, { useState } from "react";
import { Lock, AlertTriangle, ShieldAlert } from "lucide-react";

interface ChainedLockOverlayProps {
  tierName?: string;
  badgeText?: string;
  subText?: string;
  onAttemptClick?: () => void;
}

/**
 * Calculates chain link positions along a segment from (x1, y1) to (x2, y2).
 */
function createChainLinks(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  step = 22
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const count = Math.max(2, Math.floor(dist / step));

  const links = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const cx = x1 + dx * t;
    const cy = y1 + dy * t;
    links.push({ cx, cy, angle, isFlat: i % 2 === 0, idx: i });
  }
  return links;
}

export function ChainedLockOverlay({
  tierName = "PASS TIER",
  badgeText = "TIER LOCKED",
  subText = "OPENS AFTER EARLY BIRD FILLS",
  onAttemptClick,
}: ChainedLockOverlayProps) {
  const [isRattling, setIsRattling] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRattling(true);
    setTimeout(() => setIsRattling(false), 450);
    if (onAttemptClick) onAttemptClick();
  };

  // Pre-calculated chains across a 320x460 normalized SVG card box
  const diagonal1 = createChainLinks(-10, -10, 330, 470, 22);
  const diagonal2 = createChainLinks(330, -10, -10, 470, 22);
  const horizontal = createChainLinks(-10, 225, 330, 225, 22);

  return (
    <div
      onClick={handleClick}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-sm cursor-not-allowed select-none transition-all duration-300"
    >
      {/* 1. Dark Frosted Cyber Dimming Tint */}
      <div className="absolute inset-0 bg-[#06020c]/80 backdrop-blur-[2px] transition-opacity" />

      {/* 2. Diagonal Cyber Hazard Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_12px,#eab308_12px,#eab308_24px)] pointer-events-none" />

      {/* 3. SVG Chains Wrapping Diagonally & Horizontally */}
      <svg
        viewBox="0 0 320 460"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full pointer-events-none z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]"
      >
        <defs>
          {/* Metallic Steel Gradient for Outer Links */}
          <linearGradient id="steel-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="55%" stopColor="#64748b" />
            <stop offset="85%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Dark Gunmetal for Interlocking Perpendicular Links */}
          <linearGradient id="steel-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="40%" stopColor="#475569" />
            <stop offset="80%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Shackle Heavy Steel Gradient */}
          <linearGradient id="shackle-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* --- Chain 1: Diagonal Top-Left to Bottom-Right --- */}
        <g opacity="0.95">
          {diagonal1.map((link) =>
            link.isFlat ? (
              <g
                key={`d1-flat-${link.idx}`}
                transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
              >
                <rect
                  x="-13"
                  y="-7"
                  width="26"
                  height="14"
                  rx="6"
                  fill="#090d16"
                  stroke="url(#steel-outer)"
                  strokeWidth="3.6"
                />
                <rect
                  x="-7"
                  y="-2.5"
                  width="14"
                  height="5"
                  rx="2.5"
                  fill="#030712"
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
                <line
                  x1="-9"
                  y1="-5"
                  x2="7"
                  y2="-5"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>
            ) : (
              <g
                key={`d1-edge-${link.idx}`}
                transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
              >
                <ellipse
                  cx="0"
                  cy="0"
                  rx="5"
                  ry="9"
                  fill="#1e293b"
                  stroke="url(#steel-inner)"
                  strokeWidth="3"
                />
                <line
                  x1="0"
                  y1="-6"
                  x2="0"
                  y2="6"
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
              </g>
            )
          )}
        </g>

        {/* --- Chain 2: Diagonal Top-Right to Bottom-Left --- */}
        <g opacity="0.95">
          {diagonal2.map((link) =>
            link.isFlat ? (
              <g
                key={`d2-flat-${link.idx}`}
                transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
              >
                <rect
                  x="-13"
                  y="-7"
                  width="26"
                  height="14"
                  rx="6"
                  fill="#090d16"
                  stroke="url(#steel-outer)"
                  strokeWidth="3.6"
                />
                <rect
                  x="-7"
                  y="-2.5"
                  width="14"
                  height="5"
                  rx="2.5"
                  fill="#030712"
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
                <line
                  x1="-9"
                  y1="-5"
                  x2="7"
                  y2="-5"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>
            ) : (
              <g
                key={`d2-edge-${link.idx}`}
                transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
              >
                <ellipse
                  cx="0"
                  cy="0"
                  rx="5"
                  ry="9"
                  fill="#1e293b"
                  stroke="url(#steel-inner)"
                  strokeWidth="3"
                />
                <line
                  x1="0"
                  y1="-6"
                  x2="0"
                  y2="6"
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
              </g>
            )
          )}
        </g>

        {/* --- Chain 3: Horizontal Center Belt --- */}
        <g opacity="0.85">
          {horizontal.map((link) =>
            link.isFlat ? (
              <g
                key={`h-flat-${link.idx}`}
                transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
              >
                <rect
                  x="-12"
                  y="-6.5"
                  width="24"
                  height="13"
                  rx="5.5"
                  fill="#090d16"
                  stroke="url(#steel-outer)"
                  strokeWidth="3.2"
                />
                <rect
                  x="-6"
                  y="-2"
                  width="12"
                  height="4"
                  rx="2"
                  fill="#030712"
                />
              </g>
            ) : (
              <g
                key={`h-edge-${link.idx}`}
                transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
              >
                <ellipse
                  cx="0"
                  cy="0"
                  rx="4.5"
                  ry="8"
                  fill="#1e293b"
                  stroke="url(#steel-inner)"
                  strokeWidth="2.8"
                />
              </g>
            )
          )}
        </g>

        {/* Shackle Arch of the central Padlock */}
        <g transform="translate(160, 215)">
          {/* Shackle Drop Shadow */}
          <path
            d="M -22 -10 A 22 22 0 0 1 22 -10 L 22 15 L 14 15 L 14 -10 A 14 14 0 0 0 -14 -10 L -14 15 L -22 15 Z"
            fill="#000000"
            opacity="0.9"
            transform="translate(2, 3)"
          />
          {/* Shackle Metallic Body */}
          <path
            d="M -22 -10 A 22 22 0 0 1 22 -10 L 22 15 L 14 15 L 14 -10 A 14 14 0 0 0 -14 -10 L -14 15 L -22 15 Z"
            fill="url(#shackle-grad)"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
        </g>
      </svg>

      {/* 4. Heavy Central Cyber Padlock with Warning Header & Status */}
      <div
        className={`relative z-20 w-[84%] max-w-[270px] border-2 border-amber-500/90 bg-[#0e0717]/95 p-3.5 shadow-[0_0_30px_rgba(245,158,11,0.5),6px_6px_0_0_rgba(0,0,0,0.9)] transition-transform duration-200 ${
          isRattling ? "animate-lock-rattle scale-105" : "hover:scale-[1.02]"
        }`}
      >
        {/* Brass Rivets in 4 corners */}
        <div className="absolute top-1 left-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 border border-amber-600 shadow-[inset_0_1px_1px_#fff]" />
        <div className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 border border-amber-600 shadow-[inset_0_1px_1px_#fff]" />
        <div className="absolute bottom-1 left-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 border border-amber-600 shadow-[inset_0_1px_1px_#fff]" />
        <div className="absolute bottom-1 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 border border-amber-600 shadow-[inset_0_1px_1px_#fff]" />

        {/* Hazard Tape Bar */}
        <div className="flex items-center justify-between border-b border-amber-500/50 bg-amber-500/15 px-2 py-0.5 mb-2.5">
          <span className="font-pixel text-[8px] text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>ACCESS RESTRICTED</span>
          </span>
          <span className="font-mono text-[9px] text-amber-300/80">SEALED</span>
        </div>

        {/* Central Lock Graphic & Warning Header */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 flex items-center justify-center h-11 w-11 border-2 border-amber-500/80 bg-gradient-to-b from-amber-500/20 to-black/60 shadow-[inset_0_0_10px_rgba(245,158,11,0.4)]">
            <Lock className="h-6 w-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-pulse" />
          </div>

          <div className="text-left flex-1 min-w-0">
            <span className="font-pixel text-[10px] text-foreground font-bold block leading-tight truncate">
              {tierName}
            </span>
            <span className="font-pixel text-[8px] text-amber-400 block mt-1 tracking-wider font-bold">
              {badgeText}
            </span>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="mt-3 border-t border-border/60 pt-2 font-mono text-[10px] text-amber-300/90 leading-tight text-center bg-black/40 p-1.5">
          <div className="flex items-center justify-center gap-1.5 text-signal font-pixel text-[8px] uppercase">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
            <span>EARLY BIRD ACTIVE</span>
          </div>
          <p className="mt-1 text-muted-foreground text-[9px]">
            {subText}
          </p>
        </div>
      </div>

      {/* Warning Toast / Prompt when user attempts to click */}
      {isRattling && (
        <div className="absolute bottom-4 z-30 mx-3 border-2 border-amber-400 bg-black/95 px-3 py-1.5 font-pixel text-[8px] text-amber-300 shadow-[3px_3px_0_0_var(--signal)] animate-fade-in text-center">
          ⚠ TIER LOCKED: Early Bird (₹499) is currently the active open pass!
        </div>
      )}
    </div>
  );
}
