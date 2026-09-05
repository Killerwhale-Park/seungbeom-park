import type { Education } from "@/lib/types";

export const education: Education[] = [
  {
    id: "ms-cs",
    institution: "University Name",
    degree: "M.S.",
    field: "Computer Science",
    period: { start: "2025-03", expected: "2027-02" },
    gpa: { value: 4.3, scale: 4.5 },
  },
  {
    id: "bs-cs",
    institution: "University Name",
    degree: "B.S.",
    field: "Computer Science",
    period: { start: "2019-03", end: "2025-02" },
    gpa: { value: 4.1, scale: 4.5 },
  },
];
