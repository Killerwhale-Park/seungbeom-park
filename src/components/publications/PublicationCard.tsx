import type { Publication } from "@/lib/types";
import { LinkRow } from "@/components/ui/LinkRow";
import { StatusPill } from "@/components/ui/StatusPill";
import { CopyBibtexButton } from "@/components/publications/CopyBibtexButton";

export type PublicationCardVariant = "default" | "compact";

type PublicationCardProps = {
  publication: Publication;
  variant?: PublicationCardVariant;
  className?: string;
};

export function PublicationCard({
  publication,
  variant = "default",
  className,
}: PublicationCardProps) {
  const compact = variant === "compact";
  const venueLabel = publication.venue.abbreviation
    ? `${publication.venue.name} (${publication.venue.abbreviation})`
    : publication.venue.name;

  return (
    <article
      className={`flex flex-col rounded-[2px] border border-white/8 bg-night-900 transition-[border-color,box-shadow] duration-300 hover:border-ember-500/30 hover:shadow-[0_0_40px_-12px_rgba(217,143,53,0.45)] ${compact ? "p-5" : "p-6 sm:p-7"} ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusPill status={publication.status} />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moon-500">
          {publication.type.toUpperCase()}
        </span>
      </div>

      <h3
        className={`mt-4 font-display font-semibold leading-snug tracking-[-0.015em] text-moon-50 ${compact ? "text-[1.0625rem]" : "text-[1.2rem] sm:text-[1.3rem]"}`}
      >
        {publication.title}
      </h3>

      {publication.note ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-moon-400">
          {publication.note}
        </p>
      ) : null}

      <p
        className={`text-[14px] leading-relaxed text-moon-400 ${compact ? "mt-3" : "mt-4"}`}
      >
        {publication.authors.map((author, index) => (
          <span key={`${publication.id}-author-${index}`}>
            {index > 0 ? ", " : null}
            <span
              className={author.isSelf ? "font-semibold text-moon-50" : undefined}
            >
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
          </span>
        ))}
      </p>

      <p className="mt-2 font-mono text-[12px] leading-relaxed text-moon-500">
        {compact ? `${venueLabel}, ${publication.venue.year}` : venueLabel}
      </p>

      {publication.awards && publication.awards.length > 0 ? (
        <p className="mt-3 font-mono text-[12px] leading-relaxed text-ember-300">
          {publication.awards.join(" / ")}
        </p>
      ) : null}

      {publication.links || publication.bibtex ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <LinkRow links={publication.links} />
          {publication.bibtex ? (
            <CopyBibtexButton bibtex={publication.bibtex} />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
