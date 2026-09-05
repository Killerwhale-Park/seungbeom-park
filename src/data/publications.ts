import type { Publication } from "@/lib/types";

export const publications: Publication[] = [
  {
    id: "workshop-2026",
    title: "First-Author Workshop Paper",
    anonymized: true,
    note: "Title withheld during double-blind review",
    authors: [
      { name: "Seungbeom Park", isSelf: true },
      { name: "Co-authors withheld" },
    ],
    venue: {
      name: "International Workshop (venue withheld)",
      year: 2026,
    },
    type: "workshop",
    status: "under-review",
  },
  {
    id: "conference-2026",
    title: "Co-Authored Conference Paper",
    anonymized: true,
    note: "Title withheld during double-blind review",
    authors: [
      { name: "Lead author withheld" },
      { name: "Seungbeom Park", isSelf: true },
    ],
    venue: {
      name: "International Conference (venue withheld)",
      year: 2026,
    },
    type: "conference",
    status: "under-review",
  },
];
