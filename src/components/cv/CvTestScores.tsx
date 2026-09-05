import type { TestScore } from "@/lib/types";
import { CvEntry, CvEntryList, CvEntryTitle } from "./CvEntry";
import { formatDate } from "@/lib/date";

type CvTestScoresProps = {
  items: TestScore[];
};

export function CvTestScores({ items }: CvTestScoresProps) {
  return (
    <CvEntryList>
      {items.map((item) => (
        <CvEntry key={item.id} period={formatDate(item.date)}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <CvEntryTitle>{item.test}</CvEntryTitle>
            <span className="font-mono text-[15px] font-medium text-ember-300">
              {item.score}
            </span>
          </div>

          {item.detail ? (
            <p className="mt-2 font-mono text-[12px] text-moon-500">
              {item.detail}
            </p>
          ) : null}

          {item.expiry ? (
            <p className="mt-1.5 font-mono text-[12px] text-moon-500">
              Valid through {formatDate(item.expiry)}
            </p>
          ) : null}
        </CvEntry>
      ))}
    </CvEntryList>
  );
}
