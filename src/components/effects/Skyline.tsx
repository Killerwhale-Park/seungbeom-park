"use client";

import { Fragment, useEffect, useRef } from "react";
import { mulberry32, randomRange, type Rng } from "@/lib/random";

type SkylineProps = {
  className?: string;
  size?: "hero" | "mini";
  parallax?: boolean;
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
const WATER_Y = 254;
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
  rise: [90, 200],
  gap: [4, 24],
  spireChance: 0.2,
  ledgeChance: 0,
  litDensity: 0,
});

const FRONT = buildLayer({
  seed: 0x7c2d91,
  baseline: WATER_Y,
  span: [46, 132],
  rise: [50, 175],
  gap: [-10, 16],
  spireChance: 0.14,
  ledgeChance: 0.3,
  litDensity: 0.1,
});

const RIDGE =
  "M0 292 L110 258 L240 226 L340 196 L420 168 L510 210 L640 240 L780 256 L900 238 L1060 262 L1230 234 L1400 258 L1560 242 L1740 262 L1920 274 L1920 340 L0 340 Z";

const TOWER63 = { x: 1160, top: 148, baseW: 44, topW: 30, baseline: BACK_H };

const tower63Windows: LitWindow[] = (() => {
  const rng = mulberry32(0x63b1d6);
  const lit: LitWindow[] = [];
  for (let y = TOWER63.top + 10; y < TOWER63.baseline - 60; y += 8) {
    for (let i = 0; i < 4; i += 1) {
      if (rng() > 0.4) continue;
      const t = (y - TOWER63.top) / (TOWER63.baseline - TOWER63.top);
      const w = TOWER63.topW + (TOWER63.baseW - TOWER63.topW) * t;
      const left = TOWER63.x + (TOWER63.baseW - w) / 2;
      lit.push({
        x: Math.round(left + 5 + i * ((w - 10) / 4)),
        y,
        color: EMBER,
        alpha: Math.round(randomRange(rng, 0.22, 0.4) * 100) / 100,
      });
    }
  }
  return lit;
})();

const LOTTE = { cx: 1568, baseW: 74, tipW: 12, top: 26, baseline: WATER_Y };

const lotteWindows: LitWindow[] = (() => {
  const rng = mulberry32(0x10773e);
  const lit: LitWindow[] = [];
  for (let y = LOTTE.top + 34; y < LOTTE.baseline - 16; y += 13) {
    const t = (y - LOTTE.top) / (LOTTE.baseline - LOTTE.top);
    const w = LOTTE.tipW + (LOTTE.baseW - LOTTE.tipW) * Math.pow(t, 1.35);
    const columns = Math.max(1, Math.floor(w / 16));
    for (let i = 0; i < columns; i += 1) {
      if (rng() > 0.42) continue;
      const cool = rng() < 0.25;
      lit.push({
        x: Math.round(LOTTE.cx - w / 2 + 4 + i * ((w - 8) / Math.max(1, columns - 1) || 1)),
        y,
        color: cool ? IRIS : EMBER,
        alpha: Math.round(randomRange(rng, 0.18, 0.36) * 100) / 100,
      });
    }
  }
  return lit;
})();

const lottePath = (() => {
  const halfBase = LOTTE.baseW / 2;
  const halfTip = LOTTE.tipW / 2;
  const { cx, top, baseline } = LOTTE;
  return [
    `M ${cx - halfBase} ${baseline}`,
    `C ${cx - halfBase + 8} ${baseline - 90}, ${cx - halfTip - 10} ${top + 70}, ${cx - halfTip} ${top}`,
    `L ${cx + halfTip} ${top}`,
    `C ${cx + halfTip + 10} ${top + 70}, ${cx + halfBase - 8} ${baseline - 90}, ${cx + halfBase} ${baseline}`,
    "Z",
  ].join(" ");
})();

const BRIDGE = { from: 300, to: 960, deckY: 244 };

const bridgeLights: number[] = (() => {
  const xs: number[] = [];
  for (let x = BRIDGE.from + 20; x <= BRIDGE.to - 20; x += 44) xs.push(x);
  return xs;
})();

const reflections: { x: number; h: number; color: string; alpha: number }[] =
  (() => {
    const rng = mulberry32(0x4a11fe);
    const list = bridgeLights.map((x) => ({
      x,
      h: Math.round(randomRange(rng, 6, 13)),
      color: EMBER,
      alpha: 0.12,
    }));
    for (const x of [LOTTE.cx - 12, LOTTE.cx + 6, 1620, 120, 1050, 1820]) {
      list.push({
        x,
        h: Math.round(randomRange(rng, 8, 16)),
        color: rng() < 0.3 ? IRIS : EMBER,
        alpha: 0.1,
      });
    }
    return list;
  })();

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

