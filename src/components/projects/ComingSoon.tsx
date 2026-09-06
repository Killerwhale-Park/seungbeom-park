import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";

const STAGES = ["Build", "Polish", "Launch"] as const;
const CURRENT = 1;

type ComingSoonProps = {
  github?: string;
};

export function ComingSoon({ github }: ComingSoonProps) {
  return (
    <section className="flex flex-col items-start gap-8 rounded-[2px] border border-white/8 bg-night-900 px-8 py-14 sm:px-12 sm:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember-400">
        In preparation
      </p>

      <h2 className="font-display text-[2.2rem] font-bold leading-[1.1] tracking-[-0.025em] text-moon-50 sm:text-[2.8rem]">
        Coming soon.
      </h2>

      <p className="max-w-[52ch] text-[15px] leading-relaxed text-moon-400">
        A few projects are being readied for launch. Until the fuses are lit,
        the work in progress is already public on GitHub.
      </p>

      <div className="flex w-full max-w-[320px] items-center pt-2">
        {STAGES.map((stage, index) => {
          const reached = index <= CURRENT;
          const isCurrent = index === CURRENT;
          return (
            <div
              key={stage}
              className={index === 0 ? "flex items-center" : "flex flex-1 items-center"}
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`mx-2 h-px flex-1 ${reached ? "bg-ember-500/60" : "bg-white/10"}`}
                />
              ) : null}
              <span className="relative flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`block rounded-full ${
                    isCurrent
                      ? "pulse-dot size-[9px] bg-ember-300 shadow-[0_0_10px_var(--color-ember-300)]"
                      : reached
                        ? "size-[7px] bg-ember-500/80"
                        : "size-[7px] border border-white/20"
                  }`}
                />
                <span
                  className={`absolute top-[14px] font-mono text-[10px] whitespace-nowrap tracking-[0.1em] uppercase ${
                    index === 0
                      ? "left-0"
                      : index === STAGES.length - 1
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2"
                  } ${
                    isCurrent
                      ? "text-ember-300"
                      : reached
                        ? "text-moon-400"
                        : "text-moon-700"
                  }`}
                >
                  {stage}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" className="h-1" />

      {github ? (
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2 rounded-[2px] border border-white/15 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-moon-200 transition duration-200 hover:border-ember-500/50 hover:text-ember-200"
        >
          <GithubIcon size={16} aria-hidden="true" />
          Watch on GitHub
          <ArrowUpRight
            size={15}
            strokeWidth={1.5}
            aria-hidden="true"
            className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      ) : null}
    </section>
  );
}
