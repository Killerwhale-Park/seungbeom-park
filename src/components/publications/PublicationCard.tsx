"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Publication, PublicationStatus } from "@/lib/types";
import { LinkRow } from "@/components/ui/LinkRow";
import { StatusPill } from "@/components/ui/StatusPill";
import { ArcRocket } from "@/components/effects/ArcRocket";
import { BurstFx } from "@/components/effects/BurstFx";
import { CopyBibtexButton } from "@/components/publications/CopyBibtexButton";
import { ReviewPipeline } from "@/components/publications/ReviewPipeline";

export type PublicationCardVariant = "default" | "compact";

const STATUS_COLOR: Record<PublicationStatus, string> = {
  published: "var(--status-accepted)",
  accepted: "var(--status-accepted)",
  "under-review": "var(--status-review)",
  preprint: "var(--status-preprint)",
  "in-preparation": "var(--status-draft)",
};

const WITHHELD_SUMMARY =
  "Details are withheld while this paper is under double-blind review. A full summary will appear here once the decision is out.";

type Fx = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  phase: "flight" | "burst";
};

type PublicationCardProps = {
  publication: Publication;
  variant?: PublicationCardVariant;
  reveal?: boolean;
  className?: string;
};

export function PublicationCard({
  publication,
  variant = "default",
  reveal = false,
  className,
}: PublicationCardProps) {
  const compact = variant === "compact";
  const canReveal = reveal && !compact;
  const cardRef = useRef<HTMLElement>(null);
  const burstTimer = useRef<number>(0);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 92, y: 14 });
  const [fx, setFx] = useState<Fx | null>(null);

  useEffect(() => () => window.clearTimeout(burstTimer.current), []);

  const statusColor = STATUS_COLOR[publication.status];
  const venueLabel = publication.venue.abbreviation
    ? `${publication.venue.name} (${publication.venue.abbreviation})`
    : publication.venue.name;

  const fire = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (fx) return;
    if (open) {
      setOpen(false);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const button = event.currentTarget.getBoundingClientRect();
    const bx = button.left + button.width / 2;
    const by = button.top + button.height / 2;
    const rect = card.getBoundingClientRect();
    setOrigin({
      x: ((bx - rect.left) / rect.width) * 100,
      y: ((by - rect.top) / rect.height) * 100,
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(true);
      return;
    }
    const side = bx > window.innerWidth / 2 ? -1 : 1;
    setFx({
      x: bx,
      y: by,
      startX: bx + side * (140 + Math.random() * 240),
      startY: window.innerHeight + 24,
      phase: "flight",
    });
  };

  const onArrive = () => {
    setFx((current) => (current ? { ...current, phase: "burst" } : null));
    setOpen(true);
    window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setFx(null), 700);
  };

  const front = (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusPill status={publication.status} />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-moon-500">
          {publication.type.toUpperCase()}
        </span>
      </div>

      <h3
        className={`mt-4 font-display font-semibold leading-snug tracking-[-0.015em] text-moon-50 ${compact ? "text-[1.0625rem]" : "text-[1.2rem] sm:text-[1.3rem]"} ${canReveal ? "pr-10" : ""}`}
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
    </>
  );

  if (!canReveal) {
    return (
      <article
        className={`flex flex-col rounded-[2px] border border-white/8 bg-night-900 transition-[border-color,box-shadow] duration-300 hover:border-ember-500/30 hover:shadow-[0_0_40px_-12px_rgba(217,143,53,0.45)] ${compact ? "p-5" : "p-6 sm:p-7"} ${className ?? ""}`}
      >
        {front}
      </article>
    );
  }

  return (
    <article
      ref={cardRef}
      className={`relative overflow-hidden rounded-[2px] border border-white/8 bg-night-900 transition-[border-color,box-shadow] duration-300 hover:border-ember-500/30 hover:shadow-[0_0_40px_-12px_rgba(217,143,53,0.45)] ${className ?? ""}`}
    >
      <div className="grid">
        <div
          inert={open || undefined}
          className="col-start-1 row-start-1 p-6 sm:p-7"
        >
          {front}
        </div>

        <div
          inert={!open || undefined}
          className="col-start-1 row-start-1 bg-night-800 p-6 sm:p-7"
          style={{
            clipPath: `circle(${open ? "142%" : "0%"} at ${origin.x}% ${origin.y}%)`,
            transition: "clip-path 700ms cubic-bezier(0.22, 0.9, 0.32, 1)",
          }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember-400">
            Summary
          </p>
          <h4 className="mt-3 pr-10 font-display text-[1.05rem] font-semibold leading-snug tracking-[-0.015em] text-moon-50">
            {publication.title}
          </h4>
          <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-moon-400">
            {publication.abstract ?? WITHHELD_SUMMARY}
          </p>
          <ReviewPipeline
            status={publication.status}
            className="mt-7 border-t border-white/8 pt-6"
          />
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close summary" : "Reveal summary with a firework"}
        onClick={fire}
        className="absolute top-5 right-5 z-20 flex size-8 cursor-pointer items-center justify-center rounded-[2px] border border-white/10 text-moon-400 transition-colors hover:border-ember-500/50 hover:text-ember-300"
      >
        {open ? (
          <X size={15} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Plus size={15} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>

      {fx && fx.phase === "flight" ? (
        <ArcRocket
          targetX={fx.x}
          targetY={fx.y}
          startX={fx.startX}
          startY={fx.startY}
          fixed
          onArrive={onArrive}
        />
      ) : null}
      {fx && fx.phase === "burst" ? (
        <BurstFx x={fx.x} y={fx.y} color={statusColor} fixed />
      ) : null}
    </article>
  );
}
