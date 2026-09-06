import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={`mx-auto max-w-6xl px-6 pt-28 pb-24 sm:pt-36 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
}: PageHeaderProps) {
  return (
    <header className="border-b border-white/10 pb-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember-400">
        {eyebrow}
      </p>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-[2.4rem] font-bold leading-[1.05] tracking-[-0.03em] text-moon-50 sm:text-[3rem]">
          {title}
        </h1>
        {meta ? <div className="shrink-0 sm:pb-2">{meta}</div> : null}
      </div>

      {description ? (
        <p className="mt-6 max-w-[65ch] text-[15px] leading-relaxed text-moon-400">
          {description}
        </p>
      ) : null}
    </header>
  );
}