function NamsanTower() {
  return (
    <g fill="#0c0f20">
      <rect x={404} y={156} width={32} height={14} />
      <rect x={417} y={94} width={6} height={64} />
      <rect x={406} y={78} width={28} height={16} rx={3} />
      <rect x={409} y={96} width={22} height={3} />
      <rect x={419} y={50} width={2} height={28} />
      <rect x={417.5} y={46} width={5} height={4} fill={EMBER} opacity={0.7} />
      <rect x={411} y={83} width={4} height={3} fill={EMBER} opacity={0.5} />
      <rect x={419} y={83} width={4} height={3} fill={EMBER} opacity={0.45} />
      <rect x={427} y={83} width={4} height={3} fill={EMBER} opacity={0.5} />
    </g>
  );
}

function Building63() {
  const { x, top, baseW, topW, baseline } = TOWER63;
  return (
    <g>
      <polygon
        points={`${x + (baseW - topW) / 2},${top} ${x + (baseW + topW) / 2},${top} ${x + baseW},${baseline} ${x},${baseline}`}
        fill="#0b0e1d"
      />
      {tower63Windows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={2.5}
          height={3.5}
          fill={w.color}
          opacity={w.alpha}
        />
      ))}
    </g>
  );
}

function LotteTower() {
  return (
    <g>
      <path d={lottePath} fill="#070912" />
      <rect x={LOTTE.cx - 7} y={8} width={3} height={20} fill="#070912" />
      <rect x={LOTTE.cx + 4} y={8} width={3} height={20} fill="#070912" />
      <rect x={LOTTE.cx - 1.5} y={30} width={3} height={3} fill={EMBER} opacity={0.6} />
      {lotteWindows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={2.5}
          height={4}
          fill={w.color}
          opacity={w.alpha}
        />
      ))}
    </g>
  );
}

function HanRiver() {
  return (
    <g>
      <rect x={0} y={WATER_Y} width={VIEW_W} height={FRONT_H - WATER_Y} fill="#030509" />
      <rect x={0} y={WATER_Y} width={VIEW_W} height={1.5} fill={IRIS} opacity={0.08} />
      <rect
        x={BRIDGE.from}
        y={BRIDGE.deckY}
        width={BRIDGE.to - BRIDGE.from}
        height={4}
        fill="#070912"
      />
      {[380, 490, 600, 710, 820, 930].map((x) => (
        <rect key={x} x={x} y={BRIDGE.deckY + 4} width={6} height={14} fill="#070912" />
      ))}
      {bridgeLights.map((x) => (
        <circle key={x} cx={x} cy={BRIDGE.deckY - 1.5} r={1.4} fill={EMBER} opacity={0.55} />
      ))}
      {reflections.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={WATER_Y + 3}
          width={1.5}
          height={r.h}
          fill={r.color}
          opacity={r.alpha}
        />
      ))}
    </g>
  );
}

const SIZES = {
  hero: {
    back: "h-[150px] sm:h-[200px] lg:h-[260px]",
    front: "h-[110px] sm:h-[150px] lg:h-[200px]",
  },
  mini: {
    back: "h-[88px]",
    front: "h-[64px]",
  },
} as const;

export function Skyline({
  className,
  size = "hero",
  parallax = true,
}: SkylineProps) {
  const backRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!parallax) return;
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
  }, [parallax]);

  const sizes = SIZES[size];

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
        className={`col-start-1 row-start-1 w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none ${sizes.back}`}
      >
        <path d={RIDGE} fill="#0e1224" opacity={0.6} />
        <NamsanTower />
        <g opacity="0.8">
          <Layer buildings={BACK} fill="#0b0e1d" baseline={BACK_H} />
        </g>
        <Building63 />
      </svg>
      <svg
        ref={frontRef}
        viewBox={`0 0 ${VIEW_W} ${FRONT_H}`}
        preserveAspectRatio="none"
        className={`col-start-1 row-start-1 w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none ${sizes.front}`}
      >
        <Layer buildings={FRONT} fill="#070912" baseline={WATER_Y} />
        <LotteTower />
        <HanRiver />
      </svg>
    </div>
  );
}
