import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { CvAwards } from "@/components/cv/CvAwards";
import { CvEducation } from "@/components/cv/CvEducation";
import { CvExperience } from "@/components/cv/CvExperience";
import { CvPrintHeader } from "@/components/cv/CvPrintHeader";
import { CvPublications } from "@/components/cv/CvPublications";
import { CvSection } from "@/components/cv/CvSection";
import { CvSkills } from "@/components/cv/CvSkills";
import { CvTestScores } from "@/components/cv/CvTestScores";
import { PdfButton } from "@/components/cv/PdfButton";
import { formatDate } from "@/lib/date";
import { publicationCounts } from "@/lib/publications";
import { awards } from "@/data/awards";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { publications } from "@/data/publications";
import { skillGroups } from "@/data/skills";
import { testScores } from "@/data/testScores";
import "./print.css";

export const metadata: Metadata = {
  title: "CV — Seungbeom Park",
  description:
    "Curriculum vitae of Seungbeom Park: education, publications, experience, awards and scholarships, test scores, and skills.",
};

export default function CvPage() {
  const counts = publicationCounts(publications);
  const affiliation = `${profile.affiliation.department}, ${profile.affiliation.institution}`;
  const lastUpdated = formatDate(profile.cvLastUpdated);

  return (
    <PageShell className="cv-page">
      <div className="print-hidden">
        <PageHeader
          eyebrow="CURRICULUM VITAE"
          title={profile.name}
          description={
            <>
              {profile.title}
              <span className="text-moon-700"> / </span>
              {affiliation}
              <span className="text-moon-700"> / </span>
              {profile.location}
              <span className="text-moon-700"> / </span>
              <a
                href={`mailto:${profile.email}`}
                className="text-moon-200 underline decoration-white/20 underline-offset-4 transition-colors hover:text-ember-300 hover:decoration-ember-500/60"
              >
                {profile.email}
              </a>
            </>
          }
          meta={
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-moon-500">
                Last updated {lastUpdated}
              </span>
              <PdfButton />
            </div>
          }
        />
      </div>

      <CvPrintHeader
        name={profile.name}
        title={profile.title}
        affiliation={affiliation}
        location={profile.location}
        email={profile.email}
        lastUpdated={lastUpdated}
      />

      <div className="cv-sections mt-14 space-y-16">
        {education.length > 0 ? (
          <CvSection title="Education">
            <CvEducation items={education} />
          </CvSection>
        ) : null}

        {publications.length > 0 ? (
          <CvSection
            title="Publications"
            meta={`${counts.total} total / ${counts.firstAuthor} first author / ${counts.underReview} under review`}
          >
            <CvPublications items={publications} />
          </CvSection>
        ) : null}

        {experience.length > 0 ? (
          <CvSection title="Experience">
            <CvExperience items={experience} />
          </CvSection>
        ) : null}

        {awards.length > 0 ? (
          <CvSection title="Awards & Scholarships">
            <CvAwards items={awards} />
          </CvSection>
        ) : null}

        {testScores.length > 0 ? (
          <CvSection title="Test Scores">
            <CvTestScores items={testScores} />
          </CvSection>
        ) : null}

        {skillGroups.length > 0 ? (
          <CvSection title="Skills">
            <CvSkills groups={skillGroups} />
          </CvSection>
        ) : null}
      </div>
    </PageShell>
  );
}
