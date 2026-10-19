import React, { useState, useRef, useEffect } from "react";

interface ChainedLockOverlayProps {
  tierName?: string;
  badgeText?: string;
  subText?: string;
  onAttemptClick?: () => void;
}

/**
 * Calculates chain link positions along a line segment from (x1, y1) to (x2, y2).
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

/**
 * Synthesizes a realistic metallic chain link clinking, rattling, and padlock impact sound.
 */
function playChainClinkSound(intensity = 1.0) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // 1. Staggered link impacts mimicking heavy forged steel chains colliding
    const clinks = [
      { delay: 0.0, gain: 0.22 * intensity, freqs: [2400, 3600, 5200, 7100] },
      { delay: 0.024, gain: 0.16 * intensity, freqs: [1950, 2900, 4300, 6400] },
      { delay: 0.058, gain: 0.18 * intensity, freqs: [2650, 3950, 5800, 8200] },
      { delay: 0.1, gain: 0.12 * intensity, freqs: [1800, 2700, 3900, 5500] },
      { delay: 0.15, gain: 0.09 * intensity, freqs: [2250, 3400, 4800, 6800] },
      { delay: 0.21, gain: 0.05 * intensity, freqs: [2100, 3100, 4600] },
    ];

    clinks.forEach((clink) => {
      const t = now + clink.delay;
      const decay = 0.08 + Math.random() * 0.05;

      clink.freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Inharmonic metallic resonance
        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq + (Math.random() * 70 - 35), t);

        const vol = (clink.gain / (idx + 1)) * 0.6;
        gainNode.gain.setValueAtTime(vol, t);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + decay);
      });
    });

    // 2. Heavy iron body thud
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = "sine";
    thudOsc.frequency.setValueAtTime(180, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
    thudGain.gain.setValueAtTime(0.18 * intensity, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.1);

    // 3. Metallic link scraping friction noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(4400, now);
    filter.Q.setValueAtTime(3.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.07 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.06);
  } catch {
    // Audio restricted or uninitialized - graceful fallback
  }
}

