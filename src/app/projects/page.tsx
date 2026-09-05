import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects — Seungbeom Park",
  description:
    "Software built by Seungbeom Park: research tooling, experiments, and this site.",
};

export default function ProjectsPage() {
  const github = profile.links.github;

  return (
    <PageShell>
      <PageHeader
        eyebrow="ENGINEERING"
        title="Projects"
        description="Research-grade ideas, production-grade execution. Software I build to run experiments, ship results, and keep the details honest."
      />

      <div className="mt-14">
        <ProjectGrid projects={projects} />
      </div>

      {github ? (
        <aside className="mt-16 flex flex-col gap-4 border border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-moon-500">
            More on GitHub
          </p>
          <a
            href={github}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 font-mono text-[12px] text-moon-200 transition-colors hover:text-ember-300"
          >
            <GithubIcon size={16} aria-hidden="true" />
            {github.replace(/^https?:\/\//, "")}
            <ArrowUpRight
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </a>
        </aside>
      ) : null}
    </PageShell>
  );
}
