import type { Award } from "@/lib/types";
import { TagChip } from "@/components/ui/TagChip";
import { CvEntry, CvEntryList, CvEntryTitle } from "./CvEntry";
import { formatDate } from "@/lib/date";

type CvAwardsProps = {
  items: Award[];
};

export function CvAwards({ items }: CvAwardsProps) {
  return (
    <CvEntryList>
      {items.map((item) => (
        <CvEntry key={item.id} period={formatDate(item.date)}>
          <CvEntryTitle>{item.name}</CvEntryTitle>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-[15px] text-moon-200">{item.issuer}</p>
            <TagChip className="cv-tag uppercase tracking-[0.14em]">
              {item.type}
            </TagChip>
          </div>

          {item.amount ? (
            <p className="mt-2 font-mono text-[12px] text-ember-300">
              {item.amount}
            </p>
          ) : null}

          {item.description ? (
            <p className="mt-2 max-w-[65ch] text-[14px] leading-relaxed text-moon-400">
              {item.description}
            </p>
          ) : null}
        </CvEntry>
      ))}
    </CvEntryList>
  );
}
