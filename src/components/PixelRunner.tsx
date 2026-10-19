import React from "react";

interface PixelRunnerProps {
  role: string;
  isFeatured?: boolean;
  delay?: number;
}

// 8-Bit Pixel Runners for BLACKOUT:
// - STU: Student with backwards cap, backpack, sprinting
// - DEV: Cyber dev with green matrix visor, glowing cyan laptop, binary particles
// - DSN: Designer with purple beret, glasses, colorful stylus/palette trail
// - FRL: Freelancer with headphones, messenger bag, steaming coffee mug
// - PRO: Corporate power runner in suit with flutter tie, briefcase
// - FND: Founder in turtleneck, shades, carrying flaming rocket
// - ANY: Ultimate Builder with yellow safety hardhat, tool vest, swinging golden wrench/hammer with sparks
export const PixelRunner: React.FC<PixelRunnerProps> = ({
  role,
  isFeatured = false,
  delay = 0,
}) => {
  // Speed variations so each runner has their own pace
  const speedMap: Record<string, number> = {
    STU: 3.6,
    DEV: 3.2,
    DSN: 3.8,
    FRL: 3.4,
    PRO: 3.5,
    FND: 3.1,
    ANY: 2.9,
  };

  const baseSpeed = speedMap[role] || 3.5;

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* 8-Bit Retro Ground Track with moving dashes */}
      <div className="absolute inset-x-0 bottom-1 flex items-center justify-between overflow-hidden opacity-30">
        <div className="h-[2px] w-full bg-[repeating-linear-gradient(90deg,currentColor_0,currentColor_4px,transparent_4px,transparent_8px)]" />
      </div>

      {/* Floating Speed & Pixel Particle Track */}
      <div
        className="pixel-runner-container absolute bottom-1 flex items-center"
        style={{
          animation: `runAcrossTrack ${baseSpeed}s linear infinite`,
          animationDelay: `-${delay}s`,
        }}
      >
        {/* Pixel Dust / Trail kicking behind the runner */}
        <div className="mr-1 flex items-end gap-1 opacity-75">
          <span className="h-1 w-1 bg-signal/80 animate-ping" style={{ animationDuration: "0.6s" }} />
          <span className="h-1.5 w-1.5 bg-primary/70 animate-pulse" />
          <span className="h-1 w-1 bg-muted-foreground/60" />
        </div>

        {/* The Role-Specific Pixel Character */}
        <div className="relative transform-gpu transition-transform group-hover:scale-110">
          {renderCharacterSprite(role, isFeatured)}
        </div>
      </div>
    </div>
  );
};

