import type { SkillGroup } from "@/lib/types";

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    category: "Languages",
    items: [{ name: "Python" }, { name: "TypeScript" }, { name: "C++" }],
  },
  {
    id: "ml",
    category: "ML",
    items: [{ name: "PyTorch" }, { name: "scikit-learn" }],
  },
  {
    id: "web",
    category: "Web",
    items: [{ name: "Next.js" }, { name: "React" }, { name: "Tailwind CSS" }],
  },
  {
    id: "tools",
    category: "Tools",
    items: [{ name: "Git" }, { name: "Docker" }, { name: "Linux" }],
  },
];
