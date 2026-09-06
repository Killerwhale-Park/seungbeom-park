import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { ComingSoon } from "@/components/projects/ComingSoon";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Projects — Seungbeom Park",
  description:
    "Software built by Seungbeom Park: research tooling, experiments, and this site.",
};

export default function ProjectsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="ENGINEERING"
        title="Projects"
        description="Research-grade ideas, production-grade execution. A curated set of projects is on its way."
      />

      <div className="mt-14">
        <ComingSoon github={profile.links.github} />
      </div>
    </PageShell>
  );
}
