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

// 21 Team Members for BLACKOUT Hackathon
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ID_001",
    name: "Prajwal N",
    role: "CEO and Founder",
    squad: "EXECUTIVE_CORE",
    clearance: "ALPHA_00",
    bio: "Founder & Chief Executive Officer of Buildicy and BLACKOUT. Pioneering covert challenge frameworks, autonomous evaluation engines, and builder ecosystems.",
    skills: ["Executive Strategy", "Fullstack Systems", "AI Product Vision", "Cloud Infrastructure", "Dev Ecosystems"],
    avatarBg: "oklch(0.2 0.08 270)",
    accentColor: "#8a31fb",
    linkedin: "https://linkedin.com",
    github: "https://github.com/PrajwaL-N-TECHIE",
    avatarSvg: prajwalNImg,
  },
  {
    id: "ID_002",
    name: "Mayur P",
    role: "CTO and co founder",
    squad: "EXECUTIVE_CORE",
    clearance: "ALPHA_01",
    bio: "Co-Founder & Chief Technology Officer. Architecting core distributed infrastructure, real-time benchmark evaluation engines, and high-concurrency event telemetry.",
    skills: ["System Architecture", "High Concurrency", "Distributed Systems", "Cloud Platforms", "Engineering Strategy"],
    avatarBg: "oklch(0.2 0.08 190)",
    accentColor: "#06b6d4",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: mayurPImg,
  },
  {
    id: "ID_003",
    name: "Karthick Mayur",
    role: "Lead Architect",
    squad: "LEAD_CORE",
    clearance: "ALPHA_01",
    bio: "Visionary behind BLACKOUT's surprise architecture and challenge mechanics. Directs covert infrastructure and engineering.",
    skills: ["System Design", "Distributed Arch", "Strategy", "Go/Rust"],
    avatarBg: "oklch(0.18 0.09 295)",
    accentColor: "#8a31fb",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%2310081e"/>
      <circle cx="50" cy="50" r="38" stroke="%238a31fb" stroke-width="2" stroke-dasharray="4 2"/>
      <path d="M28 85 C28 65 38 58 50 58 C62 58 72 65 72 85" fill="%231e0f36" stroke="%238a31fb" stroke-width="2"/>
      <circle cx="50" cy="40" r="18" fill="%23140a24" stroke="%238a31fb" stroke-width="2"/>
      <rect x="36" y="34" width="28" height="8" rx="2" fill="%238a31fb"/>
      <rect x="40" y="36" width="20" height="4" fill="%2338bdf8"/>
      <path d="M42 24 L58 24 L50 16 Z" fill="%238a31fb"/>
      <circle cx="50" cy="72" r="3" fill="%2338bdf8"/>
    </svg>`,
  },
  {
    id: "ID_002",
    name: "Harish Kumar",
    role: "Operations & Logistics Lead",
    squad: "TACTICAL_OPS",
    clearance: "ALPHA_02",
    bio: "Turning high-pressure chaos into surgical execution. Manages hackathon arena logistics and emergency response protocols.",
    skills: ["Arena Ops", "Crisis Mgmt", "Ground Warfare", "Coordination"],
    avatarBg: "oklch(0.2 0.08 120)",
    accentColor: "#22c55e",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%230b1710"/>
      <circle cx="50" cy="50" r="38" stroke="%2322c55e" stroke-width="2" stroke-dasharray="6 3"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%23132d1e" stroke="%2322c55e" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%230f2418" stroke="%2322c55e" stroke-width="2"/>
      <path d="M30 42 A20 20 0 0 1 70 42" stroke="%2322c55e" stroke-width="3" fill="none"/>
      <circle cx="30" cy="42" r="5" fill="%2322c55e"/>
      <circle cx="70" cy="42" r="5" fill="%2322c55e"/>
      <line x1="30" y1="42" x2="42" y2="52" stroke="%2322c55e" stroke-width="2"/>
      <rect x="42" y="38" width="16" height="5" fill="%234ade80"/>
    </svg>`,
  },
  {
    id: "ID_003",
    name: "Sanjay Vignesh",
    role: "Chief Technology Officer",
    squad: "CORE_SYSTEMS",
    clearance: "OMEGA_03",
    bio: "Kernel hacker and distributed systems architect. Engineered BLACKOUT's auto-evaluator to survive crushing benchmark surges.",
    skills: ["Distributed Cloud", "Rust", "High Concurrency", "Docker/K8s"],
    avatarBg: "oklch(0.2 0.08 200)",
    accentColor: "#06b6d4",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23091924"/>
      <circle cx="50" cy="50" r="38" stroke="%2306b6d4" stroke-width="2"/>
      <path d="M26 86 C26 67 37 60 50 60 C63 60 74 67 74 86" fill="%23113144" stroke="%2306b6d4" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%230d2535" stroke="%2306b6d4" stroke-width="2"/>
      <circle cx="43" cy="40" r="6" stroke="%2306b6d4" stroke-width="2" fill="%2322d3ee"/>
      <line x1="49" y1="40" x2="60" y2="40" stroke="%2306b6d4" stroke-width="2"/>
      <circle cx="60" cy="40" r="3" fill="%2306b6d4"/>
      <path d="M36 28 L64 28" stroke="%2322d3ee" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "ID_004",
    name: "Arun Prasath",
    role: "Lead Frontend Engineer",
    squad: "NEO_INTERFACE",
    clearance: "DELTA_04",
    bio: "Pixel whisperer and interaction craftsman. Architected BLACKOUT's CRT scanline shaders, tactile toggles, and retro UI.",
    skills: ["React 19", "Tailwind 4", "WebGL/Shaders", "Motion UI"],
    avatarBg: "oklch(0.2 0.08 330)",
    accentColor: "#f43f5e",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23220a15"/>
      <circle cx="50" cy="50" r="38" stroke="%23f43f5e" stroke-width="2" stroke-dasharray="2 4"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%233a1224" stroke="%23f43f5e" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%232c0c1b" stroke="%23f43f5e" stroke-width="2"/>
      <polygon points="36,36 64,36 60,46 40,46" fill="%23fb7185"/>
      <line x1="34" y1="36" x2="66" y2="36" stroke="%23fff" stroke-width="2"/>
      <circle cx="50" cy="74" r="4" fill="%23f43f5e"/>
    </svg>`,
  },
  {
    id: "ID_005",
    name: "Priya Dharshini",
    role: "AI & Neural Challenge Lead",
    squad: "NEURAL_LABS",
    clearance: "SIGMA_05",
    bio: "Neural network researcher designing adversarial hackathon challenges and automated real-time code vulnerability tests.",
    skills: ["Autonomous Agents", "PyTorch", "LLM Pipelines", "Neural Eval"],
    avatarBg: "oklch(0.2 0.08 270)",
    accentColor: "#8b5cf6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23150d28"/>
      <circle cx="50" cy="50" r="38" stroke="%238b5cf6" stroke-width="2"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%232a1950" stroke="%238b5cf6" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%231e1239" stroke="%238b5cf6" stroke-width="2"/>
      <path d="M38 38 Q50 32 62 38" stroke="%23c084fc" stroke-width="3" fill="none"/>
      <circle cx="44" cy="42" r="2.5" fill="%23c084fc"/>
      <circle cx="56" cy="42" r="2.5" fill="%23c084fc"/>
      <line x1="50" y1="24" x2="50" y2="16" stroke="%23c084fc" stroke-width="2"/>
      <circle cx="50" cy="15" r="3" fill="%23e879f9"/>
    </svg>`,
  },
  {
    id: "ID_006",
    name: "Naveen Raj",
    role: "Cybersecurity & Cryptography",
    squad: "ZERO_CIPHER",
    clearance: "OMEGA_06",
    bio: "Head of cryptanalysis and platform defense. Locked down secret problem statements with multi-layered Zero-Knowledge proofs.",
    skills: ["ZK Proofs", "Reverse Eng", "Penetration Testing", "AppSec"],
    avatarBg: "oklch(0.2 0.08 40)",
    accentColor: "#f59e0b",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23211503"/>
      <circle cx="50" cy="50" r="38" stroke="%23f59e0b" stroke-width="2" stroke-dasharray="5 3"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%233e2808" stroke="%23f59e0b" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%232c1d06" stroke="%23f59e0b" stroke-width="2"/>
      <path d="M38 42 L62 42 L56 52 L44 52 Z" fill="%23f59e0b"/>
      <line x1="42" y1="36" x2="58" y2="36" stroke="%23fde68a" stroke-width="2"/>
      <circle cx="50" cy="47" r="2" fill="%231c1917"/>
    </svg>`,
  },
  {
    id: "ID_007",
    name: "Deepak Sharma",
    role: "Hardware & IoT Systems Lead",
    squad: "SILICON_GRID",
    clearance: "BETA_07",
    bio: "Bridging cold silicon and live physical countdown timers. Built the arena's wireless buzzer arrays and emergency relays.",
    skills: ["ESP32 / RTOS", "Custom PCB", "Embedded C++", "Relay Systems"],
    avatarBg: "oklch(0.2 0.08 170)",
    accentColor: "#14b8a6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23061c18"/>
      <circle cx="50" cy="50" r="38" stroke="%2314b8a6" stroke-width="2"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%230f3630" stroke="%2314b8a6" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%230a2823" stroke="%2314b8a6" stroke-width="2"/>
      <rect x="36" y="34" width="12" height="12" rx="3" fill="%232dd4bf"/>
      <rect x="52" y="34" width="12" height="12" rx="3" fill="%232dd4bf"/>
      <line x1="48" y1="40" x2="52" y2="40" stroke="%2314b8a6" stroke-width="3"/>
      <path d="M38 66 L62 66" stroke="%232dd4bf" stroke-width="2" stroke-dasharray="2 2"/>
    </svg>`,
  },
  {
    id: "ID_008",
    name: "Ananya Krishnan",
    role: "Creative & Brand Director",
    squad: "SYNTH_VISION",
    clearance: "DELTA_08",
    bio: "Guiding the visual identity of BLACKOUT. Sculpted our brutalist typography, neon gradients, and dystopian stage aesthetic.",
    skills: ["Art Direction", "Motion Design", "Visual Identity", "3D Blender"],
    avatarBg: "oklch(0.2 0.08 310)",
    accentColor: "#ec4899",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23230a1c"/>
      <circle cx="50" cy="50" r="38" stroke="%23ec4899" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%233e1432" stroke="%23ec4899" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%232c0d23" stroke="%23ec4899" stroke-width="2"/>
      <path d="M32 36 Q50 48 68 36" stroke="%23f472b6" stroke-width="4" fill="none"/>
      <circle cx="50" cy="32" r="3" fill="%23f472b6"/>
      <circle cx="40" cy="46" r="2" fill="%23fff"/>
      <circle cx="60" cy="46" r="2" fill="%23fff"/>
    </svg>`,
  },
  {
    id: "ID_009",
    name: "Vigneshwaran K",
    role: "DevRel & Community Commander",
    squad: "BUILDER_SQUAD",
    clearance: "SIGMA_09",
    bio: "Commanding the builder frontlines across Tamil Nadu. Fosters collegiate hack teams and coordinates 24/7 hacker support.",
    skills: ["Dev Ecosystems", "Technical Mentorship", "Community Ops", "Hackathons"],
    avatarBg: "oklch(0.2 0.08 80)",
    accentColor: "#eab308",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%231f1803"/>
      <circle cx="50" cy="50" r="38" stroke="%23eab308" stroke-width="2"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%233b2e07" stroke="%23eab308" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%232b2105" stroke="%23eab308" stroke-width="2"/>
      <path d="M32 40 A18 18 0 0 1 68 40" stroke="%23facc15" stroke-width="3" fill="none"/>
      <circle cx="32" cy="40" r="5" fill="%23facc15"/>
      <circle cx="68" cy="40" r="5" fill="%23facc15"/>
      <circle cx="50" cy="42" r="2.5" fill="%23fde047"/>
    </svg>`,
  },
  {
    id: "ID_010",
    name: "Rohit Verma",
    role: "Backend & Cloud Architect",
    squad: "INFRA_STREAM",
    clearance: "GAMMA_10",
    bio: "Scaling microservice fabrics, live leaderboard webhooks, and sub-millisecond submission intake pipes for thousands of hackers.",
    skills: ["FastAPI", "Redis Streams", "PostgreSQL", "Kafka/RabbitMQ"],
    avatarBg: "oklch(0.2 0.08 230)",
    accentColor: "#3b82f6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23091326"/>
      <circle cx="50" cy="50" r="38" stroke="%233b82f6" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%2313264b" stroke="%233b82f6" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%230e1d3b" stroke="%233b82f6" stroke-width="2"/>
      <rect x="38" y="36" width="24" height="8" fill="%2360a5fa"/>
      <line x1="44" y1="40" x2="56" y2="40" stroke="%231d4ed8" stroke-width="2"/>
      <rect x="42" y="26" width="16" height="4" fill="%233b82f6"/>
    </svg>`,
  },
  {
    id: "ID_011",
    name: "Swetha Murugan",
    role: "Sponsorship & Strategic Alliances",
    squad: "PARTNER_OPS",
    clearance: "BETA_11",
    bio: "Uniting venture funds, devtool powerhouses, and tech giants under the BLACKOUT banner to back tomorrow's breakthrough builders.",
    skills: ["Strategic Partnerships", "Sponsorship Growth", "VC Relations", "PR"],
    avatarBg: "oklch(0.2 0.08 140)",
    accentColor: "#10b981",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%23061912"/>
      <circle cx="50" cy="50" r="38" stroke="%2310b981" stroke-width="2"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%230f3a2b" stroke="%2310b981" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%230a2823" stroke="%2310b981" stroke-width="2"/>
      <polygon points="50,30 62,38 50,46 38,38" fill="%2334d399"/>
      <circle cx="50" cy="38" r="3" fill="%23a7f3d0"/>
      <path d="M42 68 L58 68" stroke="%2334d399" stroke-width="2"/>
    </svg>`,
  },
  {
    id: "ID_012",
    name: "Aditya Raman",
    role: "Challenge Director & Evaluation Lead",
    squad: "VERIFICATION",
    clearance: "ALPHA_12",
    bio: "Chief curator of edge-case test suites and ruthless evaluation rubrics. Guarantees 100% fair, unbiased meritocracy on the floor.",
    skills: ["Benchmark Curation", "Automated Grading", "Judging Rubrics", "Telemetry"],
    avatarBg: "oklch(0.2 0.08 10)",
    accentColor: "#ea580c",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" fill="%231c0d06"/>
      <circle cx="50" cy="50" r="38" stroke="%23ea580c" stroke-width="2"/>
      <path d="M28 85 C28 66 38 60 50 60 C62 60 72 66 72 85" fill="%23391d10" stroke="%23ea580c" stroke-width="2"/>
      <circle cx="50" cy="42" r="18" fill="%232b150b" stroke="%23ea580c" stroke-width="2"/>
      <circle cx="43" cy="40" r="5" stroke="%23fb923c" stroke-width="2" fill="none"/>
      <circle cx="57" cy="40" r="5" stroke="%23fb923c" stroke-width="2" fill="none"/>
      <line x1="48" y1="40" x2="52" y2="40" stroke="%23ea580c" stroke-width="2"/>
      <path d="M40 26 L60 26" stroke="%23fdba74" stroke-width="3"/>
    </svg>`,
  },
  {
    id: "ID_013",
    name: "Tamil TM",
    role: "Applied AI Engineer",
    squad: "NEURAL_LABS",
    clearance: "SIGMA_13",
    bio: "Specializes in productionizing generative intelligence pipelines and edge model fine-tuning. Optimizing neural weights to evaluate autonomous hacker agents during the blackout.",
    skills: ["Applied AI", "LLM Fine-Tuning", "Neural Pipelines", "PyTorch", "Model Eval"],
    avatarBg: "oklch(0.2 0.08 160)",
    accentColor: "#10b981",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: tamilTmImg,
  },
  {
    id: "ID_014",
    name: "Nivethitha Ramesh",
    role: "Applied AI Engineer",
    squad: "NEURAL_CORE",
    clearance: "SIGMA_14",
    bio: "Architecting multimodal reasoning systems and latency-critical inference pipelines. Deploys resilient AI agents designed to operate in low-bandwidth, high-entropy challenge environments.",
    skills: ["Generative AI", "Agentic Systems", "Prompt Engineering", "Python", "MLOps"],
    avatarBg: "oklch(0.2 0.08 215)",
    accentColor: "#0ea5e9",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: nivethithaRameshImg,
  },
  {
    id: "ID_015",
    name: "Jamuna Rani",
    role: "SDE Intern",
    squad: "CORE_BUILDERS",
    clearance: "DELTA_15",
    bio: "Engineering high-performance fullstack interfaces and reactive services. Building tactile attendee interfaces, live submission trackers, and real-time event telemetry.",
    skills: ["Full Stack", "TypeScript", "React", "Node.js", "API Design"],
    avatarBg: "oklch(0.2 0.08 320)",
    accentColor: "#ec4899",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: jamunaRaniImg,
  },
  {
    id: "ID_016",
    name: "Rajeshwari M",
    role: "SDE Intern",
    squad: "CORE_BUILDERS",
    clearance: "DELTA_16",
    bio: "Focused on robust backend services, secure transaction validation, and database reliability. Ensuring high-availability data channels during peak hacker traffic spikes.",
    skills: ["Software Engineering", "PostgreSQL", "Database Design", "Cloud Services", "Go/Java"],
    avatarBg: "oklch(0.2 0.08 280)",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: rajeshwariMImg,
  },
  {
    id: "ID_017",
    name: "Bhuvana Sree S",
    role: "SDE Intern",
    squad: "CORE_BUILDERS",
    clearance: "DELTA_17",
    bio: "Crafting responsive user interfaces, real-time portal interactions, and edge client features. Translating complex evaluation metrics into seamless digital experiences.",
    skills: ["Frontend Dev", "React/Next.js", "UI/UX Architecture", "REST APIs", "Modern Web"],
    avatarBg: "oklch(0.2 0.08 260)",
    accentColor: "#8b5cf6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: bhuvanaSreeImg,
  },
  {
    id: "ID_018",
    name: "Mohammed Parish Khan K",
    role: "AI Engineer Intern",
    squad: "NEURAL_LABS",
    clearance: "SIGMA_18",
    bio: "Researching autonomous agent workflows and neural model inference. Crafting production-grade machine learning pipelines and fine-tuned evaluators.",
    skills: ["AI Engineering", "Deep Learning", "Python", "Neural Networks", "NLP"],
    avatarBg: "oklch(0.2 0.08 290)",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: mohammedParishKhanImg,
  },
  {
    id: "ID_019",
    name: "ShivaSakthivel L",
    role: "AI Engineer Intern",
    squad: "NEURAL_LABS",
    clearance: "SIGMA_19",
    bio: "Implementing computer vision solutions and real-time AI reasoning systems. Optimizing generative pipelines for low latency and high accuracy.",
    skills: ["AI Research", "Computer Vision", "Model Deployment", "PyTorch", "Generative AI"],
    avatarBg: "oklch(0.2 0.08 240)",
    accentColor: "#3b82f6",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: shivasakthivelLImg,
  },
];


