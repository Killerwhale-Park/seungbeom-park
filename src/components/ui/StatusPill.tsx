import type { PublicationStatus } from "@/lib/types";

const statusConfig: Record<
  PublicationStatus,
  { label: string; className: string; dotClassName: string; pulse: boolean }
> = {
  published: {
    label: "Published",
    className: "text-mint-300",
    dotClassName: "bg-mint-300",
    pulse: false,
  },
  accepted: {
    label: "Accepted",
    className: "text-mint-300",
    dotClassName: "bg-mint-300",
    pulse: false,
  },
  "under-review": {
    label: "Under review",
    className: "text-ember-300",
    dotClassName: "bg-ember-300",
    pulse: true,
  },
  preprint: {
    label: "Preprint",
    className: "text-iris-300",
    dotClassName: "bg-iris-300",
    pulse: false,
  },
  "in-preparation": {
    label: "In preparation",
    className: "text-moon-400",
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
      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] ${config.className} ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className={`size-[5px] rounded-full ${config.dotClassName} ${config.pulse ? "pulse-dot" : ""}`}
      />
      {config.label}
    </span>
  );
}
