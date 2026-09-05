import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { PublicationList } from "@/components/publications/PublicationList";
import { publications } from "@/data/publications";
import { publicationCounts } from "@/lib/publications";

export const metadata: Metadata = {
  title: "Publications — Seungbeom Park",
  description:
    "Peer-reviewed and in-review publications by Seungbeom Park, grouped by year.",
};

export default function PublicationsPage() {
  const counts = publicationCounts(publications);
  const description = `${counts.total} ${counts.total === 1 ? "entry" : "entries"} on record: ${counts.firstAuthor} as first author, ${counts.underReview} currently under review.`;

  return (
    <PageShell>
      <PageHeader
        eyebrow="RESEARCH RECORD"
        title="Publications"
        description={description}
      />

      <PublicationList publications={publications} className="mt-14" />
    </PageShell>
  );
}
