"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Publication, PublicationStatus } from "@/lib/types";
import { hashSeed, mulberry32, randomRange } from "@/lib/random";
import { Skyline } from "@/components/effects/Skyline";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { isFirstAuthor } from "@/lib/publications";

type PublicationSkyProps = {
  publications: Publication[];
  activeIds: ReadonlySet<string>;
  className?: string;
};

type SkyNode = {
  pub: Publication;
  xPct: number;
  yPct: number;
  firstAuthor: boolean;
};

type Shot = {
  x: number;
  y: number;
  launchY: number;
  targetId: string | null;
  color: string;
  phase: "flight" | "burst";
};

const STATUS_COLOR: Record<PublicationStatus, string> = {
  published: "#8fd9b0",
  accepted: "#8fd9b0",
  "under-review": "#ffd98a",
  preprint: "#aab3f2",
  "in-preparation": "#6f7699",
};

const STATUS_BAND: Record<PublicationStatus, [number, number]> = {
  published: [18, 32],
  accepted: [24, 38],
  preprint: [36, 48],
  "under-review": [42, 60],
  "in-preparation": [64, 72],
};

const SKY_STARS: [number, number, number][] = [
  [5, 18, 0.4], [12, 34, 0.24], [18, 10, 0.5], [25, 26, 0.26],
  [33, 15, 0.42], [41, 38, 0.22], [47, 8, 0.46], [54, 22, 0.3],
  [61, 33, 0.24], [68, 12, 0.44], [75, 27, 0.32], [82, 9, 0.48],
  [88, 21, 0.28], [94, 31, 0.36], [29, 44, 0.18], [71, 45, 0.2],
];

const starField = SKY_STARS.map(
  ([x, y, alpha]) =>
    `radial-gradient(1px 1px at ${x}% ${y}%, rgba(216, 220, 238, ${alpha}), transparent)`,
).join(", ");

const HIT_RADIUS = 56;
const FLIGHT_MS = 620;
const BURST_MS = 750;

function shortTitle(title: string) {
  return title.length > 34 ? `${title.slice(0, 32)}...` : title;
}

function buildNodes(publications: Publication[]): {
  nodes: SkyNode[];
  years: number[];
} {
  if (publications.length === 0) return { nodes: [], years: [] };
  const maxYear = Math.max(...publications.map((p) => p.venue.year));
  const minYear = Math.min(
    Math.min(...publications.map((p) => p.venue.year)),
    maxYear - 2,
  );
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y += 1) years.push(y);

  const byYear = new Map<number, Publication[]>();
  for (const pub of publications) {
    const list = byYear.get(pub.venue.year) ?? [];
    list.push(pub);
    byYear.set(pub.venue.year, list);
  }

  const nodes: SkyNode[] = [];
  for (const [year, pubs] of byYear) {
    pubs.forEach((pub, index) => {
      const rng = mulberry32(hashSeed(pub.id));
      const slot = year - minYear;
      const spread = (index - (pubs.length - 1) / 2) * 0.34;
      const jitter = randomRange(rng, -0.16, 0.16);
      const xPct =
        ((slot + 0.5 + spread + jitter) / years.length) * 100;
      const band = STATUS_BAND[pub.status];
      const yPct = randomRange(rng, band[0], band[1]);
      nodes.push({
        pub,
        xPct: Math.min(94, Math.max(6, xPct)),
        yPct,
        firstAuthor: isFirstAuthor(pub),
      });
    });
  }
  return { nodes, years };
}

