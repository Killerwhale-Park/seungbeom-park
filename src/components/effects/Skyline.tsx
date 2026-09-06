"use client";

import { Fragment, useEffect, useRef } from "react";
import { mulberry32, randomRange, type Rng } from "@/lib/random";

type SkylineProps = {
  className?: string;
  size?: "hero" | "mini";
  parallax?: boolean;
};

type WindowTone = "warm" | "cool";

type LitWindow = {
  x: number;
  y: number;
  tone: WindowTone;
  alpha: number;
};

const TONE_FILL: Record<WindowTone, string> = {
  warm: "var(--skyline-window)",
  cool: "var(--skyline-window-cool)",
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
  keepZones?: [number, number][];
};

const VIEW_W = 1920;
const BACK_H = 340;
const FRONT_H = 280;
const WATER_Y = 238;

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
        tone: cool ? "cool" : "warm",
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
  if (!options.keepZones) return list;
  return list.filter((b) =>
    options.keepZones!.some((zone) => b.x >= zone[0] && b.x + b.w <= zone[1]),
  );
}

// Fixed seeds so the server and client render identical skylines.
const BACK = buildLayer({
  seed: 0x1f3a5c,
  baseline: BACK_H,
  span: [20, 52],
  rise: [70, 160],
  gap: [4, 24],
  spireChance: 0.2,
  ledgeChance: 0,
  litDensity: 0,
});

const FRONT = buildLayer({
  seed: 0x7c2d91,
  baseline: WATER_Y,
  span: [42, 110],
  rise: [40, 105],
  gap: [-8, 18],
  spireChance: 0.1,
  ledgeChance: 0.3,
  litDensity: 0.1,
  keepZones: [
    [-60, 110],
    [1290, 1495],
    [1640, 1980],
  ],
});

const RIDGE_FAR =
  "M0 250 L180 210 L360 232 L560 196 L760 226 L980 200 L1200 228 L1420 204 L1640 230 L1920 210 L1920 340 L0 340 Z";

const RIDGE_NEAR =
  "M0 292 L140 262 L300 278 L480 246 L660 274 L900 252 L1140 276 L1380 254 L1620 278 L1920 260 L1920 340 L0 340 Z";

const NAMSAN = { cx: 510, hillLeft: 396, hillRight: 644, peakY: 148 };

const B63 = { left: 1180, right: 1260, top: 96 };

const b63Windows: LitWindow[] = (() => {
  const rng = mulberry32(0x63b1d6);
  const lit: LitWindow[] = [];
  for (let y = B63.top + 12; y < WATER_Y - 10; y += 9) {
    for (let x = B63.left + 10; x < B63.right - 8; x += 11) {
      if (rng() > 0.72) continue;
      lit.push({
        x,
        y,
        tone: "warm",
        alpha: Math.round(randomRange(rng, 0.26, 0.5) * 100) / 100,
      });
    }
  }
  return lit;
})();

const LOTTE = { cx: 1560, baseW: 92, tipW: 14, top: 22, baseline: WATER_Y };

const lottePath = (() => {
  const halfBase = LOTTE.baseW / 2;
  const halfTip = LOTTE.tipW / 2;
  const { cx, top, baseline } = LOTTE;
  return [
    `M ${cx - halfBase} ${baseline}`,
    `C ${cx - halfBase + 10} ${baseline - 100}, ${cx - halfTip - 12} ${top + 76}, ${cx - halfTip} ${top}`,
    `L ${cx + halfTip} ${top}`,
    `C ${cx + halfTip + 12} ${top + 76}, ${cx + halfBase - 10} ${baseline - 100}, ${cx + halfBase} ${baseline}`,
    "Z",
  ].join(" ");
})();

const lotteWindows: LitWindow[] = (() => {
  const rng = mulberry32(0x10773e);
  const lit: LitWindow[] = [];
  for (let y = LOTTE.top + 30; y < LOTTE.baseline - 14; y += 11) {
    const t = (y - LOTTE.top) / (LOTTE.baseline - LOTTE.top);
    const w = LOTTE.tipW + (LOTTE.baseW - LOTTE.tipW) * Math.pow(t, 1.3);
    const columns = Math.max(1, Math.floor(w / 15));
    for (let i = 0; i < columns; i += 1) {
      if (rng() > 0.45) continue;
      const cool = rng() < 0.25;
      lit.push({
        x: Math.round(
          LOTTE.cx - w / 2 + 4 + i * ((w - 8) / Math.max(1, columns - 1) || 1),
        ),
        y,
        tone: cool ? "cool" : "warm",
        alpha: Math.round(randomRange(rng, 0.2, 0.38) * 100) / 100,
      });
    }
  }
  return lit;
})();

const BRIDGE = { from: 660, to: 1120, upperY: 206, lowerY: 222 };

