import type { Education } from "@/lib/types";

export const education: Education[] = [
  {
    id: "bs-kaist",
    institution: "KAIST",
    degree: "B.S.",
    field: "AI Computing",
    period: { start: "2025-02", expected: "2028-02" },
    gpa: { value: 3.81, scale: 4.3 },
    notes: ["86 / 138 credits completed"],
  },
];
