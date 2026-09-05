import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/date";
import type { NewsItem } from "@/lib/types";

type NewsSectionProps = {
  items: NewsItem[];
};

export function NewsSection({ items }: NewsSectionProps) {
  return (
    <section className="py-20 sm:py-24">
      <SectionHeading eyebrow="Signals" title="News" />

      <ul className="mt-6">
        {items.map((item) => (
          <li
            key={item.id}
            className={`border-t border-l-2 border-t-white/5 py-5 pl-5 first:border-t-0 ${
              item.highlight ? "border-l-ember-500" : "border-l-transparent"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
              <time
                dateTime={item.date}
                className="shrink-0 font-mono text-[12px] text-moon-500 sm:w-20"
              >
                {formatDate(item.date)}
              </time>

              <div className="flex-1">
                <p
                  className={`text-[15px] leading-relaxed ${
                    item.highlight ? "text-moon-50" : "text-moon-200"
                  }`}
                >
                  {item.text}
                  {item.highlight ? (
                    <span className="ml-3 inline-block rounded-[2px] border border-ember-500/40 px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.16em] text-ember-300">
                      new
                    </span>
                  ) : null}
                </p>

                {item.link ? (
                  <a
                    href={item.link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 font-mono text-[12px] text-moon-400 transition-colors hover:text-ember-300"
                  >
                    {item.link.label}
                    <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              {item.tag ? (
                <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-moon-700 sm:block">
                  {item.tag}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-white/10 pt-6">
        <Link
          href="/cv"
          className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-moon-400 transition-colors hover:text-ember-300"
        >
          Full record in CV
          <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
