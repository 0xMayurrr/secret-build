import type { RegistrationRecord } from "./supabase";
import { BUILDICY_LOGO_DATA_URL } from "./buildicyLogoBase64";
import { BLACKOUT_LOGO_DATA_URL } from "./blackoutLogoBase64";

/**
 * Helper to render an authentic fallback SVG vector QR code when base64 is still generating.
 */
function renderVectorQrSvg(x: number, y: number, size: number, qrDataUrl?: string): string {
  if (qrDataUrl) {
    return `
    <image href="${qrDataUrl}" x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" />
    `;
  }

  // Ultra-crisp vector QR pattern (25x25 matrix)
  const cellSize = size / 25;
  return `
  <g transform="translate(${x}, ${y})">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="6" />
    <!-- Finder pattern Top-Left -->
    <rect x="${0 * cellSize}" y="${0 * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000000" />
    <rect x="${1 * cellSize}" y="${1 * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff" />
    <rect x="${2 * cellSize}" y="${2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000000" />
    <!-- Finder pattern Top-Right -->
    <rect x="${18 * cellSize}" y="${0 * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000000" />
    <rect x="${19 * cellSize}" y="${1 * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff" />
    <rect x="${20 * cellSize}" y="${2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000000" />
    <!-- Finder pattern Bottom-Left -->
    <rect x="${0 * cellSize}" y="${18 * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000000" />
    <rect x="${1 * cellSize}" y="${19 * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff" />
    <rect x="${2 * cellSize}" y="${20 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000000" />
    <!-- Timing Lines -->
    <rect x="${8 * cellSize}" y="${6 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${10 * cellSize}" y="${6 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${12 * cellSize}" y="${6 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${14 * cellSize}" y="${6 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${16 * cellSize}" y="${6 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${6 * cellSize}" y="${8 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${6 * cellSize}" y="${10 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${6 * cellSize}" y="${12 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${6 * cellSize}" y="${14 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <rect x="${6 * cellSize}" y="${16 * cellSize}" width="${1 * cellSize}" height="${1 * cellSize}" fill="#000000" />
    <!-- Data modules -->
    <rect x="${8 * cellSize}" y="${2 * cellSize}" width="${2 * cellSize}" height="${3 * cellSize}" fill="#000000" />
    <rect x="${12 * cellSize}" y="${1 * cellSize}" width="${3 * cellSize}" height="${2 * cellSize}" fill="#000000" />
    <rect x="${9 * cellSize}" y="${9 * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000000" />
    <rect x="${10 * cellSize}" y="${10 * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff" />
    <rect x="${11 * cellSize}" y="${11 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000000" />
    <rect x="${18 * cellSize}" y="${9 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000000" />
    <rect x="${22 * cellSize}" y="${10 * cellSize}" width="${2 * cellSize}" height="${4 * cellSize}" fill="#000000" />
    <rect x="${18 * cellSize}" y="${14 * cellSize}" width="${4 * cellSize}" height="${2 * cellSize}" fill="#000000" />
    <rect x="${9 * cellSize}" y="${18 * cellSize}" width="${2 * cellSize}" height="${4 * cellSize}" fill="#000000" />
    <rect x="${13 * cellSize}" y="${19 * cellSize}" width="${3 * cellSize}" height="${2 * cellSize}" fill="#000000" />
    <rect x="${18 * cellSize}" y="${18 * cellSize}" width="${3 * cellSize}" height="${4 * cellSize}" fill="#000000" />
    <rect x="${22 * cellSize}" y="${19 * cellSize}" width="${2 * cellSize}" height="${3 * cellSize}" fill="#000000" />
  </g>
  `;
}

/**
 * Generates an SVG Data URI for the FRONT of the physical lanyard badge.
 * Designed exactly to match the official Blackout Hackathon ID card:
 * 3D Blackout graffiti logo, ANNUAL HACKATHON BY BUILDICY, rounded glowing purple photo container
 * with white participant avatar silhouette, bold "PARTICIPANT" designation, 3 sleek rounded rows
 * (NAME, TEAM, ID), lime-green "/// THE UNKNOWN AWAITS" slanted ribbon, and QR code in corner tick brackets.
 */
