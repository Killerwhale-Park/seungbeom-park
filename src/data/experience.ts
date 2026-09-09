import type { Experience } from "@/lib/types";

export const experience: Experience[] = [
  {
    id: "mlv-intern",
    organization: "Machine Learning and Vision Lab (MLV), KAIST",
    role: "Undergraduate Research Intern",
    period: { start: "2025-07", end: "2025-08" },
    type: "research",
    url: "https://mlv.kaist.ac.kr",
    description: [
      "Researched large language model agents in the group of Prof. Hyunwoo J. Kim.",
      "The work grew into SkillCombiner, accepted at the REALM Workshop at EMNLP 2026.",
    ],
  },
  {
    id: "cyphy-intern",
    organization: "Cyber-Physical Security Lab (CyPhy), KAIST",
    role: "Undergraduate Research Intern",
    period: { start: "2025-01", end: "2025-06" },
    type: "research",
    url: "https://www.cyphy.kaist.ac.kr",
    description: [
      "Researched the security and privacy of sensing and cyber-physical systems in the group of Prof. Jun Han.",
    ],
  },
];
