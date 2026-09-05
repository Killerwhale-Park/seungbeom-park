import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "profile-site",
    name: "seungbeom-park.dev",
    tagline: "This site: a researcher profile engineered like a product.",
    description: [
      "Every piece of content lives in a typed data layer, so publications, news, and CV entries are edited in one place and rendered everywhere without touching a component.",
      "The hero runs a canvas fireworks simulation over a procedurally generated skyline, seeded so the server and the browser draw the same city.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Canvas API"],
    links: {
      github: "https://github.com/Killerwhale-Park/seungbeom-park",
    },
    status: "active",
    featured: true,
  },
  {
    id: "placeholder-tool",
    name: "lab-utils",
    tagline: "Sample entry: shared tooling for research experiments.",
    description: [
      "A small library of experiment helpers, covering run configuration, checkpoint bookkeeping, and result tables that survive being rerun a hundred times.",
      "This is a placeholder entry included to show the layout; replace it with a real project in src/data/projects.ts.",
    ],
    stack: ["Python", "PyTorch"],
    status: "completed",
  },
];
