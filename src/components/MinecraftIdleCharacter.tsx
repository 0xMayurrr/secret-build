import React from "react";

interface MinecraftIdleCharacterProps {
  role: string;
  isFeatured?: boolean;
  className?: string;
}

export const MinecraftIdleCharacter: React.FC<MinecraftIdleCharacterProps> = ({
  role,
  isFeatured = false,
  className = "",
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{
        imageRendering: "pixelated",
      }}
    >
      <style>{`
        @keyframes mcIdleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes mcHeadIdle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-1px) rotate(0.8deg); }
        }
        @keyframes mcArmIdle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes mcItemPulse {
          0%, 100% { filter: drop-shadow(0 0 2px currentColor); opacity: 0.88; }
          50% { filter: drop-shadow(0 0 6px currentColor); opacity: 1; }
        }
        @keyframes mcSteamRise {
          0% { transform: translateY(0) scale(0.8); opacity: 0.75; }
          50% { opacity: 0.4; }
          100% { transform: translateY(-5px) scale(1.2); opacity: 0; }
        }
        @keyframes mcGlintShimmer {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .mc-idle-container {
          animation: mcIdleBob 2.6s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .mc-head-idle {
          animation: mcHeadIdle 2.6s ease-in-out infinite;
          transform-origin: 12px 10px;
        }
        .mc-arm-idle {
          animation: mcArmIdle 2.6s ease-in-out infinite;
          transform-origin: 6px 11px;
        }
        .mc-item-pulse {
          animation: mcItemPulse 2s ease-in-out infinite;
        }
        .mc-steam-1 {
          animation: mcSteamRise 1.8s ease-out infinite;
        }
        .mc-steam-2 {
          animation: mcSteamRise 1.8s ease-out infinite 0.9s;
        }
        .mc-glint {
          animation: mcGlintShimmer 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Minecraft Pixel Character Canvas */}
      <div className="mc-idle-container relative">
        {/* Subtle drop shadow underneath character */}
        <div className="absolute -bottom-1 left-1/2 h-1.5 w-7 -translate-x-1/2 rounded-full bg-black/40 blur-[1px]" />
        {renderMinecraftSprite(role, isFeatured)}
      </div>
    </div>
  );
};

function renderMinecraftSprite(role: string, isFeatured: boolean) {
  // Common crispEdges style for authentic Minecraft pixel aesthetic
  const svgStyle: React.CSSProperties = {
    shapeRendering: "crispEdges",
  };

  switch (role) {
    case "STU":
      // Student: Minecraft skin with backwards cap, backpack, teal hoodie, textbook
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* BACKPACK STRAP / BULK */}
          <rect x="5" y="12" width="2" height="8" fill="#ca8a04" />
          <rect x="5" y="10" width="2" height="3" fill="#a16207" />

          {/* LEGS */}
          <g>
            {/* Left Leg (Jeans) */}
            <rect x="9" y="21" width="4" height="8" fill="#1e3a8a" />
            <rect x="9" y="27" width="4" height="2" fill="#1d4ed8" />
            <rect x="9" y="29" width="4" height="3" fill="#ffffff" />
            <rect x="9" y="31" width="4" height="1" fill="#475569" />
            {/* Right Leg (Jeans) */}
            <rect x="14" y="21" width="4" height="8" fill="#1e3a8a" />
            <rect x="14" y="27" width="4" height="2" fill="#1d4ed8" />
            <rect x="14" y="29" width="4" height="3" fill="#ffffff" />
            <rect x="14" y="31" width="4" height="1" fill="#475569" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#0d9488" />
            <rect x="9" y="12" width="9" height="8" fill="#14b8a6" />
            {/* Hoodie pocket */}
            <rect x="10" y="17" width="7" height="3" fill="#0f766e" />
            {/* Hoodie drawstring */}
            <rect x="11" y="13" width="1" height="3" fill="#facc15" />
            <rect x="15" y="13" width="1" height="3" fill="#facc15" />
          </g>

          {/* LEFT ARM (holding open book/textbook) */}
          <g className="mc-arm-idle">
            <rect x="4" y="11" width="4" height="7" fill="#0d9488" />
            <rect x="4" y="18" width="4" height="3" fill="#fbcfe8" />
            {/* Minecraft Textbook */}
            <rect x="1" y="15" width="4" height="6" fill="#991b1b" />
            <rect x="2" y="16" width="3" height="4" fill="#fef08a" />
            <rect x="2" y="17" width="2" height="1" fill="#1e293b" />
          </g>

          {/* RIGHT ARM */}
          <g>
            <rect x="19" y="11" width="4" height="8" fill="#0d9488" />
            <rect x="19" y="19" width="4" height="2" fill="#fbcfe8" />
          </g>

          {/* HEAD & CAP */}
          <g className="mc-head-idle">
            {/* Head base (Skin) */}
            <rect x="8" y="3" width="11" height="8" fill="#fde68a" />
            <rect x="9" y="4" width="9" height="7" fill="#fef08a" />
            {/* Backwards Cap (Cyan) */}
            <rect x="7" y="2" width="13" height="4" fill="#06b6d4" />
            <rect x="6" y="4" width="2" height="2" fill="#0891b2" />
            {/* Hair peeking */}
            <rect x="8" y="6" width="2" height="3" fill="#78350f" />
            <rect x="17" y="6" width="2" height="3" fill="#78350f" />
            {/* Eyes */}
            <rect x="11" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="12" y="6" width="1" height="2" fill="#2563eb" />
            <rect x="15" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="16" y="6" width="1" height="2" fill="#2563eb" />
            {/* Smile */}
            <rect x="13" y="9" width="2" height="1" fill="#b45309" />
          </g>
        </svg>
      );

    case "DEV":
      // Developer: Minecraft dev skin with cyber visor, matrix hoodie, holding glowing Redstone Torch/terminal
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* LEGS */}
          <g>
            <rect x="9" y="21" width="4" height="8" fill="#18181b" />
            <rect x="9" y="25" width="4" height="1" fill="#22c55e" />
            <rect x="9" y="29" width="4" height="3" fill="#09090b" />
            <rect x="14" y="21" width="4" height="8" fill="#18181b" />
            <rect x="14" y="25" width="4" height="1" fill="#22c55e" />
            <rect x="14" y="29" width="4" height="3" fill="#09090b" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#27272a" />
            <rect x="9" y="12" width="9" height="8" fill="#3f3f46" />
            {/* Binary / Matrix circuit line */}
            <rect x="10" y="13" width="1" height="4" fill="#22c55e" />
            <rect x="12" y="15" width="3" height="1" fill="#22c55e" />
            <rect x="15" y="14" width="1" height="4" fill="#22c55e" />
            <rect x="13" y="17" width="2" height="1" fill="#4ade80" />
          </g>

          {/* LEFT ARM */}
          <g>
            <rect x="4" y="11" width="4" height="8" fill="#27272a" />
            <rect x="4" y="19" width="4" height="2" fill="#fed7aa" />
          </g>

          {/* RIGHT ARM (holding glowing redstone torch / terminal) */}
          <g className="mc-arm-idle">
            <rect x="19" y="11" width="4" height="7" fill="#27272a" />
            <rect x="19" y="18" width="4" height="2" fill="#fed7aa" />
            {/* Minecraft Redstone Torch / Glow Tool */}
            <rect x="22" y="14" width="2" height="7" fill="#78350f" />
            <rect x="21" y="11" width="4" height="3" fill="#ef4444" className="mc-item-pulse text-red-500" />
            <rect x="22" y="12" width="2" height="1" fill="#fef08a" />
          </g>

          {/* HEAD & CYBER VISOR */}
          <g className="mc-head-idle">
            <rect x="8" y="3" width="11" height="8" fill="#fed7aa" />
            {/* Dark Hair */}
            <rect x="7" y="2" width="13" height="4" fill="#09090b" />
            <rect x="7" y="4" width="2" height="4" fill="#09090b" />
            <rect x="18" y="4" width="2" height="4" fill="#09090b" />
            {/* Neon Green Cyber HUD Visor across eyes */}
            <rect
              x="8"
              y="6"
              width="11"
              height="3"
              fill="#22c55e"
              className="mc-item-pulse text-emerald-400"
            />
            <rect x="9" y="7" width="3" height="1" fill="#ffffff" />
            <rect x="14" y="7" width="4" height="1" fill="#bbf7d0" />
            {/* Mouth */}
            <rect x="12" y="10" width="3" height="1" fill="#9a3412" />
          </g>
        </svg>
      );

    case "DSN":
      // Designer: Minecraft designer skin with purple beret, glasses, palette & stylus
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* LEGS */}
          <g>
            <rect x="9" y="21" width="4" height="8" fill="#3b0764" />
            <rect x="9" y="29" width="4" height="3" fill="#9333ea" />
            <rect x="14" y="21" width="4" height="8" fill="#3b0764" />
            <rect x="14" y="29" width="4" height="3" fill="#9333ea" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#6b21a8" />
            <rect x="9" y="12" width="9" height="8" fill="#7e22ce" />
            {/* Palette swatch pins (Cyan, Magenta, Yellow dots) */}
            <rect x="10" y="14" width="2" height="2" fill="#06b6d4" />
            <rect x="13" y="14" width="2" height="2" fill="#ec4899" />
            <rect x="16" y="14" width="2" height="2" fill="#eab308" />
            <rect x="11" y="18" width="5" height="1" fill="#a855f7" />
          </g>

          {/* LEFT ARM (holding painter's color palette) */}
          <g className="mc-arm-idle">
            <rect x="4" y="11" width="4" height="7" fill="#6b21a8" />
            <rect x="4" y="18" width="4" height="2" fill="#fed7aa" />
            {/* Color Palette */}
            <rect x="0" y="16" width="5" height="5" fill="#d97706" rx="1" />
            <rect x="1" y="17" width="1" height="1" fill="#ef4444" />
            <rect x="3" y="17" width="1" height="1" fill="#3b82f6" />
            <rect x="1" y="19" width="1" height="1" fill="#10b981" />
            <rect x="3" y="19" width="1" height="1" fill="#facc15" />
          </g>

          {/* RIGHT ARM (holding stylus) */}
          <g>
            <rect x="19" y="11" width="4" height="8" fill="#6b21a8" />
            <rect x="19" y="19" width="4" height="2" fill="#fed7aa" />
            <rect x="22" y="17" width="1" height="5" fill="#f43f5e" />
            <rect x="22" y="16" width="1" height="1" fill="#fbcfe8" />
          </g>

          {/* HEAD & PURPLE BERET */}
          <g className="mc-head-idle">
            <rect x="8" y="3" width="11" height="8" fill="#fed7aa" />
            {/* Violet hair */}
            <rect x="7" y="5" width="2" height="4" fill="#a21caf" />
            <rect x="18" y="5" width="2" height="4" fill="#a21caf" />
            {/* Purple Beret tilted */}
            <rect x="6" y="2" width="14" height="3" fill="#9333ea" />
            <rect x="5" y="1" width="10" height="2" fill="#a855f7" />
            <rect x="9" y="0" width="2" height="1" fill="#c084fc" />
            {/* Designer Glasses */}
            <rect x="9" y="6" width="3" height="2" fill="#1f2937" />
            <rect x="10" y="7" width="1" height="1" fill="#ffffff" />
            <rect x="14" y="6" width="3" height="2" fill="#1f2937" />
            <rect x="15" y="7" width="1" height="1" fill="#ffffff" />
            <rect x="12" y="6" width="2" height="1" fill="#1f2937" />
            {/* Lips */}
            <rect x="12" y="9" width="3" height="1" fill="#e11d48" />
          </g>
        </svg>
      );

    case "FRL":
      // Freelancer: Minecraft skin with DJ headphones, flannel shirt, holding steaming hot coffee mug
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* LEGS */}
          <g>
            <rect x="9" y="21" width="4" height="8" fill="#854d0e" />
            <rect x="9" y="29" width="4" height="3" fill="#581c87" />
            <rect x="14" y="21" width="4" height="8" fill="#854d0e" />
            <rect x="14" y="29" width="4" height="3" fill="#581c87" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#ea580c" />
            <rect x="9" y="12" width="9" height="8" fill="#f97316" />
            {/* Flannel plaid lines */}
            <rect x="8" y="14" width="11" height="1" fill="#9a3412" />
            <rect x="8" y="18" width="11" height="1" fill="#9a3412" />
            <rect x="11" y="11" width="1" height="10" fill="#9a3412" />
            <rect x="15" y="11" width="1" height="10" fill="#9a3412" />
            {/* Messenger bag strap across chest */}
            <line x1="8" y1="12" x2="18" y2="20" stroke="#78350f" strokeWidth="1.5" />
          </g>

          {/* LEFT ARM */}
          <g>
            <rect x="4" y="11" width="4" height="8" fill="#ea580c" />
            <rect x="4" y="19" width="4" height="2" fill="#fed7aa" />
          </g>

          {/* RIGHT ARM (holding steaming coffee cup) */}
          <g className="mc-arm-idle">
            <rect x="19" y="11" width="4" height="7" fill="#ea580c" />
            <rect x="19" y="18" width="4" height="2" fill="#fed7aa" />
            {/* Coffee Mug */}
            <rect x="22" y="16" width="4" height="5" fill="#f8fafc" />
            <rect x="22" y="17" width="3" height="3" fill="#451a03" />
            <rect x="25" y="17" width="2" height="3" fill="#e2e8f0" />
            {/* Animated Steam Particles */}
            <circle cx="23" cy="13" r="0.8" fill="#e2e8f0" className="mc-steam-1" />
            <circle cx="25" cy="11" r="0.9" fill="#e2e8f0" className="mc-steam-2" />
          </g>

          {/* HEAD & OVER-EAR HEADPHONES */}
          <g className="mc-head-idle">
            <rect x="8" y="3" width="11" height="8" fill="#fed7aa" />
            {/* Messy Brown Hair */}
            <rect x="7" y="2" width="13" height="4" fill="#5c2d12" />
            <rect x="7" y="4" width="2" height="3" fill="#5c2d12" />
            <rect x="18" y="4" width="2" height="3" fill="#5c2d12" />
            {/* Headphone Band */}
            <rect x="7" y="1" width="13" height="2" fill="#334155" />
            {/* Big Orange Ear Cups on sides */}
            <rect x="6" y="4" width="3" height="5" fill="#f97316" />
            <rect x="7" y="5" width="1" height="3" fill="#fed7aa" />
            <rect x="18" y="4" width="3" height="5" fill="#f97316" />
            <rect x="19" y="5" width="1" height="3" fill="#fed7aa" />
            {/* Eyes */}
            <rect x="10" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="11" y="6" width="1" height="2" fill="#475569" />
            <rect x="14" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="15" y="6" width="1" height="2" fill="#475569" />
            {/* Mouth */}
            <rect x="12" y="9" width="3" height="1" fill="#7c2d12" />
          </g>
        </svg>
      );

    case "PRO":
      // Professional: Sharp business suit, signature purple tie, gold glasses, briefcase
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* LEGS */}
          <g>
            <rect x="9" y="21" width="4" height="8" fill="#0f172a" />
            <rect x="9" y="29" width="4" height="3" fill="#020617" />
            <rect x="14" y="21" width="4" height="8" fill="#0f172a" />
            <rect x="14" y="29" width="4" height="3" fill="#020617" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#0f172a" />
            {/* White dress shirt V */}
            <polygon points="11,11 16,11 14,16 13,16" fill="#ffffff" />
            {/* Blackout Signature Purple Silk Tie */}
            <polygon points="13,12 14,12 14.5,18 13.5,19 12.5,18" fill="#a855f7" />
            {/* Suit Lapels & buttons */}
            <rect x="8" y="11" width="3" height="9" fill="#1e293b" />
            <rect x="16" y="11" width="3" height="9" fill="#1e293b" />
            <rect x="13" y="19" width="1" height="1" fill="#e2e8f0" />
          </g>

          {/* LEFT ARM (holding briefcase) */}
          <g className="mc-arm-idle">
            <rect x="4" y="11" width="4" height="7" fill="#0f172a" />
            <rect x="4" y="18" width="4" height="2" fill="#fed7aa" />
            {/* Leather Briefcase */}
            <rect x="0" y="17" width="5" height="7" fill="#451a03" rx="0.5" />
            <rect x="1" y="18" width="3" height="1" fill="#78350f" />
            <rect x="2" y="20" width="1" height="1" fill="#eab308" />
          </g>

          {/* RIGHT ARM */}
          <g>
            <rect x="19" y="11" width="4" height="8" fill="#0f172a" />
            <rect x="19" y="19" width="4" height="2" fill="#fed7aa" />
          </g>

          {/* HEAD & SLICKED HAIR */}
          <g className="mc-head-idle">
            <rect x="8" y="3" width="11" height="8" fill="#fed7aa" />
            {/* Slicked Black Hair with side part */}
            <rect x="7" y="2" width="13" height="3" fill="#09090b" />
            <rect x="7" y="4" width="2" height="4" fill="#09090b" />
            <rect x="18" y="4" width="2" height="4" fill="#09090b" />
            <rect x="12" y="2" width="1" height="2" fill="#27272a" />
            {/* Wireframe Gold Glasses */}
            <rect x="9" y="6" width="3" height="2" fill="#eab308" />
            <rect x="10" y="7" width="1" height="1" fill="#ffffff" />
            <rect x="14" y="6" width="3" height="2" fill="#eab308" />
            <rect x="15" y="7" width="1" height="1" fill="#ffffff" />
            <rect x="12" y="6" width="2" height="1" fill="#eab308" />
            {/* Confident smirk */}
            <rect x="13" y="9" width="3" height="1" fill="#7c2d12" />
          </g>
        </svg>
      );

    case "FND":
      // Founder: Golden Minecraft Crown, executive suit, glowing Nether Star / rocket pin
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* LEGS */}
          <g>
            <rect x="9" y="21" width="4" height="8" fill="#1e1b4b" />
            <rect x="9" y="29" width="4" height="3" fill="#eab308" />
            <rect x="14" y="21" width="4" height="8" fill="#1e1b4b" />
            <rect x="14" y="29" width="4" height="3" fill="#eab308" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#312e81" />
            <rect x="9" y="12" width="9" height="8" fill="#4338ca" />
            {/* Gold Lapel Trim */}
            <rect x="8" y="11" width="1" height="9" fill="#eab308" />
            <rect x="18" y="11" width="1" height="9" fill="#eab308" />
            {/* Rocket pin */}
            <polygon points="13,13 15,13 14,16" fill="#f59e0b" />
            <circle cx="14" cy="14" r="0.7" fill="#ef4444" />
          </g>

          {/* LEFT ARM */}
          <g>
            <rect x="4" y="11" width="4" height="8" fill="#312e81" />
            <rect x="4" y="19" width="4" height="2" fill="#fed7aa" />
          </g>

          {/* RIGHT ARM (holding glowing Nether Star / Founder Gem) */}
          <g className="mc-arm-idle">
            <rect x="19" y="11" width="4" height="7" fill="#312e81" />
            <rect x="19" y="18" width="4" height="2" fill="#fed7aa" />
            {/* Minecraft Nether Star */}
            <g className="mc-item-pulse text-amber-300">
              <polygon
                points="23,12 25,15 22,15 24,18 21,15 24,15"
                fill="#fbbf24"
              />
              <circle cx="23" cy="15" r="1" fill="#fef08a" />
              <rect x="22" y="14" width="2" height="2" fill="#ffffff" />
            </g>
          </g>

          {/* HEAD & GOLDEN MINECRAFT CROWN */}
          <g className="mc-head-idle">
            <rect x="8" y="3" width="11" height="8" fill="#fed7aa" />
            {/* Hair */}
            <rect x="7" y="5" width="2" height="3" fill="#1e1b4b" />
            <rect x="18" y="5" width="2" height="3" fill="#1e1b4b" />
            {/* Golden Minecraft Crown with Gemstones */}
            <rect x="7" y="1" width="13" height="3" fill="#eab308" />
            <polygon points="7,1 9,-1 11,1 13,-1 15,1 17,-1 19,1" fill="#facc15" />
            {/* Rubies & Emeralds on crown */}
            <rect x="9" y="2" width="1" height="1" fill="#ef4444" />
            <rect x="13" y="2" width="1" height="1" fill="#10b981" />
            <rect x="17" y="2" width="1" height="1" fill="#ef4444" />
            {/* Confident Eyes */}
            <rect x="10" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="11" y="6" width="1" height="2" fill="#4338ca" />
            <rect x="14" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="15" y="6" width="1" height="2" fill="#4338ca" />
            {/* Smile */}
            <rect x="12" y="9" width="3" height="1" fill="#9a3412" />
          </g>
        </svg>
      );

    case "ANY":
    default:
      // Anyone who builds: Master Builder with hardhat, tool vest, holding iconic Minecraft Diamond Pickaxe
      return (
        <svg
          viewBox="0 0 28 34"
          className="h-12 w-10 sm:h-14 sm:w-11 overflow-visible"
          style={svgStyle}
        >
          {/* LEGS */}
          <g>
            <rect x="9" y="21" width="4" height="8" fill="#1e3a8a" />
            <rect x="9" y="29" width="4" height="3" fill="#475569" />
            <rect x="14" y="21" width="4" height="8" fill="#1e3a8a" />
            <rect x="14" y="29" width="4" height="3" fill="#475569" />
          </g>

          {/* TORSO */}
          <g>
            <rect x="8" y="11" width="11" height="10" fill="#ea580c" />
            <rect x="9" y="12" width="9" height="8" fill="#f97316" />
            {/* High-visibility reflective silver safety stripes */}
            <rect x="8" y="14" width="11" height="2" fill="#e2e8f0" />
            <rect x="8" y="18" width="11" height="1" fill="#e2e8f0" />
            {/* Tool belt */}
            <rect x="8" y="19" width="11" height="2" fill="#78350f" />
            <rect x="13" y="19" width="2" height="2" fill="#eab308" />
          </g>

          {/* LEFT ARM */}
          <g>
            <rect x="4" y="11" width="4" height="8" fill="#ea580c" />
            <rect x="4" y="19" width="4" height="2" fill="#78350f" />
          </g>

          {/* RIGHT ARM (holding iconic Minecraft Diamond Pickaxe) */}
          <g className="mc-arm-idle">
            <rect x="19" y="11" width="4" height="7" fill="#ea580c" />
            <rect x="19" y="18" width="4" height="2" fill="#78350f" />
            {/* Minecraft Diamond Pickaxe */}
            {/* Wooden Handle (Diagonal) */}
            <rect x="21" y="20" width="2" height="2" fill="#78350f" />
            <rect x="22" y="18" width="2" height="2" fill="#78350f" />
            <rect x="23" y="16" width="2" height="2" fill="#78350f" />
            <rect x="24" y="14" width="2" height="2" fill="#78350f" />
            {/* Diamond Pickaxe Head */}
            <g className="mc-item-pulse text-cyan-300">
              <rect x="23" y="11" width="4" height="3" fill="#06b6d4" />
              <rect x="21" y="10" width="3" height="3" fill="#22d3ee" />
              <rect x="20" y="8" width="2" height="3" fill="#67e8f9" />
              <rect x="26" y="13" width="2" height="3" fill="#0891b2" />
              <rect x="27" y="15" width="1" height="2" fill="#0e7490" />
              {/* Enchanted Glint Shimmer */}
              <circle cx="21" cy="9" r="1.2" fill="#ffffff" className="mc-glint" />
            </g>
          </g>

          {/* HEAD & BUILDER HARDHAT */}
          <g className="mc-head-idle">
            <rect x="8" y="3" width="11" height="8" fill="#fed7aa" />
            {/* Builder Safety Hardhat (Yellow) */}
            <rect x="7" y="1" width="13" height="4" fill="#eab308" />
            <rect x="6" y="4" width="15" height="2" fill="#ca8a04" />
            <rect x="12" y="0" width="3" height="2" fill="#facc15" />
            {/* Hardhat front light / emblem */}
            <rect x="12" y="3" width="3" height="2" fill="#ffffff" />
            {/* Eyes */}
            <rect x="10" y="7" width="2" height="2" fill="#ffffff" />
            <rect x="11" y="7" width="1" height="2" fill="#0284c7" />
            <rect x="14" y="7" width="2" height="2" fill="#ffffff" />
            <rect x="15" y="7" width="1" height="2" fill="#0284c7" />
            {/* Confident Smile */}
            <rect x="12" y="10" width="3" height="1" fill="#78350f" />
          </g>
        </svg>
      );
  }
}
