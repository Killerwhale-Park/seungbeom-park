import type { ReactNode } from "react";

type CvSectionProps = {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
};

export function CvSection({ title, meta, children }: CvSectionProps) {
  return (
    <section className="cv-section">
      <div className="cv-section-rule flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/10 pb-3">
        <h2 className="cv-section-title font-mono text-[12px] uppercase tracking-[0.2em] text-ember-400">
          {title}
        </h2>
        {meta ? (
          <span className="cv-section-meta font-mono text-[11px] text-moon-500">
            {meta}
          </span>
        ) : null}
      </div>

      <div className="mt-7">{children}</div>
    </section>
  );
}
