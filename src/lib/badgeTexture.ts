import type { RegistrationRecord } from "./supabase";

/**
 * Generates an SVG Data URI for the front of the 3D physical lanyard badge.
 */
export function generateBadgeFrontSvg(record: Partial<RegistrationRecord>): string {
  const name = (record.full_name || "SECRET BUILDER").toUpperCase();
  const regId = record.registration_id || "BLK-2026-LIVE";
  const tier = (record.pass_name || "EARLY BIRD").toUpperCase();
  const org = (record.organization || "COIMBATORE ARENA").toUpperCase();
  const team = record.team_name ? `TEAM: ${record.team_name.toUpperCase()}` : "SOLO OPERATIVE";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1440" viewBox="0 0 1024 1440">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0314" />
      <stop offset="40%" stop-color="#18072b" />
      <stop offset="100%" stop-color="#070110" />
    </linearGradient>
    <linearGradient id="neon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#d946ef" />
      <stop offset="100%" stop-color="#00f3ff" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(168,85,247,0.12)" stroke-width="1.5" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1440" fill="url(#bg)" />
  <rect width="1024" height="1440" fill="url(#grid)" />

  <!-- Outer Neon Frame -->
  <rect x="36" y="36" width="952" height="1368" rx="44" fill="none" stroke="url(#neon)" stroke-width="6" />
  <rect x="48" y="48" width="928" height="1344" rx="36" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />

  <!-- Top Lanyard Slot Guide -->
  <rect x="412" y="70" width="200" height="24" rx="12" fill="#000000" stroke="rgba(168,85,247,0.4)" stroke-width="2" />

  <!-- Header Header -->
  <text x="512" y="170" font-family="'Courier New', monospace" font-size="28" font-weight="900" fill="#a855f7" text-anchor="middle" letter-spacing="8">BLACKOUT 2026 // HACKATHON</text>
  <text x="512" y="210" font-family="'Courier New', monospace" font-size="16" fill="#888899" text-anchor="middle" letter-spacing="4">ORGANIZED BY BUILDICY · COIMBATORE</text>

  <!-- Tier Badge Pill -->
  <rect x="262" y="260" width="500" height="72" rx="36" fill="#7e22ce" />
  <text x="512" y="306" font-family="monospace" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">${tier}</text>

  <!-- Attendee Avatar Symbol / Cyber Skull Core -->
  <circle cx="512" cy="520" r="140" fill="#130722" stroke="url(#neon)" stroke-width="5" />
  <circle cx="512" cy="520" r="110" fill="none" stroke="rgba(168,85,247,0.3)" stroke-width="2" stroke-dasharray="10 8" />
  <text x="512" y="555" font-family="monospace" font-size="96" fill="#d946ef" text-anchor="middle">⚡</text>

  <!-- Attendee Name -->
  <text x="512" y="760" font-family="'Courier New', monospace" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">${name}</text>
  <text x="512" y="810" font-family="'Courier New', monospace" font-size="24" fill="#00f3ff" text-anchor="middle" letter-spacing="4">${team}</text>

  <!-- Organization -->
  <rect x="180" y="855" width="664" height="60" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
  <text x="512" y="894" font-family="monospace" font-size="20" fill="#cccccc" text-anchor="middle">${org}</text>

  <!-- Registration ID Box -->
  <rect x="180" y="945" width="664" height="90" rx="16" fill="#06020c" stroke="#a855f7" stroke-width="3" />
  <text x="512" y="985" font-family="monospace" font-size="14" fill="#888899" text-anchor="middle" letter-spacing="3">AUTHENTICATED ID // CLEARANCE</text>
  <text x="512" y="1022" font-family="'Courier New', monospace" font-size="34" font-weight="900" fill="#00f3ff" text-anchor="middle" letter-spacing="6">${regId}</text>

  <!-- Barcode Simulation Strip -->
  <g transform="translate(212, 1080)">
    <rect x="0" y="0" width="8" height="60" fill="#ffffff" />
    <rect x="14" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="24" y="0" width="12" height="60" fill="#ffffff" />
    <rect x="42" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="54" y="0" width="16" height="60" fill="#ffffff" />
    <rect x="76" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="86" y="0" width="10" height="60" fill="#ffffff" />
    <rect x="102" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="114" y="0" width="14" height="60" fill="#ffffff" />
    <rect x="134" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="144" y="0" width="8" height="60" fill="#ffffff" />
    <rect x="158" y="0" width="16" height="60" fill="#ffffff" />
    <rect x="180" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="192" y="0" width="10" height="60" fill="#ffffff" />
    <rect x="208" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="218" y="0" width="14" height="60" fill="#ffffff" />
    <rect x="238" y="0" width="8" height="60" fill="#ffffff" />
    <rect x="252" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="262" y="0" width="18" height="60" fill="#ffffff" />
    <rect x="286" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="298" y="0" width="10" height="60" fill="#ffffff" />
    <rect x="314" y="0" width="8" height="60" fill="#ffffff" />
    <rect x="328" y="0" width="14" height="60" fill="#ffffff" />
    <rect x="348" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="358" y="0" width="12" height="60" fill="#ffffff" />
    <rect x="376" y="0" width="8" height="60" fill="#ffffff" />
    <rect x="390" y="0" width="16" height="60" fill="#ffffff" />
    <rect x="412" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="424" y="0" width="10" height="60" fill="#ffffff" />
    <rect x="440" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="450" y="0" width="14" height="60" fill="#ffffff" />
    <rect x="470" y="0" width="8" height="60" fill="#ffffff" />
    <rect x="484" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="496" y="0" width="12" height="60" fill="#ffffff" />
    <rect x="514" y="0" width="16" height="60" fill="#ffffff" />
    <rect x="536" y="0" width="6" height="60" fill="#ffffff" />
    <rect x="548" y="0" width="10" height="60" fill="#ffffff" />
    <rect x="564" y="0" width="4" height="60" fill="#ffffff" />
    <rect x="574" y="0" width="14" height="60" fill="#ffffff" />
    <rect x="594" y="0" width="6" height="60" fill="#ffffff" />
  </g>

  <!-- Footer Verification Stamp -->
  <text x="512" y="1210" font-family="monospace" font-size="18" fill="#a855f7" text-anchor="middle" letter-spacing="4">HOLOGRAPHIC VERIFIED // ADMIT ONE</text>
  <text x="512" y="1250" font-family="'Courier New', monospace" font-size="14" fill="#777788" text-anchor="middle">PRESENT AT REGISTRATION DESK FOR PHYSICAL SWAG KIT</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URI for the back of the 3D physical lanyard badge.
 */
export function generateBadgeBackSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1440" viewBox="0 0 1024 1440">
  <defs>
    <linearGradient id="bgBack" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070110" />
      <stop offset="50%" stop-color="#140525" />
      <stop offset="100%" stop-color="#06010d" />
    </linearGradient>
    <pattern id="gridBack" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(217,70,239,0.12)" stroke-width="1.5" />
    </pattern>
  </defs>

  <rect width="1024" height="1440" fill="url(#bgBack)" />
  <rect width="1024" height="1440" fill="url(#gridBack)" />

  <rect x="36" y="36" width="952" height="1368" rx="44" fill="none" stroke="#a855f7" stroke-width="5" />
  <rect x="48" y="48" width="928" height="1344" rx="36" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />

  <!-- Top Logo Emblem -->
  <circle cx="512" cy="280" r="110" fill="#0f031c" stroke="#d946ef" stroke-width="4" />
  <text x="512" y="315" font-family="monospace" font-size="80" fill="#00f3ff" text-anchor="middle">✦</text>

  <text x="512" y="450" font-family="'Courier New', monospace" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="6">BLACKOUT 2026</text>
  <text x="512" y="490" font-family="monospace" font-size="20" fill="#a855f7" text-anchor="middle" letter-spacing="4">SURPRISE CHALLENGE HACKATHON</text>

  <!-- Rules of Engagement Box -->
  <rect x="140" y="550" width="744" height="420" rx="20" fill="rgba(0,0,0,0.6)" stroke="rgba(168,85,247,0.3)" stroke-width="2" />
  <text x="512" y="605" font-family="'Courier New', monospace" font-size="22" font-weight="900" fill="#d946ef" text-anchor="middle" letter-spacing="4">OPERATIVE PROTOCOLS</text>

  <text x="180" y="670" font-family="monospace" font-size="18" fill="#dddddd">01 // Problem statement revealed on Nov 28 zero hour.</text>
  <text x="180" y="725" font-family="monospace" font-size="18" fill="#dddddd">02 // 12-hour continuous build sprint in Coimbatore.</text>
  <text x="180" y="780" font-family="monospace" font-size="18" fill="#dddddd">03 // Bring valid government / student photo identification.</text>
  <text x="180" y="835" font-family="monospace" font-size="18" fill="#dddddd">04 // Pass is non-transferable and requires QR desk scan.</text>
  <text x="180" y="890" font-family="monospace" font-size="18" fill="#dddddd">05 // Hacker kits &amp; swag issued upon entrance check-in.</text>

  <!-- Support & Emergency Contacts -->
  <rect x="140" y="1010" width="744" height="150" rx="16" fill="rgba(168,85,247,0.08)" stroke="#7e22ce" stroke-width="2" />
  <text x="512" y="1055" font-family="monospace" font-size="16" fill="#888899" text-anchor="middle" letter-spacing="2">HEADQUARTERS DESK CONTACT</text>
  <text x="512" y="1095" font-family="'Courier New', monospace" font-size="24" font-weight="900" fill="#00f3ff" text-anchor="middle">buildicy@gmail.com · +91 9843315832</text>
  <text x="512" y="1130" font-family="monospace" font-size="14" fill="#a855f7" text-anchor="middle">WWW.BUILDICY.COM // BLACKOUT</text>

  <text x="512" y="1260" font-family="monospace" font-size="14" fill="#555566" text-anchor="middle" letter-spacing="3">POWERED BY BUILDICY · TAMIL NADU</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
