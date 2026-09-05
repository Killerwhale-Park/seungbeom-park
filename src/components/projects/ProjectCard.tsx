"use client";

import { ExternalLink, FileText } from "lucide-react";
import { useEffect, useRef, type ComponentType } from "react";
import { GithubIcon, type IconProps } from "@/components/ui/GithubIcon";
import { TagChip } from "@/components/ui/TagChip";
import type { Project, ProjectStatus } from "@/lib/types";

type ProjectLinks = NonNullable<Project["links"]>;
type LinkKey = keyof ProjectLinks;

const linkOrder: {
  key: LinkKey;
  label: string;
  Icon: ComponentType<IconProps>;
}[] = [
  { key: "github", label: "Code", Icon: GithubIcon },
  { key: "demo", label: "Demo", Icon: ExternalLink },
  { key: "docs", label: "Docs", Icon: FileText },
];

const statusConfig: Record<
  ProjectStatus,
  { label: string; dotClassName: string; pulse: boolean }
> = {
  active: { label: "Active", dotClassName: "bg-mint-300", pulse: true },
  completed: { label: "Completed", dotClassName: "bg-moon-500", pulse: false },
  archived: { label: "Archived", dotClassName: "bg-moon-700", pulse: false },
};

const spotlight =
  "radial-gradient(420px circle at var(--card-mx, 50%) var(--card-my, 50%), rgba(242, 180, 92, 0.13), transparent 62%)";

type ProjectCardProps = {
  project: Project;
  variant?: "default" | "featured";
};

export function ProjectCard({ project, variant = "default" }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const featured = variant === "featured";
  const status = statusConfig[project.status];

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    if (
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { x, y } = pending;
      node.style.setProperty("--card-rx", `${(0.5 - y) * 6}deg`);
      node.style.setProperty("--card-ry", `${(x - 0.5) * 6}deg`);
      node.style.setProperty("--card-mx", `${x * 100}%`);
      node.style.setProperty("--card-my", `${y * 100}%`);
    };

    const handleMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pending = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const handleEnter = () => {
      node.style.setProperty("--card-glow", "1");
    };

    const handleLeave = () => {
      pending = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      node.style.setProperty("--card-glow", "0");
      node.style.setProperty("--card-rx", "0deg");
      node.style.setProperty("--card-ry", "0deg");
    };

    node.addEventListener("pointerenter", handleEnter);
    node.addEventListener("pointermove", handleMove);
    node.addEventListener("pointerleave", handleLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener("pointerenter", handleEnter);
      node.removeEventListener("pointermove", handleMove);
      node.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  const links = project.links
    ? linkOrder
        .map((item) => ({ ...item, href: project.links?.[item.key] }))
        .filter((item): item is typeof item & { href: string } =>
          Boolean(item.href),
        )
    : [];

  const head = (
    <>
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-moon-500">
        <span
          aria-hidden="true"
          className={`size-[5px] rounded-full ${status.dotClassName} ${
            status.pulse ? "pulse-dot" : ""
          }`}
        />
        {status.label}
      </p>
      <h2
        className={`mt-4 font-display leading-tight text-moon-50 ${
          featured ? "text-[1.75rem] sm:text-[2rem]" : "text-[1.5rem]"
        }`}
      >
        {project.name}
      </h2>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-moon-200">
        {project.tagline}
      </p>
    </>
  );

  const body = (
    <div className="space-y-3 max-w-[65ch] text-[15px] leading-relaxed text-moon-400">
      {project.description.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );

  const stack = (
    <ul className="flex flex-wrap gap-2">
      {project.stack.map((item) => (
        <li key={item}>
          <TagChip>{item}</TagChip>
        </li>
      ))}
    </ul>
  );

  const linkRow =
    links.length > 0 ? (
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {links.map(({ key, label, Icon, href }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[12px] text-moon-400 transition-colors hover:text-ember-300"
            >
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <article
      ref={cardRef}
      style={{
        transform:
          "perspective(1000px) rotateX(var(--card-rx, 0deg)) rotateY(var(--card-ry, 0deg))",
      }}
      className="group relative isolate h-full overflow-hidden border border-white/10 bg-night-900 p-7 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:border-ember-500/40 hover:shadow-[0_0_40px_-12px_rgba(242,180,92,0.55)] motion-reduce:transition-none sm:p-9"
    >
      <span
        aria-hidden="true"
        style={{ background: spotlight, opacity: "var(--card-glow, 0)" }}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
      />

      {featured ? (
        <div className="relative grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            {head}
            {linkRow ? <div className="mt-6">{linkRow}</div> : null}
          </div>
          <div className="flex flex-col gap-6 md:col-span-7">
            {body}
            {stack}
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col">
          {head}
          <div className="mt-5">{body}</div>
          <div className="mt-auto flex flex-col gap-5 pt-6">
            {stack}
            {linkRow}
          </div>
        </div>
      )}
    </article>
  );
}
