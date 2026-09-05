import type { AuthorRef, Publication } from "@/lib/types";
import { StatusPill } from "@/components/ui/StatusPill";
import { CvEntry, CvEntryList } from "./CvEntry";

function AuthorLine({ authors }: { authors: AuthorRef[] }) {
  return (
    <p className="mt-2.5 max-w-[65ch] text-[14px] leading-relaxed text-moon-400">
      {authors.map((author, index) => (
        <span key={`${index}-${author.name}`}>
          <span className={author.isSelf ? "font-medium text-moon-50" : undefined}>
            {author.name}
          </span>
          {author.equalContribution ? (
            <>
              <span aria-hidden="true" className="text-ember-400">
                *
              </span>
              <span className="sr-only"> (equal contribution)</span>
            </>
          ) : null}
          {index < authors.length - 1 ? ", " : null}
        </span>
      ))}
    </p>
  );
}

type CvPublicationsProps = {
  items: Publication[];
};

export function CvPublications({ items }: CvPublicationsProps) {
  return (
    <CvEntryList as="ol">
      {items.map((item, index) => (
        <CvEntry
          key={item.id}
          as="li"
          period={
            <span className="flex items-baseline gap-2">
              <span className="text-ember-400">[{index + 1}]</span>
              <span>{item.venue.year}</span>
            </span>
          }
        >
          <h3 className="font-display text-[1.25rem] leading-snug text-moon-50">
            {item.title}
          </h3>

          {item.note ? (
            <p className="mt-1 text-[13px] italic text-moon-400">{item.note}</p>
          ) : null}

          <AuthorLine authors={item.authors} />

          <p className="mt-1.5 font-mono text-[12px] text-moon-500">
            {item.venue.name}
            {item.venue.abbreviation ? ` (${item.venue.abbreviation})` : ""}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusPill status={item.status} className="cv-status" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-moon-500">
              {item.type}
            </span>
          </div>

          {item.awards?.length ? (
            <p className="mt-2.5 font-mono text-[12px] text-ember-300">
              {item.awards.join(" / ")}
            </p>
          ) : null}
        </CvEntry>
      ))}
    </CvEntryList>
  );
}