// Generates role-specific 8-bit SVG pixel art
function renderCharacterSprite(role: string, isFeatured: boolean) {
  switch (role) {
    case "STU":
      // Student: Teal hoodie, yellow backpack, backwards cap, sneakers
      return (
        <svg
          viewBox="0 0 28 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Backpack on back */}
          <rect x="3" y="10" width="4" height="7" fill="#eab308" />
          <rect x="4" y="8" width="2" height="2" fill="#ca8a04" />
          {/* Head & backwards cap */}
          <rect x="10" y="4" width="7" height="6" fill="#fcd34d" />
          <rect x="9" y="3" width="9" height="3" fill="#06b6d4" />
          <rect x="7" y="5" width="2" height="2" fill="#0891b2" />
          {/* Face pixel */}
          <rect x="15" y="6" width="2" height="2" fill="#09090b" />
          {/* Torso (Teal Hoodie) */}
          <rect x="9" y="10" width="7" height="7" fill="#0d9488" />
          {/* Pumped Arm with Pencil */}
          <g className="animate-pixel-arm-left">
            <rect x="15" y="11" width="5" height="3" fill="#14b8a6" />
            <rect x="19" y="10" width="3" height="2" fill="#f59e0b" />
          </g>
          {/* Running Legs Cycle */}
          <g className="animate-pixel-leg-lead">
            <rect x="13" y="17" width="3" height="5" fill="#1e293b" />
            <rect x="14" y="21" width="4" height="2" fill="#ffffff" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="8" y="17" width="3" height="5" fill="#0f172a" />
            <rect x="6" y="20" width="4" height="2" fill="#ffffff" />
          </g>
        </svg>
      );

    case "DEV":
      // Developer: Black hoodie, glowing matrix green visor, carrying open cyan laptop
      return (
        <svg
          viewBox="0 0 30 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Trailing Matrix Bits */}
          <text x="-4" y="12" fill="#22c55e" fontSize="6" fontFamily="monospace" className="opacity-80">
            01
          </text>
          {/* Hooded Head & Green Visor */}
          <rect x="9" y="3" width="8" height="7" fill="#18181b" />
          <rect x="12" y="6" width="6" height="2" fill="#22c55e" />
          {/* Torso (Cyber Hoodie) */}
          <rect x="8" y="10" width="8" height="7" fill="#27272a" />
          <rect x="11" y="12" width="2" height="3" fill="#22c55e" />
          {/* Arm holding glowing open laptop */}
          <g className="animate-pixel-arm-left">
            <rect x="14" y="11" width="4" height="2" fill="#3f3f46" />
            {/* Laptop Base & Screen */}
            <rect x="17" y="12" width="6" height="2" fill="#94a3b8" />
            <rect x="21" y="7" width="2" height="5" fill="#38bdf8" />
            <rect x="20" y="8" width="1" height="3" fill="#0284c7" />
          </g>
          {/* Running Legs */}
          <g className="animate-pixel-leg-lead">
            <rect x="12" y="17" width="3" height="5" fill="#18181b" />
            <rect x="14" y="21" width="4" height="2" fill="#22c55e" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="7" y="17" width="3" height="5" fill="#09090b" />
            <rect x="5" y="20" width="4" height="2" fill="#22c55e" />
          </g>
        </svg>
      );

    case "DSN":
      // Designer: Magenta/Purple Beret, round glasses, colorful rainbow stylus/palette
      return (
        <svg
          viewBox="0 0 28 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Floating Color Sparks */}
          <rect x="0" y="8" width="2" height="2" fill="#ec4899" />
          <rect x="2" y="12" width="2" height="2" fill="#8b5cf6" />
          {/* Beret & Head */}
          <rect x="7" y="2" width="9" height="3" fill="#a855f7" />
          <rect x="13" y="1" width="4" height="2" fill="#c084fc" />
          <rect x="8" y="5" width="7" height="5" fill="#fcd34d" />
          {/* Round Glasses */}
          <rect x="12" y="6" width="4" height="2" fill="#09090b" />
          <rect x="13" y="6" width="2" height="1" fill="#38bdf8" />
          {/* Torso */}
          <rect x="8" y="10" width="7" height="7" fill="#9333ea" />
          {/* Stylus / Palette Hand */}
          <g className="animate-pixel-arm-left">
            <rect x="13" y="11" width="4" height="3" fill="#d8b4fe" />
            <rect x="17" y="8" width="2" height="6" fill="#f43f5e" />
            <rect x="18" y="6" width="2" height="2" fill="#38bdf8" />
          </g>
          {/* Running Legs */}
          <g className="animate-pixel-leg-lead">
            <rect x="11" y="17" width="3" height="5" fill="#4c1d95" />
            <rect x="13" y="21" width="4" height="2" fill="#f472b6" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="6" y="17" width="3" height="5" fill="#2e1065" />
            <rect x="4" y="20" width="4" height="2" fill="#f472b6" />
          </g>
        </svg>
      );

    case "FRL":
      // Freelancer: Big over-ear headphones, messenger bag, holding steaming coffee mug
      return (
        <svg
          viewBox="0 0 28 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Headphones Band & Cups */}
          <rect x="7" y="2" width="8" height="2" fill="#eab308" />
          <rect x="6" y="4" width="2" height="4" fill="#eab308" />
          <rect x="14" y="4" width="2" height="4" fill="#eab308" />
          {/* Head & Hair */}
          <rect x="8" y="4" width="6" height="6" fill="#fcd34d" />
          <rect x="8" y="3" width="6" height="3" fill="#78350f" />
          {/* Eye */}
          <rect x="12" y="6" width="2" height="2" fill="#09090b" />
          {/* Torso (Flannel jacket) with crossbody strap */}
          <rect x="7" y="10" width="7" height="7" fill="#ea580c" />
          <line x1="7" y1="10" x2="14" y2="17" stroke="#78350f" strokeWidth="2" />
          {/* Arm holding Coffee Mug */}
          <g className="animate-pixel-arm-left">
            <rect x="12" y="11" width="4" height="3" fill="#ea580c" />
            {/* Coffee mug + steam */}
            <rect x="16" y="11" width="4" height="4" fill="#f8fafc" />
            <rect x="17" y="10" width="2" height="1" fill="#78350f" />
            {/* Steam puff */}
            <rect x="18" y="7" width="1" height="2" fill="#94a3b8" className="animate-ping" />
          </g>
          {/* Running Legs */}
          <g className="animate-pixel-leg-lead">
            <rect x="11" y="17" width="3" height="5" fill="#1e3a8a" />
            <rect x="13" y="21" width="4" height="2" fill="#f97316" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="6" y="17" width="3" height="5" fill="#172554" />
            <rect x="4" y="20" width="4" height="2" fill="#f97316" />
          </g>
        </svg>
      );

    case "PRO":
      // Professional: Suit jacket, flying crimson tie, carrying briefcase
      return (
        <svg
          viewBox="0 0 28 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Head & Styled Hair */}
          <rect x="9" y="3" width="6" height="7" fill="#fcd34d" />
          <rect x="8" y="2" width="8" height="3" fill="#1c1917" />
          {/* Eye */}
          <rect x="13" y="6" width="2" height="2" fill="#09090b" />
          {/* Suit Jacket & White Collar */}
          <rect x="8" y="10" width="7" height="7" fill="#1e293b" />
          <rect x="11" y="10" width="2" height="3" fill="#ffffff" />
          {/* Fluttering Red Tie */}
          <g className="animate-pixel-tie">
            <rect x="10" y="12" width="2" height="4" fill="#ef4444" />
            <rect x="7" y="14" width="3" height="2" fill="#ef4444" />
          </g>
          {/* Arm holding Briefcase */}
          <g className="animate-pixel-arm-left">
            <rect x="13" y="11" width="3" height="3" fill="#1e293b" />
            {/* Briefcase */}
            <rect x="16" y="13" width="6" height="5" fill="#78350f" />
            <rect x="17" y="12" width="4" height="1" fill="#d97706" />
            <rect x="19" y="15" width="1" height="1" fill="#f59e0b" />
          </g>
          {/* Running Legs */}
          <g className="animate-pixel-leg-lead">
            <rect x="11" y="17" width="3" height="5" fill="#0f172a" />
            <rect x="13" y="21" width="4" height="2" fill="#09090b" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="7" y="17" width="3" height="5" fill="#020617" />
            <rect x="5" y="20" width="4" height="2" fill="#09090b" />
          </g>
        </svg>
      );

    case "FND":
      // Founder: Black turtleneck, dark shades, miniature flaming rocket
      return (
        <svg
          viewBox="0 0 30 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Head & Sunglasses */}
          <rect x="9" y="3" width="6" height="7" fill="#fcd34d" />
          <rect x="8" y="2" width="7" height="3" fill="#451a03" />
          <rect x="12" y="5" width="5" height="3" fill="#09090b" />
          {/* Black Turtleneck */}
          <rect x="8" y="9" width="7" height="8" fill="#18181b" />
          {/* Arm holding Rocket Launch */}
          <g className="animate-pixel-arm-left">
            <rect x="14" y="11" width="3" height="2" fill="#27272a" />
            {/* Rocket body & nose cone */}
            <rect x="17" y="9" width="6" height="3" fill="#e2e8f0" />
            <polygon points="23,9 26,10.5 23,12" fill="#ef4444" />
            <rect x="18" y="8" width="2" height="1" fill="#ef4444" />
            <rect x="18" y="12" width="2" height="1" fill="#ef4444" />
            {/* Rocket Flame */}
            <rect x="15" y="10" width="2" height="1" fill="#f97316" className="animate-ping" />
          </g>
          {/* Running Legs */}
          <g className="animate-pixel-leg-lead">
            <rect x="11" y="17" width="3" height="5" fill="#27272a" />
            <rect x="13" y="21" width="4" height="2" fill="#ffffff" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="7" y="17" width="3" height="5" fill="#18181b" />
            <rect x="5" y="20" width="4" height="2" fill="#ffffff" />
          </g>
        </svg>
      );

    case "ANY":
    default:
      // Master Builder: Bright yellow safety hardhat, tool belt, swinging golden hammer/wrench with sparks
      return (
        <svg
          viewBox="0 0 30 28"
          className="h-10 w-10 overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Sparks trailing */}
          <rect x="2" y="8" width="2" height="2" fill="#fef08a" className="animate-ping" />
          {/* Yellow Safety Hardhat with Brim & Headlamp */}
          <rect x="7" y="1" width="9" height="4" fill="#eab308" />
          <rect x="5" y="4" width="13" height="2" fill="#ca8a04" />
          <rect x="14" y="2" width="2" height="2" fill="#ffffff" />
          {/* Head & Confident Grin */}
          <rect x="8" y="6" width="6" height="4" fill="#fcd34d" />
          <rect x="13" y="7" width="2" height="1" fill="#09090b" />
          {/* Work Vest (Orange & High-Vis Silver) */}
          <rect x="7" y="10" width="8" height="7" fill="#f97316" />
          <rect x="9" y="12" width="4" height="2" fill="#f8fafc" />
          {/* Arm swinging heavy golden wrench/hammer */}
          <g className="animate-pixel-hammer">
            <rect x="14" y="10" width="3" height="2" fill="#ea580c" />
            {/* Hammer / Wrench Handle & Head */}
            <rect x="17" y="7" width="2" height="7" fill="#78350f" />
            <rect x="15" y="6" width="6" height="3" fill="#e2e8f0" />
            <rect x="19" y="5" width="2" height="2" fill="#fbbf24" />
          </g>
          {/* Running Legs with Sturdy Builder Boots */}
          <g className="animate-pixel-leg-lead">
            <rect x="11" y="17" width="3" height="5" fill="#1e293b" />
            <rect x="13" y="21" width="4" height="2" fill="#d97706" />
          </g>
          <g className="animate-pixel-leg-back">
            <rect x="7" y="17" width="3" height="5" fill="#0f172a" />
            <rect x="5" y="20" width="4" height="2" fill="#d97706" />
          </g>
        </svg>
      );
  }
}