export function generateBadgeFrontSvg(record: Partial<RegistrationRecord>, qrDataUrl?: string): string {
  const name = (record.full_name || "PARTICIPANT NAME").toUpperCase();
  const regId = (record.registration_id || "BLK-2026-0001").toUpperCase();
  const team = record.team_name ? record.team_name.toUpperCase() : "SOLO OPERATIVE";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1440" viewBox="0 0 1024 1440">
  <defs>
    <!-- Dark Obsidian / Cyber Midnight Gradient -->
    <linearGradient id="cyberBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b0914" />
      <stop offset="40%" stop-color="#140d24" />
      <stop offset="70%" stop-color="#0f0a1c" />
      <stop offset="100%" stop-color="#07050d" />
    </linearGradient>

    <!-- Glowing Purple Drop Shadow -->
    <filter id="purpleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#a855f7" flood-opacity="0.9" />
    </filter>

    <!-- Perimeter Neon Edge Glow -->
    <filter id="neonBorderGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#9333ea" flood-opacity="0.95" />
    </filter>

    <!-- Subtle Cyber Micro-Grid Pattern -->
    <pattern id="techGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(147, 51, 234, 0.08)" stroke-width="1" />
      <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(147, 51, 234, 0.08)" stroke-width="1" />
    </pattern>

    <!-- Translucent Clear Coat Sheen -->
    <linearGradient id="cardSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.16)" />
      <stop offset="30%" stop-color="rgba(255,255,255,0.03)" />
      <stop offset="60%" stop-color="transparent" />
      <stop offset="85%" stop-color="rgba(168,85,247,0.06)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.12)" />
    </linearGradient>

    <!-- Cyber Cross Mark -->
    <g id="cyberCrossMark">
      <path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke="#7e22ce" stroke-width="12" stroke-linecap="round" opacity="0.32" />
    </g>
  </defs>

  <!-- 1. Base Dark Card Surface -->
  <rect width="1024" height="1440" fill="url(#cyberBg)" />

  <!-- 2. Cyber Micro Grid Pattern -->
  <rect width="1024" height="1440" fill="url(#techGrid)" />

  <!-- 3. Ambient Electric Purple Paint Sprays & Diagonal Energy Streaks -->
  <path d="M 800 60 L 980 220 L 930 260 L 750 100 Z" fill="#7e22ce" opacity="0.45" filter="blur(18px)" />
  <path d="M 40 850 L 260 1060 L 210 1100 L 0 890 Z" fill="#7e22ce" opacity="0.4" filter="blur(20px)" />
  <path d="M 760 480 L 980 660 L 940 700 L 720 520 Z" fill="#9333ea" opacity="0.35" filter="blur(16px)" />
  <circle cx="850" cy="180" r="140" fill="#9333ea" opacity="0.18" filter="blur(40px)" />
  <circle cx="160" cy="950" r="130" fill="#9333ea" opacity="0.16" filter="blur(40px)" />

  <!-- 4. Cyber Cross Accents (X mark on middle-left and corners) -->
  <g transform="translate(140, 830) scale(1.4)">
    <use href="#cyberCrossMark" />
  </g>
  <g transform="translate(900, 160) scale(1.1)">
    <use href="#cyberCrossMark" />
  </g>

  <!-- 5. Outer Neon Purple Border Line with Rounded Corners -->
  <rect x="46" y="46" width="932" height="1348" rx="42" fill="none" stroke="#9333ea" stroke-width="4.5" filter="url(#neonBorderGlow)" />
  <rect x="54" y="54" width="916" height="1332" rx="36" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

  <!-- 6. Top-left Triple Tech Slashes (///) -->
  <g stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" opacity="0.85">
    <line x1="74" y1="92" x2="84" y2="72" />
    <line x1="86" y1="92" x2="96" y2="72" />
    <line x1="98" y1="92" x2="108" y2="72" />
  </g>

  <!-- 7. Left and Right Border Neon Docking Tabs -->
  <rect x="46" y="460" width="10" height="90" rx="3" fill="#9333ea" filter="url(#neonBorderGlow)" />
  <rect x="968" y="460" width="10" height="90" rx="3" fill="#9333ea" filter="url(#neonBorderGlow)" />
  <rect x="968" y="780" width="10" height="130" rx="3" fill="#9333ea" filter="url(#neonBorderGlow)" />

  <!-- 8. Top Oval Slot Cutout for Lanyard Clip -->
  <rect x="412" y="48" width="200" height="34" rx="17" fill="#000000" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" />
  <circle cx="370" cy="65" r="7" fill="#000000" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" />
  <circle cx="654" cy="65" r="7" fill="#000000" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" />

  <!-- ========================================================= -->
  <!-- 9. HEADER: 3D GRAFFITI BLACKOUT LOGO -->
  <!-- ========================================================= -->
  <g filter="url(#purpleGlow)">
    <image href="${BLACKOUT_LOGO_DATA_URL}" x="162" y="112" width="700" height="205" preserveAspectRatio="xMidYMid meet" />
  </g>

  <!-- Subtitle: ANNUAL HACKATHON with flanking divider lines -->
  <line x1="150" y1="324" x2="280" y2="324" stroke="rgba(168, 85, 247, 0.7)" stroke-width="2" />
  <text x="512" y="331" font-family="'Courier New', monospace" font-size="22" font-weight="900" fill="#e9d5ff" text-anchor="middle" letter-spacing="12">A N N U A L   H A C K A T H O N</text>
  <line x1="744" y1="324" x2="874" y2="324" stroke="rgba(168, 85, 247, 0.7)" stroke-width="2" />

  <!-- Organizer Credit: BY [Buildicy Logo] BUILDICY -->
  <g transform="translate(0, 380)">
    <text x="435" y="0" font-family="monospace" font-size="18" font-weight="900" fill="#c084fc" letter-spacing="4">BY</text>
    <image href="${BUILDICY_LOGO_DATA_URL}" x="470" y="-26" width="44" height="36" preserveAspectRatio="xMidYMid meet" />
    <text x="525" y="0" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" letter-spacing="6">BUILDICY</text>
  </g>

  <!-- ========================================================= -->
  <!-- 10. CENTER: PHOTO CONTAINER WITH PARTICIPANT SILHOUETTE -->
  <!-- ========================================================= -->
  <!-- Container Box -->
  <rect x="352" y="435" width="320" height="320" rx="34" fill="rgba(20, 15, 36, 0.95)" stroke="#9333ea" stroke-width="4" filter="url(#purpleGlow)" />
  <rect x="360" y="443" width="304" height="304" rx="28" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

  <!-- Avatar Silhouette Icon -->
  <g fill="#ffffff">
    <!-- Circular Head -->
    <circle cx="512" cy="540" r="54" />
    <!-- Rounded Torso -->
    <path d="M 432 675 C 432 602 465 602 512 602 C 559 602 592 602 592 675 Z" />
  </g>

  <!-- Corner Brackets around Photo Container -->
  <g stroke="#c084fc" stroke-width="2.5" fill="none">
    <path d="M 334 475 L 334 445 Q 334 425 354 425 L 384 425" />
    <path d="M 690 475 L 690 445 Q 690 425 670 425 L 640 425" />
    <path d="M 334 715 L 334 745 Q 334 765 354 765 L 384 765" />
    <path d="M 690 715 L 690 745 Q 690 765 670 765 L 640 765" />
  </g>

  <!-- ========================================================= -->
  <!-- 11. PARTICIPANT DESIGNATION TITLE -->
  <!-- ========================================================= -->
  <text x="512" y="828" font-family="'Impact', 'Arial Black', sans-serif" font-size="54" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="8">PARTICIPANT</text>

  <!-- ========================================================= -->
  <!-- 12. THREE SKEW/ROUNDED CREDENTIAL DATA BARS -->
  <!-- ========================================================= -->
  <!-- Row 1: NAME -->
  <g transform="translate(180, 870)">
    <rect width="664" height="60" rx="14" fill="rgba(18, 14, 32, 0.9)" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1.5" />
    <text x="35" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#c084fc" letter-spacing="4">NAME</text>
    <text x="130" y="38" font-family="monospace" font-size="20" font-weight="700" fill="#6b7280">:</text>
    <text x="170" y="39" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#ffffff" letter-spacing="3">${name}</text>
  </g>

  <!-- Row 2: TEAM -->
  <g transform="translate(180, 946)">
    <rect width="664" height="60" rx="14" fill="rgba(18, 14, 32, 0.9)" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1.5" />
    <text x="35" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#c084fc" letter-spacing="4">TEAM</text>
    <text x="130" y="38" font-family="monospace" font-size="20" font-weight="700" fill="#6b7280">:</text>
    <text x="170" y="39" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#ffffff" letter-spacing="3">${team}</text>
  </g>

  <!-- Row 3: ID -->
  <g transform="translate(180, 1022)">
    <rect width="664" height="60" rx="14" fill="rgba(18, 14, 32, 0.9)" stroke="rgba(168, 85, 247, 0.35)" stroke-width="1.5" />
    <text x="35" y="38" font-family="monospace" font-size="20" font-weight="900" fill="#c084fc" letter-spacing="4">ID</text>
    <text x="130" y="38" font-family="monospace" font-size="20" font-weight="700" fill="#6b7280">:</text>
    <text x="170" y="39" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#38bdf8" letter-spacing="3">${regId}</text>
  </g>

  <!-- ========================================================= -->
  <!-- 13. FOOTER: SLANTED LIME-GREEN BANNER & QR CODE -->
  <!-- ========================================================= -->
  <!-- Slanted Neon-Lime Ribbon: /// THE UNKNOWN AWAITS -->
  <g transform="translate(180, 1140)">
    <polygon points="12,0 360,0 348,60 0,60" fill="#bef264" />
    <line x1="20" y1="46" x2="30" y2="14" stroke="#000000" stroke-width="6" stroke-linecap="round" />
    <line x1="32" y1="46" x2="42" y2="14" stroke="#000000" stroke-width="6" stroke-linecap="round" />
    <line x1="44" y1="46" x2="54" y2="14" stroke="#000000" stroke-width="6" stroke-linecap="round" />
    <text x="68" y="41" font-family="'Courier New', monospace" font-size="21" font-weight="900" fill="#000000" letter-spacing="3">THE UNKNOWN AWAITS</text>
  </g>

  <!-- QR Code framed with purple corner tick brackets -->
  ${renderVectorQrSvg(704, 1100, 140, qrDataUrl)}

  <g stroke="#a855f7" stroke-width="3.5" fill="none">
    <path d="M 692 1120 L 692 1100 L 712 1100" />
    <path d="M 856 1120 L 856 1100 L 836 1100" />
    <path d="M 692 1220 L 692 1240 L 712 1240" />
    <path d="M 856 1220 L 856 1240 L 836 1240" />
  </g>

  <!-- Clear Coat Reflection Sheen -->
  <rect x="46" y="46" width="932" height="1348" rx="42" fill="url(#cardSheen)" pointer-events="none" />
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URI for the BACK of the physical lanyard badge.
 * Designed exactly matching the attached reference design:
 * Blackout 3D graffiti logo, ANNUAL HACKATHON BY BUILDICY, large rounded "PARTICIPANT DETAILS" container
 * with 4 structured rows (EVENT DATE, LOCATION, EMERGENCY CONTACT, CHECK-IN) with custom glowing icon badges,
 * horizontal barcode, and QR code with footer text "PRESENT THIS BADGE FOR EVENT ACCESS ///".
 */
export function generateBadgeBackSvg(record?: Partial<RegistrationRecord>, qrDataUrl?: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1440" viewBox="0 0 1024 1440">
  <defs>
    <!-- Dark Obsidian / Cyber Midnight Gradient -->
    <linearGradient id="cyberBgBack" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b0914" />
      <stop offset="40%" stop-color="#140d24" />
      <stop offset="70%" stop-color="#0f0a1c" />
      <stop offset="100%" stop-color="#07050d" />
    </linearGradient>

    <!-- Glowing Purple Drop Shadow -->
    <filter id="purpleGlowBack" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#a855f7" flood-opacity="0.9" />
    </filter>

    <!-- Perimeter Neon Edge Glow -->
    <filter id="neonBorderGlowBack" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#9333ea" flood-opacity="0.95" />
    </filter>

    <!-- Subtle Cyber Micro-Grid Pattern -->
    <pattern id="techGridBack" width="40" height="40" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(147, 51, 234, 0.08)" stroke-width="1" />
      <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(147, 51, 234, 0.08)" stroke-width="1" />
    </pattern>

    <!-- Cyber Cross Mark -->
    <g id="cyberCrossMarkBack">
      <path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke="#7e22ce" stroke-width="12" stroke-linecap="round" opacity="0.32" />
    </g>
  </defs>

  <!-- 1. Base Dark Card Surface -->
  <rect width="1024" height="1440" fill="url(#cyberBgBack)" />

  <!-- 2. Cyber Micro Grid Pattern -->
  <rect width="1024" height="1440" fill="url(#techGridBack)" />

  <!-- 3. Ambient Electric Purple Paint Sprays -->
  <path d="M 800 60 L 980 220 L 930 260 L 750 100 Z" fill="#7e22ce" opacity="0.45" filter="blur(18px)" />
  <path d="M 40 850 L 260 1060 L 210 1100 L 0 890 Z" fill="#7e22ce" opacity="0.4" filter="blur(20px)" />
  <circle cx="850" cy="180" r="140" fill="#9333ea" opacity="0.18" filter="blur(40px)" />

  <!-- 4. Cyber Cross Accents (X mark top right) -->
  <g transform="translate(860, 160) scale(1.4)">
    <use href="#cyberCrossMarkBack" />
  </g>

  <!-- 5. Outer Neon Purple Border Line -->
  <rect x="46" y="46" width="932" height="1348" rx="42" fill="none" stroke="#9333ea" stroke-width="4.5" filter="url(#neonBorderGlowBack)" />
  <rect x="54" y="54" width="916" height="1332" rx="36" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

  <!-- 6. Top Slot Cutout for Lanyard Clip -->
  <rect x="412" y="48" width="200" height="34" rx="17" fill="#000000" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" />
  <circle cx="370" cy="65" r="7" fill="#000000" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" />
  <circle cx="654" cy="65" r="7" fill="#000000" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" />

  <!-- ========================================================= -->
  <!-- 7. HEADER: 3D GRAFFITI BLACKOUT LOGO -->
  <!-- ========================================================= -->
  <g filter="url(#purpleGlowBack)">
    <image href="${BLACKOUT_LOGO_DATA_URL}" x="162" y="112" width="700" height="205" preserveAspectRatio="xMidYMid meet" />
  </g>

  <!-- Subtitle: ANNUAL HACKATHON with flanking lines -->
  <line x1="150" y1="324" x2="280" y2="324" stroke="rgba(168, 85, 247, 0.7)" stroke-width="2" />
  <text x="512" y="331" font-family="'Courier New', monospace" font-size="22" font-weight="900" fill="#e9d5ff" text-anchor="middle" letter-spacing="12">A N N U A L   H A C K A T H O N</text>
  <line x1="744" y1="324" x2="874" y2="324" stroke="rgba(168, 85, 247, 0.7)" stroke-width="2" />

  <!-- Organizer Credit: BY [Buildicy Logo] BUILDICY -->
  <g transform="translate(0, 380)">
    <text x="435" y="0" font-family="monospace" font-size="18" font-weight="900" fill="#c084fc" letter-spacing="4">BY</text>
    <image href="${BUILDICY_LOGO_DATA_URL}" x="470" y="-26" width="44" height="36" preserveAspectRatio="xMidYMid meet" />
    <text x="525" y="0" font-family="monospace" font-size="18" font-weight="900" fill="#ffffff" letter-spacing="6">BUILDICY</text>
  </g>

  <!-- ========================================================= -->
  <!-- 8. PARTICIPANT DETAILS CARD CONTAINER -->
  <!-- ========================================================= -->
  <rect x="150" y="420" width="724" height="600" rx="26" fill="rgba(16, 12, 30, 0.95)" stroke="#9333ea" stroke-width="3" filter="url(#purpleGlowBack)" />
  <rect x="158" y="428" width="708" height="584" rx="20" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

  <!-- Title Inside Box -->
  <text x="195" y="475" font-family="'Impact', 'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="4">PARTICIPANT DETAILS</text>
  <line x1="175" y1="505" x2="849" y2="505" stroke="rgba(168, 85, 247, 0.3)" stroke-width="1.5" />

  <!-- Row 1: EVENT DATE (28 NOV 2026) -->
  <g transform="translate(185, 526)">
    <!-- Icon Box -->
    <rect width="64" height="64" rx="14" fill="#201538" stroke="rgba(168, 85, 247, 0.5)" stroke-width="1.5" />
    <!-- Calendar SVG Icon -->
    <g transform="translate(18, 16)">
      <rect x="0" y="4" width="28" height="26" rx="4" fill="none" stroke="#c084fc" stroke-width="2.5" />
      <line x1="8" y1="0" x2="8" y2="8" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round" />
      <line x1="20" y1="0" x2="20" y2="8" stroke="#c084fc" stroke-width="2.5" stroke-linecap="round" />
      <line x1="0" y1="12" x2="28" y2="12" stroke="#c084fc" stroke-width="2.5" />
    </g>
    <!-- Label & Value -->
    <text x="90" y="24" font-family="monospace" font-size="16" font-weight="700" fill="#9ca3af" letter-spacing="3">EVENT DATE</text>
    <text x="90" y="54" font-family="'Courier New', monospace" font-size="26" font-weight="900" fill="#ffffff" letter-spacing="2">28 NOV 2026</text>
  </g>
  <line x1="185" y1="610" x2="839" y2="610" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />

  <!-- Row 2: LOCATION (COIMBATORE, TAMIL NADU) -->
  <g transform="translate(185, 630)">
    <!-- Icon Box -->
    <rect width="64" height="64" rx="14" fill="#201538" stroke="rgba(168, 85, 247, 0.5)" stroke-width="1.5" />
    <!-- Location Pin SVG Icon -->
    <g transform="translate(18, 16)">
      <path d="M 14 2 C 7.5 2 2 7.5 2 14 C 2 22 14 32 14 32 C 14 32 26 22 26 14 C 26 7.5 20.5 2 14 2 Z" fill="none" stroke="#c084fc" stroke-width="2.5" />
      <circle cx="14" cy="13" r="4.5" fill="#c084fc" />
    </g>
    <!-- Label & Value -->
    <text x="90" y="24" font-family="monospace" font-size="16" font-weight="700" fill="#9ca3af" letter-spacing="3">LOCATION</text>
    <text x="90" y="54" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#ffffff" letter-spacing="2">COIMBATORE, TAMIL NADU</text>
  </g>
  <line x1="185" y1="714" x2="839" y2="714" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />

  <!-- Row 3: EMERGENCY CONTACT ([EVENT CONTACT]) -->
  <g transform="translate(185, 734)">
    <!-- Icon Box -->
    <rect width="64" height="64" rx="14" fill="#201538" stroke="rgba(168, 85, 247, 0.5)" stroke-width="1.5" />
    <!-- Phone SVG Icon -->
    <g transform="translate(18, 16)">
      <path d="M 6 4 C 6 4 7 9 10 11 C 13 13 16 13 19 11 C 22 10 26 14 24 18 C 22 22 17 24 14 24 C 8 24 2 18 2 12 C 2 8 4 5 6 4 Z" fill="none" stroke="#c084fc" stroke-width="2.5" stroke-linejoin="round" />
    </g>
    <!-- Label & Value -->
    <text x="90" y="24" font-family="monospace" font-size="16" font-weight="700" fill="#9ca3af" letter-spacing="3">EMERGENCY CONTACT</text>
    <text x="90" y="54" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#bef264" letter-spacing="2">+91 9843315832 [EVENT CONTACT]</text>
  </g>
  <line x1="185" y1="818" x2="839" y2="818" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />

  <!-- Row 4: CHECK-IN ([CHECK-IN DESK]) -->
  <g transform="translate(185, 838)">
    <!-- Icon Box -->
    <rect width="64" height="64" rx="14" fill="#201538" stroke="rgba(168, 85, 247, 0.5)" stroke-width="1.5" />
    <!-- Users SVG Icon -->
    <g transform="translate(18, 16)">
      <circle cx="11" cy="9" r="6" fill="none" stroke="#c084fc" stroke-width="2.5" />
      <path d="M 1 28 C 1 22 5 18 11 18 C 17 18 21 22 21 28" fill="none" stroke="#c084fc" stroke-width="2.5" />
      <path d="M 21 8 C 23 8 25 10 25 12" fill="none" stroke="#c084fc" stroke-width="2" />
      <path d="M 22 19 C 25 20.5 27 23 27 28" fill="none" stroke="#c084fc" stroke-width="2" />
    </g>
    <!-- Label & Value -->
    <text x="90" y="24" font-family="monospace" font-size="16" font-weight="700" fill="#9ca3af" letter-spacing="3">CHECK-IN</text>
    <text x="90" y="54" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#38bdf8" letter-spacing="2">[CHECK-IN DESK · 08:00 AM]</text>
  </g>

  <!-- ========================================================= -->
  <!-- 9. BOTTOM: HORIZONTAL BARCODE, QR CODE & FOOTER CAPTION -->
  <!-- ========================================================= -->
  <!-- Simulated crisp vertical barcode on the left -->
  <g transform="translate(170, 1070)">
    <rect x="0" y="0" width="8" height="74" fill="#ffffff" />
    <rect x="14" y="0" width="4" height="74" fill="#ffffff" />
    <rect x="22" y="0" width="12" height="74" fill="#ffffff" />
    <rect x="40" y="0" width="6" height="74" fill="#ffffff" />
    <rect x="52" y="0" width="16" height="74" fill="#ffffff" />
    <rect x="74" y="0" width="4" height="74" fill="#ffffff" />
    <rect x="84" y="0" width="10" height="74" fill="#ffffff" />
    <rect x="100" y="0" width="6" height="74" fill="#ffffff" />
    <rect x="112" y="0" width="14" height="74" fill="#ffffff" />
    <rect x="132" y="0" width="4" height="74" fill="#ffffff" />
    <rect x="142" y="0" width="8" height="74" fill="#ffffff" />
    <rect x="156" y="0" width="16" height="74" fill="#ffffff" />
    <rect x="178" y="0" width="6" height="74" fill="#ffffff" />
    <rect x="190" y="0" width="10" height="74" fill="#ffffff" />
    <rect x="206" y="0" width="4" height="74" fill="#ffffff" />
    <rect x="216" y="0" width="14" height="74" fill="#ffffff" />
    <rect x="236" y="0" width="8" height="74" fill="#ffffff" />
    <rect x="250" y="0" width="4" height="74" fill="#ffffff" />
    <rect x="260" y="0" width="18" height="74" fill="#ffffff" />
    <rect x="284" y="0" width="6" height="74" fill="#ffffff" />
    <rect x="296" y="0" width="10" height="74" fill="#ffffff" />
    <rect x="312" y="0" width="8" height="74" fill="#ffffff" />
    <rect x="326" y="0" width="14" height="74" fill="#ffffff" />
    <rect x="346" y="0" width="6" height="74" fill="#ffffff" />
    <rect x="358" y="0" width="12" height="74" fill="#ffffff" />
    <rect x="376" y="0" width="8" height="74" fill="#ffffff" />
    <rect x="390" y="0" width="16" height="74" fill="#ffffff" />
    <rect x="412" y="0" width="6" height="74" fill="#ffffff" />
    <rect x="424" y="0" width="12" height="74" fill="#ffffff" />
    <rect x="442" y="0" width="8" height="74" fill="#ffffff" />
  </g>

  <!-- QR Code on the right -->
  ${renderVectorQrSvg(690, 1045, 140, qrDataUrl)}

  <g stroke="#a855f7" stroke-width="3.5" fill="none">
    <path d="M 678 1065 L 678 1045 L 698 1045" />
    <path d="M 842 1065 L 842 1045 L 822 1045" />
    <path d="M 678 1165 L 678 1185 L 698 1185" />
    <path d="M 842 1165 L 842 1185 L 822 1185" />
  </g>

  <!-- Access instructions caption -->
  <text x="475" y="1195" font-family="'Courier New', monospace" font-size="16" font-weight="900" fill="#9ca3af" text-anchor="middle" letter-spacing="4">PRESENT THIS BADGE FOR EVENT ACCESS</text>
  <text x="765" y="1195" font-family="monospace" font-size="18" font-weight="900" fill="#a855f7">///</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
