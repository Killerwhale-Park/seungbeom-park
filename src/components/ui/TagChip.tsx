import type { ReactNode } from "react";

type TagChipProps = {
  children: ReactNode;
  className?: string;
};

export function TagChip({ children, className }: TagChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[2px] border border-white/10 px-2.5 py-1 font-mono text-[11px] tracking-wide text-moon-400 transition-colors hover:border-ember-500/40 hover:text-moon-200 ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
