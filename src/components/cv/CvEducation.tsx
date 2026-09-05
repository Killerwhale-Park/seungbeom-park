import type { Education } from "@/lib/types";
import { CvEntry, CvEntryList, CvEntryTitle } from "./CvEntry";
import { formatPeriod } from "@/lib/date";

type CvEducationProps = {
  items: Education[];
};

export function CvEducation({ items }: CvEducationProps) {
  return (
    <CvEntryList>
      {items.map((item) => (
        <CvEntry key={item.id} period={formatPeriod(item.period)}>
          <CvEntryTitle>
            {item.degree} in {item.field}
          </CvEntryTitle>

          <p className="mt-1.5 text-[15px] text-moon-200">{item.institution}</p>

          {item.gpa ? (
            <p className="mt-2.5 font-mono text-[12px] text-ember-300">
              GPA {item.gpa.value} / {item.gpa.scale}
              {item.gpa.major !== undefined
                ? ` (major ${item.gpa.major} / ${item.gpa.scale})`
                : ""}
            </p>
          ) : null}

          {item.thesis ? (
            <p className="mt-2 max-w-[65ch] text-[14px] leading-relaxed text-moon-400">
              Thesis: {item.thesis}
            </p>
          ) : null}

          {item.advisor ? (
            <p className="mt-1 text-[14px] text-moon-400">
              Advisor: {item.advisor}
            </p>
          ) : null}

          {item.notes?.length ? (
            <ul className="mt-2.5 space-y-1">
              {item.notes.map((note) => (
                <li
                  key={note}
                  className="max-w-[65ch] text-[14px] leading-relaxed text-moon-400"
                >
                  {note}
                </li>
              ))}
            </ul>
          ) : null}
        </CvEntry>
      ))}
    </CvEntryList>
  );
}