function NodeGlyph({
  status,
  color,
  dimmed,
}: {
  status: PublicationStatus;
  color: string;
  dimmed: boolean;
}) {
  if (status === "under-review") {
    return (
      <span className={`relative block ${dimmed ? "" : "sky-float"}`}>
        <span
          className="pulse-dot block size-[7px] rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[7px] h-[16px] w-[2px] -translate-x-1/2"
          style={{
            background: `linear-gradient(to bottom, ${color}b0, transparent)`,
          }}
        />
      </span>
    );
  }

  if (status === "in-preparation") {
    return (
      <span
        className="block size-[5px] rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
      />
    );
  }

  const rays = status === "preprint" ? 4 : 8;
  const length = status === "published" ? 13 : 11;
  return (
    <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
      <circle r="10" fill={color} opacity="0.12" />
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i / rays) * Math.PI * 2 + (rays === 4 ? Math.PI / 4 : 0);
        return (
          <line
            key={i}
            x1={Math.cos(angle) * 4}
            y1={Math.sin(angle) * 4}
            x2={Math.cos(angle) * length}
            y2={Math.sin(angle) * length}
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })}
      <circle r="2.8" fill={color} />
    </svg>
  );
}

function BurstEffect({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-30"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <span
        className="sky-burst-flash absolute block size-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}66 0%, transparent 70%)`,
        }}
      />
      <svg
        width="72"
        height="72"
        viewBox="-36 -36 72 72"
        className="sky-burst-ray absolute -translate-x-1/2 -translate-y-1/2"
      >
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={Math.cos(angle) * 6}
              y1={Math.sin(angle) * 6}
              x2={Math.cos(angle) * 32}
              y2={Math.sin(angle) * 32}
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </span>
  );
}

function Rocket({ shot, onArrive }: { shot: Shot; onArrive: () => void }) {
  const [flying, setFlying] = useState(false);
  const arrived = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setFlying(true)),
    );
    const safety = window.setTimeout(() => {
      if (!arrived.current) {
        arrived.current = true;
        onArrive();
      }
    }, FLIGHT_MS + 200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
  }, [onArrive]);

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-30 block"
      style={{
        transform: flying
          ? `translate(${shot.x}px, ${shot.y}px)`
          : `translate(${shot.x}px, ${shot.launchY}px)`,
        transition: `transform ${FLIGHT_MS}ms cubic-bezier(0.22, 0.9, 0.32, 1)`,
      }}
      onTransitionEnd={() => {
        if (!arrived.current) {
          arrived.current = true;
          onArrive();
        }
      }}
    >
      <span
        className="block size-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-200"
        style={{ boxShadow: "0 0 10px #ffe9bd" }}
      />
    </span>
  );
}