const bridgeLights: number[] = (() => {
  const xs: number[] = [];
  for (let x = BRIDGE.from + 18; x <= BRIDGE.to - 18; x += 36) xs.push(x);
  return xs;
})();

const FOUNTAINS: { x: number; dir: 1 | -1 }[] = [
  { x: 725, dir: 1 },
  { x: 795, dir: -1 },
  { x: 865, dir: 1 },
  { x: 935, dir: -1 },
  { x: 1005, dir: 1 },
  { x: 1075, dir: -1 },
];

const FOUNTAIN_DROPS: [number, number][] = [
  [9, 3],
  [16, 8],
  [22, 14],
  [27, 21],
  [30, 28],
];

const reflections: { x: number; h: number; tone: WindowTone; alpha: number }[] =
  (() => {
    const rng = mulberry32(0x4a11fe);
    const list = bridgeLights.map((x) => ({
      x,
      h: Math.round(randomRange(rng, 10, 24)),
      tone: "warm" as WindowTone,
      alpha: 0.16,
    }));
    for (const x of [700, 780, 870, 950, 1030, 1110, 1200, 1240, 1545, 1575]) {
      list.push({
        x,
        h: Math.round(randomRange(rng, 12, 28)),
        tone: rng() < 0.3 ? "cool" : "warm",
        alpha: 0.12,
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
    <g style={{ fill }}>
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
              style={{ fill: TONE_FILL.warm }}
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
              style={{ fill: TONE_FILL[w.tone] }}
              opacity={w.alpha}
            />
          ))}
        </Fragment>
      ))}
    </g>
  );
}

function PalaceGate() {
  return (
    <g>
      <rect
        x={150}
        y={190}
        width={180}
        height={50}
        style={{ fill: "var(--skyline-front)" }}
      />
      <path
        d="M116 190 Q150 158 200 152 L280 152 Q330 158 364 190 Q300 172 240 172 Q180 172 116 190 Z"
        style={{ fill: "var(--skyline-front)" }}
      />
      <rect
        x={186}
        y={128}
        width={108}
        height={26}
        style={{ fill: "var(--skyline-front)" }}
      />
      <path
        d="M158 134 Q186 108 218 104 L262 104 Q294 108 322 134 Q280 120 240 120 Q200 120 158 134 Z"
        style={{ fill: "var(--skyline-front)" }}
      />
      {[187, 229, 271].map((x) => (
        <rect
          key={x}
          x={x}
          y={204}
          width={22}
          height={34}
          rx={11}
          style={{ fill: TONE_FILL.warm }}
          opacity={0.38}
        />
      ))}
      <rect
        x={196}
        y={134}
        width={88}
        height={7}
        style={{ fill: TONE_FILL.warm }}
        opacity={0.25}
      />
    </g>
  );
}

function NamsanTower() {
  return (
    <g style={{ fill: "var(--skyline-front)" }}>
      <path
        d={`M${NAMSAN.hillLeft} ${WATER_Y} Q${NAMSAN.cx - 50} ${NAMSAN.peakY + 4} ${NAMSAN.cx} ${NAMSAN.peakY} Q${NAMSAN.cx + 60} ${NAMSAN.peakY + 6} ${NAMSAN.hillRight} ${WATER_Y} Z`}
      />
      <polygon
        points={`${NAMSAN.cx - 7},${NAMSAN.peakY} ${NAMSAN.cx + 7},${NAMSAN.peakY} ${NAMSAN.cx + 4},60 ${NAMSAN.cx - 4},60`}
      />
      <rect x={NAMSAN.cx - 22} y={40} width={44} height={18} rx={6} />
      <rect x={NAMSAN.cx - 18} y={58} width={36} height={3.5} />
      <rect x={NAMSAN.cx - 15} y={64} width={30} height={3} />
      <rect x={NAMSAN.cx - 1.5} y={8} width={3} height={32} />
      <rect x={NAMSAN.cx - 5} y={16} width={10} height={2.5} />
      <rect
        x={NAMSAN.cx - 3}
        y={4}
        width={6}
        height={4}
        style={{ fill: TONE_FILL.warm }}
        opacity={0.8}
      />
      <rect
        x={NAMSAN.cx - 18}
        y={45}
        width={36}
        height={5}
        style={{ fill: TONE_FILL.warm }}
        opacity={0.5}
      />
      {[-40, -14, 12, 32].map((dx) => (
        <rect
          key={dx}
          x={NAMSAN.cx + dx}
          y={randToY(dx)}
          width={3}
          height={3}
          style={{ fill: TONE_FILL.warm }}
          opacity={0.35}
        />
      ))}
    </g>
  );
}

function randToY(dx: number): number {
  return 196 + ((Math.abs(dx * 7) % 4) + 1) * 7;
}

