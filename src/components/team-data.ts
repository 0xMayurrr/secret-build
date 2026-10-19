import prajwalNImg from "@/assets/team/prajwal-n.png";
import mayurPImg from "@/assets/team/mayur-p.png";
import mohammedParishKhanImg from "@/assets/team/mohammed-parish-khan.png";
import shivasakthivelLImg from "@/assets/team/shivasakthivel-l.png";
import tamilTmImg from "@/assets/team/tamil-tm.png";
import nivethithaRameshImg from "@/assets/team/nivethitha-ramesh.png";
import jamunaRaniImg from "@/assets/team/jamuna-rani.png";
import rajeshwariMImg from "@/assets/team/rajeshwari-m.png";
import bhuvanaSreeImg from "@/assets/team/bhuvana-sree.png";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  squad: string;
  clearance: string;
  bio: string;
  skills: string[];
  avatarBg: string;
  accentColor: string;
  linkedin: string;
  github: string;
  twitter?: string;
  avatarSvg: string;
}

// Only real team members with confirmed photos and details
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ID_001",
    name: "Prajwal N",
    role: "Tech Mentors",
    squad: "TECH_MENTORS",
    clearance: "ALPHA_00",
    bio: "Summoner of cursed runtimes and resurrecter of dead codebases. Wanders the silent memory corridors of Buildicy at midnight, breathing spectral life into buried algorithms and guiding mortal hackers through the void.",
    skills: ["Spectral Architecture", "Dead Code Resurrector", "Runtime Exorcism", "Cursed Heap Tracing", "Void Systems"],
    avatarBg: "oklch(0.2 0.08 270)",
    accentColor: "#8a31fb",
    linkedin: "https://linkedin.com",
    github: "https://github.com/PrajwaL-N-TECHIE",
    avatarSvg: prajwalNImg,
  },
  {
    id: "ID_002",
    name: "Mayur P",
    role: "Tech Mentors",
    squad: "TECH_MENTORS",
    clearance: "ALPHA_01",
    bio: "Architect of phantom sockets and haunted event loops. Whispers assembly incantations into crushed core dumps, banishing segmentation faults that were buried in dead memory generations ago.",
    skills: ["Phantom Sockets", "Haunted Concurrency", "Memory Necromancy", "Kernel Hexes", "Distributed Ether"],
    avatarBg: "oklch(0.2 0.08 190)",
    accentColor: "#06b6d4",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: mayurPImg,
  },
  {
    id: "ID_003",
    name: "Tamil TM",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "SIGMA_03",
    bio: "Haunts the neural weights and dormant transformer layers where dead tokens whisper. Awakens phantom AI models from abandoned checkpoints to test mortals when the arena lights go dark.",
    skills: ["Ghost In The Model", "Corrupted Weights", "Spectral Fine-Tuning", "Neural Crypts", "Dead Token Recall"],
    avatarBg: "oklch(0.2 0.08 160)",
    accentColor: "#10b981",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: tamilTmImg,
  },
  {
    id: "ID_004",
    name: "Nivethitha Ramesh",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "SIGMA_04",
    bio: "Weaver of spectral neural graphs and decaying tensor caches. Listens to the echoes of orphaned threads trapped in the call stack, orchestrating supernatural hackathon anomalies from beyond the terminal.",
    skills: ["Orphan Thread Catcher", "Decaying Tensors", "Stack Banshees", "Spectral Graphs", "Blackout Protocol"],
    avatarBg: "oklch(0.2 0.08 215)",
    accentColor: "#0ea5e9",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: nivethithaRameshImg,
  },
  {
    id: "ID_005",
    name: "Jamuna Rani",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "DELTA_05",
    bio: "Guardian of necrotic DOM trees and forgotten memory leaks. Resurrects broken state trees from dead browser tabs to organize relentless challenges that refuse to rest in peace.",
    skills: ["Necrotic DOM", "Zombie Processes", "Haunted Event Emitters", "Leak Divination", "Reactive Hexes"],
    avatarBg: "oklch(0.2 0.08 320)",
    accentColor: "#ec4899",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: jamunaRaniImg,
  },
  {
    id: "ID_006",
    name: "Rajeshwari M",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "DELTA_06",
    bio: "Crypt keeper of phantom database locks and haunted transaction logs. Summons ancient SQL cursors and banished schema ghosts to safeguard the arena's underworld infrastructure.",
    skills: ["Phantom Deadlocks", "Banished Schemas", "Crypt Transactions", "Haunted WAL Logs", "Schema Exorcism"],
    avatarBg: "oklch(0.2 0.08 280)",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: rajeshwariMImg,
  },
  {
    id: "ID_007",
    name: "Bhuvana Sree S",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "DELTA_07",
    bio: "Shaper of spectral user interfaces and phantom client states. Traps midnight hackers in infinite retro loops where cursed CSS transforms bleed across dead pixels.",
    skills: ["Bleeding Pixels", "Cursed Transforms", "Phantom Keyframes", "Infinite Glitch Loops", "Spectral Shaders"],
    avatarBg: "oklch(0.2 0.08 260)",
    accentColor: "#8b5cf6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: bhuvanaSreeImg,
  },
  {
    id: "ID_008",
    name: "Mohammed Parish Khan K",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "SIGMA_08",
    bio: "Channeller of undead neural models and corrupted gradient vectors. Manifests AI phantoms that stalk failing pull requests in the darkest hours of the blackout.",
    skills: ["Undead Gradients", "Haunted Pull Requests", "Loss Function Banshees", "Corrupted Vectors", "AI Shadows"],
    avatarBg: "oklch(0.2 0.08 290)",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: mohammedParishKhanImg,
  },
  {
    id: "ID_009",
    name: "ShivaSakthivel L",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "SIGMA_09",
    bio: "Harvester of corrupted frame buffers and ghostly computer vision matrices. Watches the dark arena through infrared static, ensuring every forgotten byte rises from the grave.",
    skills: ["Corrupted Buffers", "Infrared Static", "Spectral Vision", "Ghost Matrix", "Grave Bytes"],
    avatarBg: "oklch(0.2 0.08 240)",
    accentColor: "#3b82f6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: shivasakthivelLImg,
  },
];
