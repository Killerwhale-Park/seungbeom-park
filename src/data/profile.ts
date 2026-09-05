import type { Profile } from "@/lib/types";

export const profile: Profile = {
  name: "Seungbeom Park",
  title: "Graduate Student, Computer Science",
  affiliation: {
    department: "Department of Computer Science",
    institution: "University Name",
  },
  location: "Seoul, South Korea",
  email: "sjsh16kw@gmail.com",
  photo: "/images/profile.svg",
  greeting: {
    headline:
      "Machine learning research with an engineer's habits: measure, build, ship, repeat.",
    paragraphs: [
      "I am a graduate student in computer science based in Seoul. My work sits around machine learning: how models learn, where they fail, and how to turn what we learn about them into systems people can actually use. A first-author workshop paper and a co-authored conference paper are currently making their way through review.",
      "Outside of research I write software for its own sake, this site included. If any of this overlaps with what you are working on, my inbox is open.",
    ],
  },
  interests: [
    "Machine Learning",
    "Natural Language Processing",
    "ML Systems",
    "Human-AI Interaction",
  ],
  links: {
    github: "https://github.com/Killerwhale-Park",
  },
  cvLastUpdated: "2026-09-05",
};
