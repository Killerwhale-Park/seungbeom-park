import type { ReactNode } from "react";

type CvEntryListProps = {
  children: ReactNode;
  as?: "div" | "ol";
};

export function CvEntryList({ children, as: Tag = "div" }: CvEntryListProps) {
  return <Tag className="divide-y divide-white/8">{children}</Tag>;
}

type CvEntryProps = {
  period?: ReactNode;
  children: ReactNode;
  as?: "div" | "li";
};

export function CvEntry({ period, children, as: Tag = "div" }: CvEntryProps) {
  return (
    <Tag className="cv-entry grid gap-2 py-6 first:pt-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
      <div className="cv-period font-mono text-[12px] leading-6 text-moon-500">
        {period}
      </div>
      <div className="min-w-0">{children}</div>
    </Tag>
  );
}

type CvEntryTitleProps = {
  children: ReactNode;
};

export function CvEntryTitle({ children }: CvEntryTitleProps) {
  return (
    <h3 className="font-display text-[1.35rem] leading-tight text-moon-50">
      {children}
    </h3>
  );
}
