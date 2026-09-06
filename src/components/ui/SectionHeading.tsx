import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  meta?: ReactNode;
};

export function SectionHeading({ eyebrow, title, meta }: SectionHeadingProps) {
  return (
    <div className="border-b border-white/10 pb-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moon-500">
        {eyebrow}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <h2 className="font-display text-[1.75rem] font-bold leading-none tracking-[-0.025em] text-moon-50 sm:text-[2.15rem]">
          {title}
        </h2>
        {meta ? (
          <div className="font-mono text-[12px] text-moon-500 sm:text-right">
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
