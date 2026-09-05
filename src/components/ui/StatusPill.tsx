import type { PublicationStatus } from "@/lib/types";

const statusConfig: Record<
  PublicationStatus,
  { label: string; className: string; dotClassName: string; pulse: boolean }
> = {
  published: {
    label: "Published",
    className: "border-mint-300/30 bg-mint-300/10 text-mint-300",
    dotClassName: "bg-mint-300",
    pulse: false,
  },
  accepted: {
    label: "Accepted",
    className: "border-mint-300/30 bg-mint-300/10 text-mint-300",
    dotClassName: "bg-mint-300",
    pulse: false,
  },
  "under-review": {
    label: "Under review",
    className: "border-ember-500/40 bg-ember-500/10 text-ember-300",
    dotClassName: "bg-ember-300",
    pulse: true,
  },
  preprint: {
    label: "Preprint",
    className: "border-iris-400/30 bg-iris-400/10 text-iris-300",
    dotClassName: "bg-iris-300",
    pulse: false,
  },
  "in-preparation": {
    label: "In preparation",
    className: "border-white/10 bg-white/5 text-moon-400",
    dotClassName: "bg-moon-500",
    pulse: false,
  },
};

type StatusPillProps = {
  status: PublicationStatus;
  className?: string;
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${config.className} ${className ?? ""}`}
    >
      {config.pulse ? (
        <span
          aria-hidden="true"
          className={`pulse-dot size-[5px] rounded-full ${config.dotClassName}`}
        />
      ) : null}
      {config.label}
    </span>
  );
}
