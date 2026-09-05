"use client";

export type PublicationFilterId = "all" | "first-author" | "under-review";

export type PublicationFilterOption = {
  id: PublicationFilterId;
  label: string;
  count: number;
};

type PublicationFiltersProps = {
  options: PublicationFilterOption[];
  active: PublicationFilterId;
  onChange: (id: PublicationFilterId) => void;
  className?: string;
};

export function PublicationFilters({
  options,
  active,
  onChange,
  className,
}: PublicationFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filter publications"
      className={`flex flex-wrap items-center gap-2.5 ${className ?? ""}`}
    >
      {options.map((option) => {
        const isActive = option.id === active;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`inline-flex items-center gap-2 rounded-[2px] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
              isActive
                ? "border-ember-500/50 bg-ember-500/10 text-ember-300"
                : "border-white/10 text-moon-400 hover:border-ember-500/30 hover:text-moon-200"
            }`}
          >
            {option.label}
            <span className={isActive ? "text-ember-400/70" : "text-moon-500"}>
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
