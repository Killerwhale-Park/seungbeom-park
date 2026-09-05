import type { SkillGroup } from "@/lib/types";
import { CvEntry, CvEntryList } from "./CvEntry";

type CvSkillsProps = {
  groups: SkillGroup[];
};

export function CvSkills({ groups }: CvSkillsProps) {
  return (
    <CvEntryList>
      {groups.map((group) => (
        <CvEntry
          key={group.id}
          period={
            <span className="uppercase tracking-[0.14em] text-moon-400">
              {group.category}
            </span>
          }
        >
          <p className="max-w-[65ch] text-[15px] leading-relaxed text-moon-200">
            {group.items
              .map((item) => (item.note ? `${item.name} (${item.note})` : item.name))
              .join(", ")}
          </p>
        </CvEntry>
      ))}
    </CvEntryList>
  );
}
