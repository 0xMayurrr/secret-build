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

// Tech Mentors first, followed by Organizers with accurate real technologies
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ID_001",
    name: "Mayur P",
    role: "Tech Mentors",
    squad: "TECH_MENTORS",
    clearance: "ALPHA_01",
    bio: "Codemaster on API tokens, resilient distributed backends, microservices, and cloud infra. Architecting high-throughput systems, event telemetry, and rock-solid production engineering.",
    skills: [
      "Distributed Systems",
      "Backend Architecture",
      "Python",
      "Go",
      "Docker & Kubernetes",
      "Cloud Infrastructure",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: mayurPImg,
  },
  {
    id: "ID_002",
    name: "Prajwal N",
    role: "Tech Mentors",
    squad: "TECH_MENTORS",
    clearance: "ALPHA_00",
    bio: "Zero-Day Architect & Fullstack Vanguard. Pioneering ultra-fast modern web applications, reactive state pipelines, system scalability, and guiding builders through zero-to-one engineering.",
    skills: [
      "Full-Stack Architecture",
      "React & Next.js",
      "TypeScript",
      "Node.js",
      "System Design",
      "Cloud Architecture",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com/PrajwaL-N-TECHIE",
    avatarSvg: prajwalNImg,
  },
  {
    id: "ID_003",
    name: "Tamil TM",
    role: "Organizers",
    squad: "ORGANIZERS",
    clearance: "SIGMA_03",
    bio: "Neural Sentinel & Applied AI Architect. Productionizing generative intelligence pipelines, edge model fine-tuning, and evaluating autonomous hacker agents during the blackout.",
    skills: [
      "Applied AI",
      "LLM Fine-Tuning",
      "Neural Pipelines",
      "PyTorch",
      "Model Eval",
      "Python",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
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
    bio: "Multimodal Reasoning Architect. Deploying latency-critical inference pipelines, agentic orchestration, and resilient AI systems engineered to excel in high-entropy challenge environments.",
    skills: [
      "Generative AI",
      "Agentic Systems",
      "Prompt Engineering",
      "Python",
      "MLOps",
      "Neural Models",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
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
    bio: "Fullstack Tactician & Interactive Systems Engineer. Crafting reactive submission telemetry, tactile attendee interfaces, live ranking trackers, and sub-second event services.",
    skills: [
      "Full Stack",
      "TypeScript",
      "React",
      "Node.js",
      "API Design",
      "Web Optimization",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
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
    bio: "Backend Sentry & Cryptographic Data Engineer. Safeguarding high-availability database channels, secure transaction validation, and resilient services under extreme hacker traffic.",
    skills: [
      "Software Engineering",
      "PostgreSQL",
      "Database Design",
      "Cloud Services",
      "Backend Security",
      "Go / Java",
    ],
    avatarBg: "#110722",
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
    bio: "Frontend Artisan & Dynamic Interface Engineer. Sculpting responsive edge portals, tactile interaction mechanics, and glitch-resistant visual experiences for thousands of builders.",
    skills: [
      "Frontend Dev",
      "React / Next.js",
      "UI/UX Architecture",
      "REST APIs",
      "Modern Web",
      "Figma Prototyping",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
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
    bio: "Autonomous Agent Operative & Deep Learning Specialist. Researching multi-agent reasoning workflows, neural model inference pipelines, and automated grading telemetry.",
    skills: [
      "AI Engineering",
      "Deep Learning",
      "Python",
      "Neural Networks",
      "NLP",
      "Model Inference",
    ],
    avatarBg: "#110722",
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
    bio: "Computer Vision Specialist & Neural Matrix Engineer. Building real-time vision pipelines, edge inferencing models, and low-latency generative reasoning systems.",
    skills: [
      "AI Research",
      "Computer Vision",
      "Model Deployment",
      "PyTorch",
      "Generative AI",
      "OpenCV",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: shivasakthivelLImg,
  },
];
