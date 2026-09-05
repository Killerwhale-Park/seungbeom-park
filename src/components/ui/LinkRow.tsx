import { ExternalLink, FileText, Link as LinkIcon } from "lucide-react";
import type { ComponentType } from "react";
import { GithubIcon, type IconProps } from "@/components/ui/GithubIcon";
import type { Publication } from "@/lib/types";

type IconComponent = ComponentType<IconProps>;

type PublicationLinks = NonNullable<Publication["links"]>;
type LinkKey = keyof PublicationLinks;

const linkOrder: { key: LinkKey; label: string; Icon: IconComponent }[] = [
  { key: "pdf", label: "PDF", Icon: FileText },
  { key: "arxiv", label: "arXiv", Icon: FileText },
  { key: "code", label: "Code", Icon: GithubIcon },
  { key: "doi", label: "DOI", Icon: LinkIcon },
  { key: "slides", label: "Slides", Icon: FileText },
  { key: "poster", label: "Poster", Icon: FileText },
  { key: "video", label: "Video", Icon: ExternalLink },
];

type LinkRowProps = {
  links?: PublicationLinks;
  className?: string;
};

export function LinkRow({ links, className }: LinkRowProps) {
  if (!links) return null;

  const entries = linkOrder
    .map((item) => ({ ...item, href: links[item.key] }))
    .filter((item): item is typeof item & { href: string } =>
      Boolean(item.href),
    );

  if (entries.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className ?? ""}`}
    >
      {entries.map(({ key, label, Icon, href }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[12px] text-moon-400 transition-colors hover:text-ember-300"
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
