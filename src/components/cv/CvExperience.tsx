import type { Experience } from "@/lib/types";
import { CvEntry, CvEntryList, CvEntryTitle } from "./CvEntry";
import { formatPeriod } from "@/lib/date";

type CvExperienceProps = {
  items: Experience[];
};

export function CvExperience({ items }: CvExperienceProps) {
  return (
    <CvEntryList>
      {items.map((item) => (
        <CvEntry key={item.id} period={formatPeriod(item.period)}>
          <CvEntryTitle>{item.role}</CvEntryTitle>

          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-[15px] text-moon-200">{item.organization}</p>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-moon-500">
              {item.type}
            </span>
          </div>

          {item.description.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-2.5 max-w-[65ch] text-[14px] leading-relaxed text-moon-400"
            >
              {paragraph}
            </p>
          ))}
        </CvEntry>
      ))}
    </CvEntryList>
  );
}
