import React from "react";

interface CrossedDuctTapeProps {
  label1?: string;
  label2?: string;
}

/**
 * Realistic crossed yellow-and-black hazard caution duct tape overlay.
 * Forms an authentic, tactile "X" cross pattern with diagonal hazard stripes,
 * heavy industrial drop shadows, realistic tape gloss, and warning badges.
 */
export function CrossedDuctTape({
  label1 = "DO NOT CROSS // RESTRICTED",
  label2 = "CLASSIFIED // ACCESS DENIED",
}: CrossedDuctTapeProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden flex items-center justify-center select-none">
      {/* Tape 1: Slanted top-left to bottom-right */}
      <div
        className="absolute w-[160%] h-9 -rotate-[26deg] border-y-2 border-black shadow-[0_8px_25px_rgba(0,0,0,0.92)] flex items-center justify-center select-none"
        style={{
          background:
            "repeating-linear-gradient(45deg, #facc15, #facc15 16px, #0a0a0a 16px, #0a0a0a 32px)",
          boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.6)",
        }}
      >
        <span className="bg-black/95 text-amber-300 font-pixel text-[8px] sm:text-[9px] tracking-[0.25em] px-3.5 py-1 border-x-2 border-amber-400 shadow-xl uppercase font-bold">
          ⚠ {label1} ⚠
        </span>
      </div>

      {/* Tape 2: Slanted bottom-left to top-right */}
      <div
        className="absolute w-[160%] h-9 rotate-[26deg] border-y-2 border-black shadow-[0_10px_30px_rgba(0,0,0,0.95)] flex items-center justify-center select-none"
        style={{
          background:
            "repeating-linear-gradient(-45deg, #facc15, #facc15 16px, #0a0a0a 16px, #0a0a0a 32px)",
          boxShadow: "0 12px 28px -2px rgba(0, 0, 0, 0.95), inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.6)",
        }}
      >
        <span className="bg-black/95 text-amber-300 font-pixel text-[8px] sm:text-[9px] tracking-[0.25em] px-3.5 py-1 border-x-2 border-amber-400 shadow-xl uppercase font-bold">
          ⚠ {label2} ⚠
        </span>
      </div>
    </div>
  );
}

/**
 * Horizontal heavy-duty hazard caution duct tape strip to completely cover & hide prices.
 * Features textured yellow and black hazard lines and an authentic warning stamp.
 */
export function PriceDuctTape({ label = "PRICE SEALED" }: { label?: string }) {
  return (
    <div
      className="absolute inset-x-[-15%] -rotate-2 border-y-2 border-black py-2 shadow-[0_8px_20px_rgba(0,0,0,0.95)] flex items-center justify-center select-none z-20"
      style={{
        background:
          "repeating-linear-gradient(45deg, #facc15, #facc15 14px, #0a0a0a 14px, #0a0a0a 28px)",
        boxShadow: "0 8px 22px rgba(0, 0, 0, 0.95), inset 0 1px 3px rgba(255,255,255,0.45), inset 0 -1px 3px rgba(0,0,0,0.7)",
      }}
    >
      <div className="bg-black/95 px-4 py-1 border border-amber-400 font-pixel text-[9px] text-amber-300 tracking-[0.25em] flex items-center gap-2 shadow-xl">
        <span className="text-amber-400 animate-pulse">⚠</span>
        <span className="font-bold">{label}</span>
        <span className="text-amber-400 animate-pulse">⚠</span>
      </div>
    </div>
  );
}
