import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

type ProjectGridProps = {
  projects: Project[];
  className?: string;
};

export function ProjectGrid({ projects, className }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="font-mono text-[12px] text-moon-500">
        No projects listed yet.
      </p>
    );
  }

  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <div className={`flex flex-col gap-6 ${className ?? ""}`}>
      {featured.map((project) => (
        <ProjectCard key={project.id} project={project} variant="featured" />
      ))}

      {rest.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
