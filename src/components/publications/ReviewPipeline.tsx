import type { PublicationStatus } from "@/lib/types";

const STAGES = ["Draft", "In review", "Accepted", "Published"] as const;

const STAGE_INDEX: Record<PublicationStatus, number> = {
  "in-preparation": 0,
  "under-review": 1,
  preprint: 1,
  accepted: 2,
  published: 3,
};

type ReviewPipelineProps = {
  status: PublicationStatus;
  className?: string;
};

export function ReviewPipeline({ status, className }: ReviewPipelineProps) {
  const current = STAGE_INDEX[status];

  return (
    <div
      role="img"
      aria-label={`Review stage: ${STAGES[current]}`}
      className={className}
    >
      <div className="flex items-center">
        {STAGES.map((stage, index) => {
          const reached = index <= current;
          const isCurrent = index === current;
          return (
            <div
              key={stage}
              className={index === 0 ? "flex items-center" : "flex flex-1 items-center"}
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`mx-2 h-px flex-1 ${reached ? "bg-ember-500/60" : "bg-white/10"}`}
                />
              ) : null}
              <span className="relative flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`block rounded-full ${
                    isCurrent
                      ? "pulse-dot size-[9px] bg-ember-300 shadow-[0_0_10px_var(--color-ember-300)]"
                      : reached
                        ? "size-[7px] bg-ember-500/80"
                        : "size-[7px] border border-white/20"
                  }`}
                />
                <span
                  className={`absolute top-[14px] font-mono text-[10px] whitespace-nowrap tracking-[0.1em] uppercase ${
                    index === 0
                      ? "left-0"
                      : index === STAGES.length - 1
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2"
                  } ${
                    isCurrent
                      ? "text-ember-300"
                      : reached
                        ? "text-moon-400"
                        : "text-moon-700"
                  }`}
                >
                  {stage}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" className="h-[22px]" />
    </div>
  );
}