export function ChainedLockOverlay({
  tierName = "PASS TIER",
  badgeText = "TIER LOCKED // SEALED",
  subText = "OPENS AFTER FIRST 20 EARLY BIRD PASSES SELL OUT",
  onAttemptClick,
}: ChainedLockOverlayProps) {
  const [pull, setPull] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRattling, setIsRattling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showHud, setShowHud] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastSoundDistRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastSoundDistRef.current = 0;
    playChainClinkSound(0.5); // subtle initial grab clink
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 0) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    lastSoundDistRef.current = 0;
    playChainClinkSound(0.5);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    const rawDist = Math.hypot(dx, dy);

    if (rawDist > 5) {
      hasDraggedRef.current = true;
    }

    // Elastic spring resistance: maximum deflection of 38px
    const maxPull = 38;
    const dampedDist = Math.min(rawDist, maxPull) * (1 - Math.exp(-rawDist / 26));
    const angle = Math.atan2(dy, dx);
    const px = Math.cos(angle) * dampedDist;
    const py = Math.sin(angle) * dampedDist;

    setPull({ x: px, y: py });

    // Play tactile chain link click every 12px of movement
    if (Math.abs(rawDist - lastSoundDistRef.current) > 12) {
      lastSoundDistRef.current = rawDist;
      playChainClinkSound(0.35);
    }
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;

    const releaseDist = Math.hypot(pull.x, pull.y);

    // Snap back with realistic spring vibration and heavy chain clatter
    setPull({ x: 0, y: 0 });
    setIsRattling(true);
    setShowHud(true);

    playChainClinkSound(releaseDist > 8 ? 1.0 : 0.8);

    setTimeout(() => {
      setIsRattling(false);
    }, 550);

    setTimeout(() => {
      setShowHud(false);
    }, 3200);

    if (onAttemptClick) onAttemptClick();
  };

  // Attach global window move and up listeners when dragging so drag doesn't stop if cursor leaves box
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handlePointerEnd();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handlePointerEnd();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, pull]);

  // Click handler (for simple clicks without drag)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    setIsRattling(true);
    setShowHud(true);
    playChainClinkSound(0.9);
    setTimeout(() => setIsRattling(false), 550);
    setTimeout(() => setShowHud(false), 3200);
    if (onAttemptClick) onAttemptClick();
  };

  // Center anchor coordinates with real-time deflection from pull
  // Base SVG viewBox is 320 x 460
  const cx = 160 + pull.x;
  const cy = 230 + pull.y;
  const lockRotation = pull.x * 0.45;

  // 6 dynamic segments converging at the central lock
  // Step 20 gives realistic dense steel link spacing
  const segTL = createChainLinks(-20, -20, cx - 18, cy - 12, 20);
  const segBR = createChainLinks(cx + 18, cy + 12, 340, 480, 20);
  const segTR = createChainLinks(340, -20, cx + 18, cy - 12, 20);
  const segBL = createChainLinks(cx - 18, cy + 12, -20, 480, 20);
  const segL = createChainLinks(-20, 230 + pull.y * 0.25, cx - 28, cy, 20);
  const segR = createChainLinks(cx + 28, cy, 340, 230 + pull.y * 0.25, 20);

  const allSegments = [segTL, segBR, segTR, segBL, segL, segR];

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isDragging) setPull({ x: 0, y: 0 });
      }}
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-sm select-none transition-colors duration-300 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      title="Click or drag to pull the locked chains"
    >
      {/* 1. Sleek Cyber Mood Vignette (Pass Card contents remain subtly visible beneath) */}
      <div className="absolute inset-0 bg-[#04010a]/80 backdrop-blur-[1.5px] transition-opacity" />

      {/* 2. Ambient Cyber Radial Shadow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* 3. Floating Holographic Cyber HUD Callout (revealed on hover, drag, or click) */}
      <div
        className={`pointer-events-none absolute top-4 inset-x-3 z-30 flex flex-col items-center transition-all duration-300 ${
          showHud || isHovered || isRattling
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-full max-w-[270px] border border-amber-400/80 bg-black/95 p-2 shadow-[0_0_20px_rgba(245,158,11,0.35),3px_3px_0_0_#f59e0b] backdrop-blur-md text-center">
          <div className="flex items-center justify-center gap-1.5 font-pixel text-[8px] text-amber-300 font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>ACCESS RESTRICTED // {tierName}</span>
          </div>
          <p className="mt-1 font-mono text-[9px] text-amber-100/80 leading-tight">
            {subText}
          </p>
        </div>
      </div>

      {/* 4. Realistic SVG Chains & Heavy Padlock Assembly */}
      <svg
        viewBox="0 0 320 460"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full pointer-events-none z-10 transition-transform duration-100 ${
          isRattling ? "animate-chain-rattle" : ""
        }`}
      >
        <defs>
          {/* Heavy Realistic Cast Shadow for 3D Depth */}
          <filter id="real-chain-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="3" dy="6" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.95" />
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
          </filter>

          {/* Realistic Metallic Steel Gradient for Outer Links */}
          <linearGradient id="real-steel-outer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#e2e8f0" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="60%" stopColor="#475569" />
            <stop offset="85%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Gunmetal Steel for Interlocking Side Links */}
          <linearGradient id="real-steel-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="55%" stopColor="#475569" />
            <stop offset="85%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Hardened Chrome Shackle Gradient */}
          <linearGradient id="real-shackle-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#e2e8f0" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="90%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Heavy Gunmetal Padlock Body Gradient */}
          <linearGradient id="real-padlock-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c3340" />
            <stop offset="20%" stopColor="#1e2430" />
            <stop offset="55%" stopColor="#141923" />
            <stop offset="85%" stopColor="#0d1118" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>

          {/* Padlock Bevel Stroke Gradient */}
          <linearGradient id="real-padlock-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>

          {/* Brass Keyhole Rim Gradient */}
          <linearGradient id="real-brass-keyway" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="35%" stopColor="#ca8a04" />
            <stop offset="70%" stopColor="#854d0e" />
            <stop offset="100%" stopColor="#422006" />
          </linearGradient>
        </defs>

        {/* --- DYNAMIC REALISTIC CHAIN SEGMENTS --- */}
        <g filter="url(#real-chain-shadow)">
          {allSegments.map((segment, segIdx) => (
            <g key={`seg-${segIdx}`}>
              {segment.map((link) =>
                link.isFlat ? (
                  // FLAT LINK: Thick metallic loop with specular rim
                  <g
                    key={`flat-${segIdx}-${link.idx}`}
                    transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
                  >
                    {/* Outer Link Ring */}
                    <rect
                      x="-13"
                      y="-7"
                      width="26"
                      height="14"
                      rx="6.5"
                      fill="#0b0f17"
                      stroke="url(#real-steel-outer)"
                      strokeWidth="3.6"
                    />
                    {/* Inner Link Cutout (Shows card depth beneath) */}
                    <rect
                      x="-6.5"
                      y="-2.5"
                      width="13"
                      height="5"
                      rx="2.5"
                      fill="#02050b"
                      stroke="#1e293b"
                      strokeWidth="0.8"
                    />
                    {/* Top Specular Chrome Highlight */}
                    <line
                      x1="-9"
                      y1="-5.5"
                      x2="8"
                      y2="-5.5"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    {/* Bottom Bevel Shadow */}
                    <line
                      x1="-7"
                      y1="5"
                      x2="7"
                      y2="5"
                      stroke="#0f172a"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  // INTERLOCKING SIDE LINK: Pass-through ring at 90-degree angle
                  <g
                    key={`edge-${segIdx}-${link.idx}`}
                    transform={`translate(${link.cx}, ${link.cy}) rotate(${link.angle})`}
                  >
                    {/* Side Link Outer Body */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="4.8"
                      ry="8.8"
                      fill="url(#real-steel-inner)"
                      stroke="#090d16"
                      strokeWidth="1.8"
                    />
                    {/* Vertical Chrome Highlight */}
                    <line
                      x1="-1"
                      y1="-6.5"
                      x2="-1"
                      y2="6.5"
                      stroke="#ffffff"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                    {/* Depth Shadow Core */}
                    <line
                      x1="1.4"
                      y1="-6"
                      x2="1.4"
                      y2="6"
                      stroke="#020617"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  </g>
                )
              )}
            </g>
          ))}
        </g>

        {/* --- HEAVY SOLID FORGED STEEL PADLOCK AT THE CONVERGENCE POINT --- */}
        <g
          transform={`translate(${cx}, ${cy}) rotate(${lockRotation})`}
          filter="url(#real-chain-shadow)"
          className="transition-transform duration-75"
        >
          {/* 1. Heavy Chrome U-Shackle (Loops securely through the chains) */}
          <g>
            {/* Shackle Path: 10px thick curved steel bar */}
            <path
              d="M -23 12 L -23 -18 A 23 23 0 0 1 23 -18 L 23 12 L 14 12 L 14 -18 A 14 14 0 0 0 -14 -18 L -14 12 Z"
              fill="url(#real-shackle-chrome)"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            {/* Shackle Specular Highlight Arch */}
            <path
              d="M -18 -18 A 18 18 0 0 1 18 -18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Shackle Locking Collar Bushings at insertion holes */}
            <rect
              x="-26"
              y="5"
              width="15"
              height="6"
              rx="1.5"
              fill="#334155"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            <rect
              x="11"
              y="5"
              width="15"
              height="6"
              rx="1.5"
              fill="#334155"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
          </g>

          {/* 2. Heavy Gunmetal Padlock Body */}
          <g>
            {/* Outer Base Block with Rounded Bottom Corners */}
            <rect
              x="-53"
              y="7"
              width="106"
              height="84"
              rx="12"
              fill="url(#real-padlock-body)"
              stroke="url(#real-padlock-bevel)"
              strokeWidth="2.4"
            />

            {/* Recessed Inner Face Plate */}
            <rect
              x="-47"
              y="13"
              width="94"
              height="72"
              rx="8"
              fill="#10141c"
              stroke="#1e293b"
              strokeWidth="1.2"
            />

            {/* Brushed Metal Horizontal Surface Sheen Lines */}
            <line x1="-42" y1="20" x2="42" y2="20" stroke="#334155" strokeWidth="0.8" opacity="0.4" />
            <line x1="-42" y1="36" x2="42" y2="36" stroke="#334155" strokeWidth="0.8" opacity="0.3" />
            <line x1="-42" y1="64" x2="42" y2="64" stroke="#334155" strokeWidth="0.8" opacity="0.4" />

            {/* 4 Heavy Steel Corner Rivets */}
            {[
              { rx: -39, ry: 21 },
              { rx: 39, ry: 21 },
              { rx: -39, ry: 73 },
              { rx: 39, ry: 73 },
            ].map((rivet, rIdx) => (
              <g key={`rivet-${rIdx}`} transform={`translate(${rivet.rx}, ${rivet.ry})`}>
                <circle cx="0" cy="0" r="3.2" fill="#090d16" stroke="#475569" strokeWidth="1" />
                <circle cx="-0.8" cy="-0.8" r="1.2" fill="#ffffff" opacity="0.8" />
              </g>
            ))}

            {/* Status Diode Bar & Engraved Header */}
            <rect
              x="-38"
              y="18"
              width="76"
              height="15"
              rx="3"
              fill="#080a0f"
              stroke="#1e2430"
              strokeWidth="1"
            />
            {/* Blinking Red/Amber Security Diode */}
            <circle cx="-29" cy="25.5" r="3" fill="#ef4444" className="animate-pulse" />
            <circle cx="-29" cy="25.5" r="5" fill="#ef4444" opacity="0.3" className="animate-ping" />
            {/* Engraved BLACKOUT Seal */}
            <text
              x="5"
              y="29"
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="2"
            >
              BLACKOUT
            </text>

            {/* 3. Central Precision Keyhole Cylinder */}
            <g transform="translate(0, 50)">
              {/* Recessed Brass Keyway Ring */}
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="url(#real-brass-keyway)"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <circle
                cx="0"
                cy="0"
                r="11"
                fill="#18140c"
                stroke="#ca8a04"
                strokeWidth="0.8"
              />

              {/* Keyhole Opening (Upper Circle + Tapered Slot) */}
              <circle cx="0" cy="-2.5" r="3.8" fill="#020408" />
              <polygon points="-2.2,-1 2.2,-1 3.2,7 -3.2,7" fill="#020408" />

              {/* Keyhole Golden Pin Gleam */}
              <line x1="-0.5" y1="-3" x2="-0.5" y2="5" stroke="#fde047" strokeWidth="1" opacity="0.75" />
            </g>

            {/* 4. Engraved Industrial Seal Label: TIER LOCKED // SEALED */}
            <rect
              x="-40"
              y="69"
              width="80"
              height="13"
              rx="2.5"
              fill="#080a0f"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
            <text
              x="0"
              y="78.5"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="6.8"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="1"
            >
              TIER LOCKED // SEALED
            </text>
          </g>
        </g>
      </svg>

      {/* 5. Subtle Interactive Hint in the Footer */}
      <div className="absolute bottom-3 inset-x-0 z-30 flex justify-center pointer-events-none">
        <span className="font-pixel text-[8px] text-muted-foreground/60 tracking-wider">
          {isDragging ? "[ ⛓ TENSION HIGH // RELEASE TO CLINK ]" : "[ ⛓ PULL OR CLICK CHAIN ]"}
        </span>
      </div>

      {/* Screen Reader Element */}
      <span className="sr-only">
        {tierName} - {subText}
      </span>
    </div>
  );
}
