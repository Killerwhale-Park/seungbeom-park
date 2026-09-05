import type { Publication } from "@/lib/types";

export type PublicationCounts = {
  total: number;
  firstAuthor: number;
  underReview: number;
};

export function isFirstAuthor(pub: Publication): boolean {
  const index = pub.authors.findIndex((author) => author.isSelf);
  if (index < 0) return false;
  if (index === 0) return true;
  return index === 1 && Boolean(pub.authors[index].equalContribution);
}

export function publicationCounts(pubs: Publication[]): PublicationCounts {
  return {
    total: pubs.length,
    firstAuthor: pubs.filter(isFirstAuthor).length,
    underReview: pubs.filter((pub) => pub.status === "under-review").length,
  };
}
