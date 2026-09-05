import { Mail } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { formatDate } from "@/lib/date";

type FooterProps = {
  name: string;
  email: string;
  github?: string;
  lastUpdated: string;
};

export function Footer({ name, email, github, lastUpdated }: FooterProps) {
  return (
    <footer className="print-hidden mt-auto border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 font-mono text-[12px] text-moon-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {name} <span className="text-moon-700">/</span> © 2026
        </p>

        <div className="flex items-center gap-5">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className="transition-colors hover:text-ember-300"
            >
              <GithubIcon size={16} aria-hidden="true" />
            </a>
          ) : null}
          <a
            href={`mailto:${email}`}
            aria-label={`Email ${name}`}
            className="transition-colors hover:text-ember-300"
          >
            <Mail size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>
          <span>Last updated {formatDate(lastUpdated)}</span>
        </div>
      </div>
    </footer>
  );
}
