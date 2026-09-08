import { Reveal } from "@/components/effects/Reveal";
import { AboutSection } from "@/components/home/AboutSection";
import { Hero } from "@/components/home/Hero";
import { NewsSection } from "@/components/home/NewsSection";
import { SelectedPublications } from "@/components/home/SelectedPublications";
import { news } from "@/data/news";
import { profile } from "@/data/profile";
import { publications } from "@/data/publications";
import { publicationCounts } from "@/lib/publications";

export default function HomePage() {
  const counts = publicationCounts(publications);

  return (
    <>
      <Hero
        eyebrow="Undergraduate Researcher"
        name={profile.name}
        location={profile.location}
        headline={profile.greeting.headline}
        affiliation={profile.affiliation}
        email={profile.email}
        github={profile.links.github}
      />

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <Reveal>
          <AboutSection
            name={profile.name}
            title={profile.title}
            photo={profile.photo}
            paragraphs={profile.greeting.paragraphs}
            interests={profile.interests}
          />
        </Reveal>

        <Reveal>
          <NewsSection items={news} />
        </Reveal>

        <Reveal>
          <SelectedPublications items={publications} counts={counts} />
        </Reveal>
      </div>
    </>
  );
}
