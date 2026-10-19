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
    bio: "CTO & Co-Founder at Buildicy. Architecting resilient distributed backends, microservices, and high-throughput systems. Mentoring builders on scalable architecture, cloud infra, and rock-solid production engineering.",
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
    bio: "CEO & Founder at Buildicy. Full-stack architect specializing in ultra-fast modern web applications, reactive state pipelines, and system scalability. Guiding hackathon teams through zero-to-one product engineering.",
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
    bio: "Specializes in productionizing generative intelligence pipelines and edge model fine-tuning. Optimizing neural weights to evaluate autonomous hacker agents during the blackout.",
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
    bio: "Architecting multimodal reasoning systems and latency-critical inference pipelines. Deploys resilient AI agents designed to operate in low-bandwidth, high-entropy challenge environments.",
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
    bio: "Engineering high-performance fullstack interfaces and reactive services. Building tactile attendee interfaces, live submission trackers, and real-time event telemetry.",
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
    bio: "Focused on robust backend services, secure transaction validation, and database reliability. Ensuring high-availability data channels during peak hacker traffic spikes.",
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
    bio: "Crafting responsive user interfaces, real-time portal interactions, and edge client features. Translating complex evaluation metrics into seamless digital experiences.",
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
    bio: "Researching autonomous agent workflows and neural model inference. Crafting production-grade machine learning pipelines and fine-tuned evaluators.",
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
    bio: "Implementing computer vision solutions and real-time AI reasoning systems. Optimizing generative pipelines for low latency and high accuracy.",
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
