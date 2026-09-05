import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PublicationCounts } from "@/lib/publications";
import type { Publication } from "@/lib/types";

type SelectedPublicationsProps = {
  items: Publication[];
  counts: PublicationCounts;
};

function CountsMeta({ counts }: { counts: PublicationCounts }) {
  const entries: [number, string][] = [
    [counts.total, "total"],
    [counts.firstAuthor, "first author"],
    [counts.underReview, "under review"],
  ];

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {entries.map(([value, label], index) => (
        <span key={label} className="inline-flex items-center gap-3">
          {index > 0 ? (
            <span aria-hidden="true" className="text-moon-700">
              /
            </span>
          ) : null}
          <span>
            <span className="text-ember-300">{value}</span> {label}
          </span>
        </span>
      ))}
    </span>
  );
}

export function SelectedPublications({
  items,
  counts,
}: SelectedPublicationsProps) {
  return (
    <section className="py-20 sm:py-24">
      <SectionHeading
        eyebrow="Research"
        title="Publications"
        meta={<CountsMeta counts={counts} />}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((publication) => (
          <PublicationCard
            key={publication.id}
            publication={publication}
            variant="compact"
          />
        ))}
      </div>

      <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
        <Link
          href="/publications"
          className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-moon-400 transition-colors hover:text-ember-300"
        >
          All publications
          <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
