import Image from "next/image";
import { TagChip } from "@/components/ui/TagChip";

type AboutSectionProps = {
  name: string;
  title: string;
  photo?: string;
  paragraphs: string[];
  interests: string[];
};

export function AboutSection({
  name,
  title,
  photo,
  paragraphs,
  interests,
}: AboutSectionProps) {
  return (
    <section aria-label="About" className="py-20 sm:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {photo ? (
          <figure className="lg:col-span-4">
            <div className="aspect-[3/4] w-full max-w-[300px] overflow-hidden border border-white/10 bg-night-900 lg:max-w-none">
              <Image
                src={photo}
                alt={name}
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-4 max-w-[300px] border-t border-white/10 pt-3 font-mono text-[11px] uppercase tracking-[0.16em] lg:max-w-none">
              <span className="block text-moon-200">{name}</span>
              <span className="mt-1.5 block text-moon-500">{title}</span>
            </figcaption>
          </figure>
        ) : null}

        <div className={photo ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="max-w-[65ch] text-[16px] leading-[1.75] text-moon-200"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moon-500">
              Research interests
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <li key={interest}>
                  <TagChip>{interest}</TagChip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
