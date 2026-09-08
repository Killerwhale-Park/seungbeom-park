import type { Publication } from "@/lib/types";

export const publications: Publication[] = [
  {
    id: "skillcombiner-realm-2026",
    title: "SkillCombiner: Optimizing Agent Skills via Edit Combination Search",
    authors: [
      { name: "Seungbeom Park", isSelf: true },
      { name: "Jaewon Chu" },
      { name: "Hyunwoo J. Kim" },
    ],
    venue: {
      name: "Second Workshop for Research on Agent Language Models",
      abbreviation: "REALM @ EMNLP",
      year: 2026,
    },
    type: "workshop",
    status: "accepted",
    note: "Poster",
    links: {
      pdf: "coming-soon",
      arxiv: "coming-soon",
      code: "coming-soon",
    },
  },
  {
    id: "sp-2027",
    title: "Co-Authored Conference Paper",
    anonymized: true,
    note: "Title withheld during double-blind review",
    authors: [
      { name: "Co-authors withheld" },
      { name: "Seungbeom Park", isSelf: true },
    ],
    venue: {
      name: "IEEE Symposium on Security and Privacy",
      abbreviation: "S&P",
      year: 2027,
    },
    type: "conference",
    status: "under-review",
  },
];
