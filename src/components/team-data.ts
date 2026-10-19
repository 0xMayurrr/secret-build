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
    bio: "AI researcher & core hackathon organizer. Driving problem statements, deep learning benchmarks, and neural network evaluations for high-velocity hackathon challenges.",
    skills: [
      "AI & Deep Learning",
      "PyTorch",
      "Computer Vision",
      "LLM Applications",
      "Python",
      "MLOps",
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
    bio: "Data science & machine learning specialist on the organizing board. Designing evaluation metrics, data pipelines, and intelligent challenge rubrics for competitive tracks.",
    skills: [
      "Machine Learning",
      "TensorFlow",
      "Data Science",
      "Python",
      "Generative AI",
      "NLP",
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
    bio: "Frontend engineer & event operations lead. Crafting modern user interfaces, reactive component hierarchies, and ensuring flawless attendee portal experiences throughout BLACKOUT.",
    skills: [
      "Frontend Engineering",
      "React.js",
      "JavaScript (ES6+)",
      "UI Architecture",
      "Tailwind CSS",
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
    bio: "Backend & database architect coordinating event registration infrastructure, secure transactional data, and high-concurrency API integrations.",
    skills: [
      "Database Architecture",
      "PostgreSQL",
      "SQL / NoSQL",
      "RESTful APIs",
      "Backend Integration",
      "Data Security",
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
    bio: "UI/UX lead and visual design architect behind the BLACKOUT visual identity, attendee design collateral, interactive prototypes, and design systems.",
    skills: [
      "UI/UX Design",
      "Figma",
      "Design Systems",
      "Frontend Development",
      "Motion Design",
      "Rapid Prototyping",
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
    bio: "Applied AI engineer & event coordinator focusing on predictive models, computer vision tracks, and live judging pipeline orchestration.",
    skills: [
      "Deep Learning",
      "Applied AI",
      "Neural Networks",
      "Python",
      "Model Deployment",
      "Computer Vision",
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
    bio: "Computer vision and embedded intelligence engineer ensuring technical arena readiness, hardware track setups, and real-time vision demonstrations.",
    skills: [
      "Computer Vision",
      "OpenCV",
      "Deep Learning",
      "PyTorch",
      "Embedded Systems",
      "Python",
    ],
    avatarBg: "#110722",
    accentColor: "#a855f7",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    avatarSvg: shivasakthivelLImg,
  },
];
