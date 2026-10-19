import type { RegistrationRecord } from "./supabase";
import { BUILDICY_LOGO_DATA_URL } from "./buildicyLogoBase64";
import { BLACKOUT_LOGO_DATA_URL } from "./blackoutLogoBase64";

/**
 * Generates an SVG Data URI for the front of the 3D physical lanyard badge.
 * Designed after the vinyl pouch badge: Blackout 3D graffiti logo, giant distressed "?",
 * tilted neon-lime warning tape "SOMETHING BIG IS COMING.", authenticated operative credentials,
 * crisp vertical barcode, and wireframe globe icon.
 */
export function generateBadgeFrontSvg(record: Partial<RegistrationRecord>): string {
  const name = (record.full_name || "SECRET BUILDER").toUpperCase();
  const regId = record.registration_id || "BLK-2026-LIVE";
  const tier = (record.pass_name || "EARLY BIRD").toUpperCase();
  const org = (record.organization || "COIMBATORE ARENA").toUpperCase();
  const team = record.team_name ? `TEAM: ${record.team_name.toUpperCase()}` : "SOLO OPERATIVE";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1440" viewBox="0 0 1024 1440">
  <defs>
    <!-- Distressed Blackout Grunge Gradient -->
    <linearGradient id="badgeBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050508" />
      <stop offset="45%" stop-color="#0b0b10" />
      <stop offset="100%" stop-color="#030305" />
    </linearGradient>

    <!-- Translucent Vinyl Plastic Reflection Sheen -->
    <linearGradient id="vinylSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="25%" stop-color="rgba(255,255,255,0.06)" />
      <stop offset="50%" stop-color="transparent" />
      <stop offset="75%" stop-color="rgba(168,85,247,0.08)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.15)" />
    </linearGradient>

    <!-- Purple Glow Filter -->
    <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="16" flood-color="#a855f7" flood-opacity="0.9" />
    </filter>

    <!-- Tape Shadow -->
    <filter id="tapeShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.8" />
    </filter>

    <!-- Subtle Grunge Noise Pattern -->
    <pattern id="grungeScratch" width="120" height="120" patternUnits="userSpaceOnUse">
      <path d="M 10 20 L 70 80 M 30 110 L 90 50 M 5 95 L 45 105 M 80 15 L 115 25" stroke="rgba(255,255,255,0.05)" stroke-width="1.2" stroke-linecap="round" fill="none" />
      <circle cx="25" cy="45" r="1" fill="rgba(255,255,255,0.08)" />
      <circle cx="85" cy="95" r="1" fill="rgba(255,255,255,0.08)" />
      <circle cx="105" cy="35" r="1.5" fill="rgba(255,255,255,0.06)" />
    </pattern>
  </defs>

  <!-- Base Black Texture -->
  <rect width="1024" height="1440" fill="url(#badgeBg)" />

  <!-- Environmental Neon Lime Distressed Spray Bands in Background -->
  <path d="M -40 380 Q 512 360 1064 420 L 1064 470 Q 512 430 -40 450 Z" fill="#bef264" opacity="0.12" />
  <path d="M -40 490 Q 512 470 1064 530 L 1064 580 Q 512 540 -40 560 Z" fill="#bef264" opacity="0.08" />

  <!-- Scratch and Crease Texture Overlay -->
  <rect width="1024" height="1440" fill="url(#grungeScratch)" />

  <!-- Crease / Fold Lines simulating weathered vinyl pouch -->
  <line x1="80" y1="120" x2="340" y2="380" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-linecap="round" />
  <line x1="120" y1="140" x2="260" y2="280" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <line x1="940" y1="880" x2="680" y2="1280" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
  <line x1="800" y1="980" x2="920" y2="1140" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />

  <!-- Outer Vinyl Sleeve Border (Transparent Acrylic Pouch Aesthetic) -->
  <rect x="36" y="36" width="952" height="1368" rx="48" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4" />
  <rect x="46" y="46" width="932" height="1348" rx="42" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

  <!-- Top Vinyl Punch Hole / Lanyard Slot Guide -->
  <rect x="412" y="60" width="200" height="28" rx="14" fill="#000000" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" />
  <circle cx="365" cy="74" r="8" fill="#000000" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
  <circle cx="659" cy="74" r="8" fill="#000000" stroke="rgba(255,255,255,0.4)" stroke-width="2" />

  <!-- Top Right Graffiti (??) Mark -->
  <g transform="translate(860, 180) rotate(12)">
    <text x="0" y="0" font-family="'Courier New', cursive, monospace" font-size="56" font-weight="900" fill="#a855f7" letter-spacing="4" opacity="0.9">(??)</text>
  </g>

  <!-- Bottom Left Graffiti Scribble Tag -->
  <g transform="translate(100, 1020) rotate(-15)">
    <path d="M 0 60 L 40 0 L 80 70 M 15 35 L 75 30 M 70 20 L 95 90 M 15 80 L 10 95" stroke="#9333ea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" />
  </g>

  <!-- Cyber Crosshairs / Registration Ticks -->
  <g stroke="rgba(255,255,255,0.35)" stroke-width="1.5">
    <line x1="940" y1="130" x2="960" y2="130" />
    <line x1="950" y1="120" x2="950" y2="140" />

    <line x1="80" y1="840" x2="100" y2="840" />
    <line x1="90" y1="830" x2="90" y2="850" />

    <line x1="720" y1="1380" x2="740" y2="1380" />
    <line x1="730" y1="1370" x2="730" y2="1390" />
  </g>

  <!-- ========================================================= -->
  <!-- 1. TOP CENTER: OFFICIAL BLACKOUT 3D GRAFFITI LOGO -->
  <!-- ========================================================= -->
  <g filter="url(#purpleGlow)">
    <image href="${BLACKOUT_LOGO_DATA_URL}" x="162" y="140" width="700" height="230" preserveAspectRatio="xMidYMid meet" />
  </g>

  <!-- ========================================================= -->
  <!-- 2. CENTER: GIANT DISTRESSED MYSTERY QUESTION MARK "?" -->
  <!-- ========================================================= -->
  <g>
    <!-- Question mark subtle dark shadow -->
    <text x="518" y="658" font-family="'Impact', 'Arial Black', sans-serif" font-size="340" font-weight="900" fill="rgba(0,0,0,0.9)" text-anchor="middle">?</text>
    <!-- Crisp white weathered question mark -->
    <text x="512" y="650" font-family="'Impact', 'Arial Black', sans-serif" font-size="340" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-5">?</text>
  </g>

  <!-- ========================================================= -->
  <!-- 3. TILTED FLUORESCENT NEON-LIME WARNING TAPE STRIP -->
  <!-- ========================================================= -->
  <g transform="rotate(-2.2, 512, 790)" filter="url(#tapeShadow)">
    <!-- Tilted Neon Lime Tape Body -->
    <rect x="232" y="740" width="560" height="110" rx="4" fill="#bef264" />
    
    <!-- Rough torn edges effect on tape -->
    <polygon points="232,740 226,755 234,775 227,795 233,815 228,835 232,850" fill="#0b0b10" />
    <polygon points="792,740 798,755 790,775 797,795 791,815 796,835 792,850" fill="#0b0b10" />

    <!-- Tape Text in bold stencil/monospace -->
    <text x="512" y="784" font-family="'Courier New', monospace" font-size="36" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="4">SOMETHING BIG</text>
    <text x="512" y="828" font-family="'Courier New', monospace" font-size="36" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="6">IS COMING.</text>
  </g>

  <!-- ========================================================= -->
  <!-- 4. OPERATIVE IDENTITY & CLEARANCE CREDENTIALS -->
  <!-- ========================================================= -->
  <!-- Operative Full Name -->
  <text x="512" y="930" font-family="'Courier New', monospace" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">${name}</text>

  <!-- Participation Division & Tier -->
  <text x="512" y="980" font-family="monospace" font-size="22" font-weight="700" fill="#bef264" text-anchor="middle" letter-spacing="4">${team} · ${tier}</text>
  <text x="512" y="1020" font-family="monospace" font-size="18" fill="#a0a0b0" text-anchor="middle" letter-spacing="2">${org}</text>

  <!-- Registration ID Pill -->
  <rect x="262" y="1055" width="500" height="54" rx="12" fill="rgba(0,0,0,0.85)" stroke="#bef264" stroke-width="2.5" />
  <text x="512" y="1092" font-family="'Courier New', monospace" font-size="28" font-weight="900" fill="#bef264" text-anchor="middle" letter-spacing="6">${regId}</text>

  <!-- ========================================================= -->
  <!-- 5. BOTTOM: VERTICAL BARCODE, WIREFRAME GLOBE & COORDINATES -->
  <!-- ========================================================= -->
  <g transform="translate(180, 1170)">
    <!-- Simulated crisp vertical barcode -->
    <g>
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
    </g>

    <!-- Wireframe Globe Icon -->
    <g transform="translate(480, 36)">
      <circle cx="0" cy="0" r="30" fill="none" stroke="#ffffff" stroke-width="2.5" />
      <ellipse cx="0" cy="0" rx="14" ry="30" fill="none" stroke="#ffffff" stroke-width="2" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#ffffff" stroke-width="2" />
      <line x1="-24" y1="-15" x2="24" y2="-15" stroke="#ffffff" stroke-width="1.5" />
      <line x1="-24" y1="15" x2="24" y2="15" stroke="#ffffff" stroke-width="1.5" />
    </g>

    <!-- Cyber Coordinates & Markings -->
    <g transform="translate(560, 20)">
      <text x="0" y="16" font-family="monospace" font-size="28" font-weight="900" fill="#ffffff" letter-spacing="2">73</text>
      <text x="0" y="38" font-family="monospace" font-size="14" fill="#bef264">BLCK</text>
    </g>
  </g>

  <!-- Clear Vinyl Diagonal Sheen Overlay -->
  <rect x="36" y="36" width="952" height="1368" rx="48" fill="url(#vinylSheen)" pointer-events="none" />
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URI for the back of the 3D physical lanyard badge.
 */
export function generateBadgeBackSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1440" viewBox="0 0 1024 1440">
  <defs>
    <linearGradient id="bgBack" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#060609" />
      <stop offset="50%" stop-color="#0e0a16" />
      <stop offset="100%" stop-color="#040307" />
    </linearGradient>
    <filter id="logoGlowBack" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#a855f7" flood-opacity="0.8" />
    </filter>
  </defs>

  <rect width="1024" height="1440" fill="url(#bgBack)" />

  <!-- Outer Vinyl Sleeve Border -->
  <rect x="36" y="36" width="952" height="1368" rx="48" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4" />
  <rect x="46" y="46" width="932" height="1348" rx="42" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

  <!-- Top Vinyl Punch Hole Slot -->
  <rect x="412" y="60" width="200" height="28" rx="14" fill="#000000" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" />

  <!-- Top Logo -->
  <g filter="url(#logoGlowBack)">
    <image href="${BLACKOUT_LOGO_DATA_URL}" x="212" y="140" width="600" height="200" preserveAspectRatio="xMidYMid meet" />
  </g>

  <text x="512" y="380" font-family="'Courier New', monospace" font-size="28" font-weight="900" fill="#bef264" text-anchor="middle" letter-spacing="6">12-HOUR SECRET HACKATHON</text>
  <text x="512" y="420" font-family="monospace" font-size="18" fill="#888899" text-anchor="middle" letter-spacing="4">NOV 28, 2026 · COIMBATORE ARENA</text>

  <!-- Rules of Engagement Box -->
  <rect x="140" y="480" width="744" height="490" rx="20" fill="rgba(0,0,0,0.8)" stroke="#a855f7" stroke-width="2" />
  <text x="512" y="540" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#bef264" text-anchor="middle" letter-spacing="4">OPERATIVE PROTOCOLS</text>

  <text x="180" y="610" font-family="monospace" font-size="18" fill="#eeeeee">01 // Problem statement revealed at zero-hour kickoff.</text>
  <text x="180" y="670" font-family="monospace" font-size="18" fill="#eeeeee">02 // 12-hour continuous overnight building sprint.</text>
  <text x="180" y="730" font-family="monospace" font-size="18" fill="#eeeeee">03 // Carry valid government / college photo identification.</text>
  <text x="180" y="790" font-family="monospace" font-size="18" fill="#eeeeee">04 // Pass is non-transferable and requires QR verification.</text>
  <text x="180" y="850" font-family="monospace" font-size="18" fill="#eeeeee">05 // Hacker kits &amp; swag issued upon entrance check-in.</text>
  <text x="180" y="910" font-family="monospace" font-size="18" fill="#bef264">06 // Something big is coming. Expect the unexpected.</text>

  <!-- Support & Emergency Contacts -->
  <rect x="140" y="1010" width="744" height="150" rx="16" fill="rgba(168,85,247,0.12)" stroke="#bef264" stroke-width="2" />
  <text x="512" y="1055" font-family="monospace" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="3">HEADQUARTERS DESK CONTACT</text>
  <text x="512" y="1098" font-family="'Courier New', monospace" font-size="26" font-weight="900" fill="#bef264" text-anchor="middle">buildicy@gmail.com · +91 9843315832</text>
  <text x="512" y="1135" font-family="monospace" font-size="14" fill="#a855f7" text-anchor="middle">POWERED BY BUILDICY TECH // COIMBATORE</text>

  <!-- Simulated Barcode Footer -->
  <g transform="translate(362, 1220)">
    <rect x="0" y="0" width="6" height="50" fill="#ffffff" />
    <rect x="12" y="0" width="4" height="50" fill="#ffffff" />
    <rect x="20" y="0" width="10" height="50" fill="#ffffff" />
    <rect x="36" y="0" width="6" height="50" fill="#ffffff" />
    <rect x="46" y="0" width="14" height="50" fill="#ffffff" />
    <rect x="66" y="0" width="4" height="50" fill="#ffffff" />
    <rect x="74" y="0" width="8" height="50" fill="#ffffff" />
    <rect x="88" y="0" width="14" height="50" fill="#ffffff" />
    <rect x="108" y="0" width="4" height="50" fill="#ffffff" />
    <rect x="118" y="0" width="12" height="50" fill="#ffffff" />
    <rect x="136" y="0" width="8" height="50" fill="#ffffff" />
    <rect x="150" y="0" width="14" height="50" fill="#ffffff" />
    <rect x="170" y="0" width="6" height="50" fill="#ffffff" />
    <rect x="182" y="0" width="10" height="50" fill="#ffffff" />
    <rect x="198" y="0" width="6" height="50" fill="#ffffff" />
    <rect x="210" y="0" width="14" height="50" fill="#ffffff" />
    <rect x="230" y="0" width="6" height="50" fill="#ffffff" />
    <rect x="242" y="0" width="12" height="50" fill="#ffffff" />
    <rect x="260" y="0" width="8" height="50" fill="#ffffff" />
    <rect x="274" y="0" width="14" height="50" fill="#ffffff" />
    <rect x="294" y="0" width="6" height="50" fill="#ffffff" />
  </g>
  <text x="512" y="1300" font-family="monospace" font-size="14" fill="#666677" text-anchor="middle" letter-spacing="4">PHYSICAL SWAG KIT ISSUED AT ENTRANCE</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
