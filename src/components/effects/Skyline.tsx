"use client";

import { Fragment, useEffect, useRef } from "react";
import { mulberry32, randomRange, type Rng } from "@/lib/random";

type SkylineProps = {
  className?: string;
};

type LitWindow = {
  x: number;
  y: number;
  color: string;
  alpha: number;
};

type Building = {
  x: number;
  y: number;
  w: number;
  h: number;
  spire: number;
  beacon: boolean;
  ledge: boolean;
  lit: LitWindow[];
};

type LayerOptions = {
  seed: number;
  baseline: number;
  span: [number, number];
  rise: [number, number];
  gap: [number, number];
  spireChance: number;
  ledgeChance: number;
  litDensity: number;
};

const VIEW_W = 1920;
const BACK_H = 340;
const FRONT_H = 280;
const EMBER = "#ffd98a";
const IRIS = "#aab3f2";

function litWindows(
  rng: Rng,
  building: Building,
  baseline: number,
  density: number,
): LitWindow[] {
  if (density <= 0) return [];
  const lit: LitWindow[] = [];
  for (let x = building.x + 9; x < building.x + building.w - 9; x += 9) {
    for (let y = building.y + 13; y < baseline - 9; y += 12) {
      if (rng() > density) continue;
      const cool = rng() < 0.07;
      lit.push({
        x: Math.round(x),
        y: Math.round(y),
        color: cool ? IRIS : EMBER,
        alpha: cool ? 0.42 : Math.round(randomRange(rng, 0.32, 0.58) * 100) / 100,
      });
    }
  }
  return lit;
}

function buildLayer(options: LayerOptions): Building[] {
  const rng = mulberry32(options.seed);
  const list: Building[] = [];
  let x = -40;
  while (x < VIEW_W + 40) {
    const w = randomRange(rng, options.span[0], options.span[1]);
    const h = randomRange(rng, options.rise[0], options.rise[1]);
    const spire = rng() < options.spireChance ? randomRange(rng, 16, 54) : 0;
    const building: Building = {
      x: Math.round(x),
      y: Math.round(options.baseline - h),
      w: Math.round(w),
      h: Math.round(h),
      spire: Math.round(spire),
      beacon: spire > 0 && rng() < 0.55,
      ledge: rng() < options.ledgeChance,
      lit: [],
    };
    building.lit = litWindows(rng, building, options.baseline, options.litDensity);
    list.push(building);
    x += w + randomRange(rng, options.gap[0], options.gap[1]);
  }
  return list;
}

// Fixed seeds so the server and client render identical skylines.
const BACK = buildLayer({
  seed: 0x1f3a5c,
  baseline: BACK_H,
  span: [20, 52],
  rise: [110, 300],
  gap: [4, 24],
  spireChance: 0.2,
  ledgeChance: 0,
  litDensity: 0,
});

const FRONT = buildLayer({
  seed: 0x7c2d91,
  baseline: FRONT_H,
  span: [46, 132],
  rise: [58, 208],
  gap: [-10, 16],
  spireChance: 0.14,
  ledgeChance: 0.3,
  litDensity: 0.1,
});

function Layer({
  buildings,
  fill,
  baseline,
}: {
  buildings: Building[];
  fill: string;
  baseline: number;
}) {
  return (
    <g fill={fill}>
      {buildings.map((b, i) => (
        <Fragment key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={baseline - b.y + 10} />
          {b.ledge ? (
            <rect x={b.x - 3} y={b.y} width={b.w + 6} height={5} />
          ) : null}
          {b.spire > 0 ? (
            <rect
              x={b.x + b.w / 2 - 1.5}
              y={b.y - b.spire}
              width={3}
              height={b.spire}
            />
          ) : null}
          {b.beacon ? (
            <rect
              x={b.x + b.w / 2 - 2}
              y={b.y - b.spire - 2}
              width={4}
              height={4}
              fill={EMBER}
              opacity={0.5}
            />
          ) : null}
          {b.lit.map((w, j) => (
            <rect
              key={j}
              x={w.x}
              y={w.y}
              width={3}
              height={4}
              fill={w.color}
              opacity={w.alpha}
            />
          ))}
        </Fragment>
      ))}
    </g>
  );
}

export function Skyline({ className }: SkylineProps) {
  const backRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    if (!back || !front) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    let visible = true;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      back.style.transform = `translate3d(${x * 6}px, ${y * 2.5}px, 0)`;
      front.style.transform = `translate3d(${x * 12}px, ${y * 5}px, 0)`;
    };

    const onMove = (event: PointerEvent) => {
      if (!visible || event.pointerType !== "mouse") return;
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      if (raf === 0) raf = requestAnimationFrame(apply);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(front);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      observer.disconnect();
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={["pointer-events-none grid select-none items-end", className]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        ref={backRef}
        viewBox={`0 0 ${VIEW_W} ${BACK_H}`}
        preserveAspectRatio="none"
        className="col-start-1 row-start-1 h-[150px] w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none sm:h-[200px] lg:h-[260px]"
      >
        <g opacity="0.8">
          <Layer buildings={BACK} fill="#0b0e1d" baseline={BACK_H} />
        </g>
      </svg>
      <svg
        ref={frontRef}
        viewBox={`0 0 ${VIEW_W} ${FRONT_H}`}
        preserveAspectRatio="none"
        className="col-start-1 row-start-1 h-[110px] w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none sm:h-[150px] lg:h-[200px]"
      >
        <Layer buildings={FRONT} fill="#070912" baseline={FRONT_H} />
      </svg>
    </div>
  );
}