export function PublicationSky({
  publications,
  activeIds,
  className,
}: PublicationSkyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const burstTimer = useRef<number>(0);

  const { nodes, years } = useMemo(
    () => buildNodes(publications),
    [publications],
  );
  const selected = publications.find((p) => p.id === selectedId) ?? null;

  useEffect(() => () => window.clearTimeout(burstTimer.current), []);

  const fire = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container || shot) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    let targetId: string | null = null;
    let targetX = x;
    let targetY = y;
    let best = HIT_RADIUS;
    for (const node of nodes) {
      const nx = (node.xPct / 100) * rect.width;
      const ny = (node.yPct / 100) * rect.height;
      const dist = Math.hypot(nx - x, ny - y);
      if (dist < best) {
        best = dist;
        targetId = node.pub.id;
        targetX = nx;
        targetY = ny;
      }
    }

    const color = targetId
      ? STATUS_COLOR[publications.find((p) => p.id === targetId)!.status]
      : "#d8dcee";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (targetId) setSelectedId(targetId);
      return;
    }

    setShot({
      x: targetX,
      y: targetY,
      launchY: rect.height - 84,
      targetId,
      color,
      phase: "flight",
    });
  };

  const onArrive = () => {
    setShot((current) => {
      if (!current) return null;
      if (current.targetId) setSelectedId(current.targetId);
      return { ...current, phase: "burst" };
    });
    window.clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setShot(null), BURST_MS);
  };

  return (
    <div className={className}>
      <div
        ref={containerRef}
        onClick={(event) => fire(event.clientX, event.clientY)}
        className="relative h-[360px] cursor-crosshair overflow-hidden rounded-[2px] border border-white/8 bg-[linear-gradient(180deg,#04050c_0%,#080b18_52%,#12101f_100%)] sm:h-[420px]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: starField }}
        />

        <Skyline
          size="mini"
          parallax={false}
          className="absolute inset-x-0 bottom-0 opacity-80"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-[104px] border-t border-white/10 sm:bottom-[112px]"
        />
        <div className="pointer-events-none absolute inset-x-6 bottom-[80px] flex sm:bottom-[88px]">
          {years.map((year) => (
            <span
              key={year}
              className="flex-1 text-center font-mono text-[10px] tracking-[0.16em] text-moon-500"
            >
              {year}
            </span>
          ))}
        </div>

        {nodes.map((node) => {
          const color = STATUS_COLOR[node.pub.status];
          const dimmed = !activeIds.has(node.pub.id);
          const isSelected = node.pub.id === selectedId;
          return (
            <button
              key={node.pub.id}
              type="button"
              aria-label={`${node.pub.title}, ${node.pub.status.replace("-", " ")}, ${node.pub.venue.year}`}
              aria-pressed={isSelected}
              onClick={(event) => {
                event.stopPropagation();
                fire(event.clientX, event.clientY);
              }}
              className={`group absolute z-20 flex size-[44px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-opacity duration-300 ${
                dimmed ? "opacity-25" : "opacity-100"
              }`}
              style={{ left: `${node.xPct}%`, top: `${node.yPct}%` }}
            >
              {node.firstAuthor ? (
                <span
                  aria-hidden="true"
                  className="absolute size-[34px] rounded-full border border-ember-400/35"
                />
              ) : null}
              {isSelected ? (
                <span
                  aria-hidden="true"
                  className="absolute size-[40px] rounded-full border"
                  style={{ borderColor: `${color}80` }}
                />
              ) : null}
              <span className="transition-transform duration-200 group-hover:scale-125 group-focus-visible:scale-125">
                <NodeGlyph
                  status={node.pub.status}
                  color={color}
                  dimmed={dimmed}
                />
              </span>
              <span className="pointer-events-none absolute top-full left-1/2 z-40 mt-1.5 -translate-x-1/2 rounded-[2px] border border-white/10 bg-night-950/95 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-moon-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                {shortTitle(node.pub.title)}
                <span className="ml-2 text-moon-500">
                  {node.pub.venue.year}
                </span>
              </span>
            </button>
          );
        })}

        {shot && shot.phase === "flight" ? (
          <Rocket shot={shot} onArrive={onArrive} />
        ) : null}
        {shot && shot.phase === "burst" ? (
          <BurstEffect x={shot.x} y={shot.y} color={shot.color} />
        ) : null}

        <div className="pointer-events-none absolute bottom-4 left-5 flex flex-col gap-1.5 font-mono text-[10px] tracking-[0.1em] text-moon-500">
          <span className="flex items-center gap-2">
            <span className="relative inline-block size-[5px] rounded-full bg-ember-300">
              <span className="absolute left-1/2 top-[5px] h-[7px] w-[1.5px] -translate-x-1/2 bg-gradient-to-b from-ember-300/70 to-transparent" />
            </span>
            in flight — under review
          </span>
          <span className="flex items-center gap-2">
            <svg width="10" height="10" viewBox="-5 -5 10 10" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    x1={Math.cos(angle) * 1.5}
                    y1={Math.sin(angle) * 1.5}
                    x2={Math.cos(angle) * 4.5}
                    y2={Math.sin(angle) * 4.5}
                    stroke="#8fd9b0"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
            burst — accepted / published
          </span>
        </div>

        {!selected ? (
          <p className="pointer-events-none absolute right-5 bottom-4 hidden font-mono text-[10px] tracking-[0.14em] text-moon-700 sm:block">
            click the sky — hit a paper to open it
          </p>
        ) : null}
      </div>

      <div
        aria-live="polite"
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {selected ? (
            <PublicationCard publication={selected} className="mt-5" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