function Building63() {
  return (
    <g>
      <path
        d={`M${B63.left} ${WATER_Y} C${B63.left + 4} 180 ${B63.left + 12} 124 ${B63.left + 22} ${B63.top} L${B63.right - 22} ${B63.top} C${B63.right - 12} 124 ${B63.right - 4} 180 ${B63.right} ${WATER_Y} Z`}
        style={{ fill: "var(--skyline-front)" }}
      />
      {b63Windows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={3}
          height={4}
          style={{ fill: TONE_FILL.warm }}
          opacity={w.alpha}
        />
      ))}
    </g>
  );
}

function LotteTower() {
  return (
    <g>
      <path d={lottePath} style={{ fill: "var(--skyline-front)" }} />
      <rect
        x={LOTTE.cx - 9}
        y={2}
        width={4}
        height={22}
        style={{ fill: "var(--skyline-front)" }}
      />
      <rect
        x={LOTTE.cx + 5}
        y={2}
        width={4}
        height={22}
        style={{ fill: "var(--skyline-front)" }}
      />
      <rect
        x={LOTTE.cx - 1.5}
        y={16}
        width={3}
        height={3}
        style={{ fill: TONE_FILL.warm }}
        opacity={0.65}
      />
      {lotteWindows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={2.5}
          height={4}
          style={{ fill: TONE_FILL[w.tone] }}
          opacity={w.alpha}
        />
      ))}
    </g>
  );
}

function BanpoBridge() {
  return (
    <g>
      <rect
        x={BRIDGE.from}
        y={BRIDGE.upperY}
        width={BRIDGE.to - BRIDGE.from}
        height={6}
        style={{ fill: "var(--skyline-front)" }}
      />
      <rect
        x={BRIDGE.from + 14}
        y={BRIDGE.lowerY}
        width={BRIDGE.to - BRIDGE.from - 28}
        height={4}
        style={{ fill: "var(--skyline-front)" }}
      />
      {[690, 760, 830, 900, 970, 1040, 1106].map((x) => (
        <rect
          key={x}
          x={x}
          y={BRIDGE.upperY + 6}
          width={8}
          height={WATER_Y - BRIDGE.upperY + 6}
          style={{ fill: "var(--skyline-front)" }}
        />
      ))}
      {bridgeLights.map((x) => (
        <circle
          key={x}
          cx={x}
          cy={BRIDGE.upperY - 2.5}
          r={1.9}
          style={{ fill: TONE_FILL.warm }}
          opacity={0.7}
        />
      ))}
      {FOUNTAINS.map((fountain) =>
        FOUNTAIN_DROPS.map(([dx, dy], i) => (
          <circle
            key={`${fountain.x}-${i}`}
            cx={fountain.x + dx * fountain.dir}
            cy={BRIDGE.upperY + 5 + dy}
            r={1.4}
            style={{ fill: TONE_FILL.cool }}
            opacity={0.52 - i * 0.07}
          />
        )),
      )}
    </g>
  );
}

function HanRiver() {
  return (
    <g>
      <rect
        x={0}
        y={WATER_Y}
        width={VIEW_W}
        height={FRONT_H - WATER_Y}
        style={{ fill: "var(--skyline-water)" }}
      />
      <rect
        x={0}
        y={WATER_Y}
        width={VIEW_W}
        height={1.5}
        style={{ fill: TONE_FILL.cool }}
        opacity={0.14}
      />
      {[
        [80, 360, 250],
        [700, 500, 262],
        [1300, 380, 256],
      ].map(([x, w, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={1}
          style={{ fill: TONE_FILL.cool }}
          opacity={0.07}
        />
      ))}
      {reflections.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={WATER_Y + 3}
          width={1.5}
          height={r.h}
          style={{ fill: TONE_FILL[r.tone] }}
          opacity={r.alpha}
        />
      ))}
    </g>
  );
}

const SIZES = {
  hero: {
    back: "h-[150px] sm:h-[200px] lg:h-[260px]",
    front: "h-[120px] sm:h-[165px] lg:h-[220px]",
  },
  mini: {
    back: "h-[88px]",
    front: "h-[70px]",
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
        <path d={RIDGE_FAR} style={{ fill: "var(--skyline-ridge)" }} opacity={0.4} />
        <path d={RIDGE_NEAR} style={{ fill: "var(--skyline-ridge)" }} opacity={0.65} />
        <g opacity="0.8">
          <Layer buildings={BACK} fill="var(--skyline-back)" baseline={BACK_H} />
        </g>
      </svg>
      <svg
        ref={frontRef}
        viewBox={`0 0 ${VIEW_W} ${FRONT_H}`}
        preserveAspectRatio="none"
        className={`col-start-1 row-start-1 w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none ${sizes.front}`}
      >
        <Layer buildings={FRONT} fill="var(--skyline-front)" baseline={WATER_Y} />
        <PalaceGate />
        <NamsanTower />
        <Building63 />
        <LotteTower />
        <BanpoBridge />
        <HanRiver />
      </svg>
    </div>
  );
}
