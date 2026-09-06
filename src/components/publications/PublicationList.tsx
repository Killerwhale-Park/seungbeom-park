"use client";

import { useState } from "react";
import type { Publication } from "@/lib/types";
import { isFirstAuthor, publicationCounts } from "@/lib/publications";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { PublicationSky } from "@/components/publications/PublicationSky";
import {
  PublicationFilters,
  type PublicationFilterId,
} from "@/components/publications/PublicationFilters";

const predicates: Record<PublicationFilterId, (pub: Publication) => boolean> = {
  all: () => true,
  "first-author": isFirstAuthor,
  "under-review": (pub) => pub.status === "under-review",
};

type ViewId = "sky" | "list";

function groupByYear(pubs: Publication[]) {
  const groups = new Map<number, Publication[]>();

  for (const pub of pubs) {
    const existing = groups.get(pub.venue.year);
    if (existing) {
      existing.push(pub);
    } else {
      groups.set(pub.venue.year, [pub]);
    }
  }

  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}

function entryLabel(count: number) {
  return count === 1 ? "1 entry" : `${count} entries`;
}

type PublicationListProps = {
  publications: Publication[];
  className?: string;
};

export function PublicationList({
  publications,
  className,
}: PublicationListProps) {
  const [active, setActive] = useState<PublicationFilterId>("all");
  const [view, setView] = useState<ViewId>("list");

  const counts = publicationCounts(publications);
  const options = [
    { id: "all" as const, label: "All", count: counts.total },
    {
      id: "first-author" as const,
      label: "First author",
      count: counts.firstAuthor,
    },
    {
      id: "under-review" as const,
      label: "Under review",
      count: counts.underReview,
    },
  ];

  const filtered = publications.filter(predicates[active]);
  const groups = groupByYear(filtered);
  const activeIds = new Set(filtered.map((pub) => pub.id));

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PublicationFilters
          options={options}
          active={active}
          onChange={setActive}
        />

        <div
          role="group"
          aria-label="View mode"
          className="flex items-center gap-1 rounded-[2px] border border-white/10 p-1"
        >
          {(
            [
              { id: "list", label: "List" },
              { id: "sky", label: "Sky" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              onClick={() => setView(option.id)}
              className={`rounded-[2px] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                view === option.id
                  ? "bg-ember-500/10 text-ember-300"
                  : "text-moon-500 hover:text-moon-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">
        {entryLabel(filtered.length)} shown.
      </p>

      {view === "sky" ? (
        <PublicationSky
          publications={publications}
          activeIds={activeIds}
          className="mt-8"
        />
      ) : groups.length === 0 ? (
        <p className="mt-12 border-t border-white/10 pt-12 font-mono text-[12px] text-moon-500">
          Nothing here yet — check back after the review cycle.
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-12">
          {groups.map((group) => (
            <section
              key={group.year}
              className="grid gap-6 border-t border-white/10 pt-10 first:border-t-0 first:pt-0 md:grid-cols-[7rem_1fr] md:gap-x-10"
            >
              <div className="md:sticky md:top-28 md:self-start">
                <h2 className="font-display text-[2rem] font-bold leading-none tracking-[-0.02em] text-moon-500 md:text-[2.6rem]">
                  {group.year}
                </h2>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-moon-700">
                  {entryLabel(group.items.length)}
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {group.items.map((publication) => (
                  <PublicationCard
                    key={publication.id}
                    publication={publication}
                    expandable
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
