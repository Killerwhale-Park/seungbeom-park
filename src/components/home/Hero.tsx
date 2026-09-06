import Link from "next/link";
import { FileText, Mail } from "lucide-react";
import { FireworksCanvas } from "@/components/effects/FireworksCanvas";
import { Skyline } from "@/components/effects/Skyline";
import { GithubIcon } from "@/components/ui/GithubIcon";
import type { Profile } from "@/lib/types";

type HeroProps = {
  eyebrow: string;
  name: string;
  location: string;
  headline: string;
  affiliation: Profile["affiliation"];
  email: string;
  github?: string;
};

const STARS: [number, number, number][] = [
  [6, 14, 0.5],
  [13, 27, 0.32],
  [19, 9, 0.58],
  [26, 22, 0.28],
  [33, 34, 0.44],
  [41, 12, 0.52],
  [48, 25, 0.3],
  [55, 17, 0.48],
  [62, 31, 0.26],
  [69, 11, 0.44],
  [76, 23, 0.54],
  [83, 15, 0.3],
  [89, 29, 0.4],
  [94, 19, 0.5],
  [11, 42, 0.24],
  [37, 46, 0.22],
  [58, 43, 0.28],
  [81, 39, 0.24],
];

const starField = STARS.map(
  ([x, y, alpha]) =>
    `radial-gradient(1px 1px at ${x}% ${y}%, rgba(216, 220, 238, ${alpha}), transparent)`,
).join(", ");

const actionClass =
  "pointer-events-auto inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-night-950/40 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-moon-200 backdrop-blur-[2px] transition duration-200 hover:border-ember-500/50 hover:text-ember-200 hover:shadow-[0_0_40px_-12px_rgba(217,143,53,0.7)]";

export function Hero({
  eyebrow,
  name,
  location,
  headline,
  affiliation,
  email,
  github,
}: HeroProps) {
  return (
    <section className="relative flex min-h-[92svh] flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="hero-sky pointer-events-none absolute inset-0 z-0"
      />
      <div
        aria-hidden="true"
        className="star-field pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: starField }}
      />
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[45%]"
      />

      <FireworksCanvas className="absolute inset-0 z-10" />

      <div
        aria-hidden="true"
        className="hero-scrim pointer-events-none absolute inset-0 z-20"
      />

      <Skyline className="absolute inset-x-0 -bottom-2 z-30" />

      <div className="pointer-events-none relative z-40 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-28 pb-44 sm:pb-56 lg:pb-64">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember-400 sm:text-[12px]">
          {eyebrow} — {location}
        </p>

        <h1 className="mt-6 font-display text-[clamp(2.9rem,9.5vw,6rem)] font-extrabold leading-[0.96] tracking-[-0.035em] text-moon-50">
          {name}
        </h1>

        <p className="mt-7 max-w-[46ch] text-[17px] leading-[1.65] text-moon-200 sm:text-[19px]">
          {headline}
        </p>

        <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-moon-500">
          {affiliation.lab ? (
            <>
              <span>{affiliation.lab}</span>
              <span aria-hidden="true" className="text-moon-700">
                /
              </span>
            </>
          ) : null}
          <span>{affiliation.department}</span>
          <span aria-hidden="true" className="text-moon-700">
            /
          </span>
          <span>{affiliation.institution}</span>
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className={actionClass}
            >
              <GithubIcon size={16} aria-hidden="true" />
              GitHub
            </a>
          ) : null}

          <a href={`mailto:${email}`} className={actionClass}>
            <Mail size={16} strokeWidth={1.5} aria-hidden="true" />
            Email
          </a>

          <Link
            href="/cv"
            className="pointer-events-auto inline-flex items-center gap-2 px-1 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-moon-400 transition-colors duration-200 hover:text-ember-300"
          >
            <FileText size={16} strokeWidth={1.5} aria-hidden="true" />
            View CV
          </Link>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-6 z-40 font-mono text-[11px] tracking-[0.14em] text-moon-700 motion-reduce:hidden"
      >
        click the sky ^
      </p>
    </section>
  );
}
