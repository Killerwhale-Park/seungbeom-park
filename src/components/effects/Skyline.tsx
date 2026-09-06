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
};

const VIEW_W = 1920;
const BACK_H = 340;
const FRONT_H = 280;
const WATER_Y = 234;

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

const GATE_ZONE: [number, number] = [40, 330];

const FRONT = buildLayer({
  seed: 0x7c2d91,
  baseline: WATER_Y,
  span: [46, 132],
  rise: [50, 160],
  gap: [-10, 16],
  spireChance: 0.14,
  ledgeChance: 0.3,
  litDensity: 0.1,
}).filter((b) => b.x + b.w < GATE_ZONE[0] || b.x > GATE_ZONE[1]);

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
        tone: "warm",
        alpha: Math.round(randomRange(rng, 0.22, 0.4) * 100) / 100,
      });
    }
  }
  return lit;
})();

const LOTTE = { cx: 1568, baseW: 78, tipW: 12, top: 4, baseline: WATER_Y };

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
        tone: cool ? "cool" : "warm",
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

const BRIDGE = { from: 360, to: 1080, deckY: 218 };

const bridgeLights: number[] = (() => {
  const xs: number[] = [];
  for (let x = BRIDGE.from + 18; x <= BRIDGE.to - 18; x += 36) xs.push(x);
  return xs;
})();

const FOUNTAINS: { x: number; dir: 1 | -1 }[] = [
  { x: 420, dir: 1 },
  { x: 530, dir: -1 },
  { x: 640, dir: 1 },
  { x: 750, dir: -1 },
  { x: 860, dir: 1 },
  { x: 970, dir: -1 },
];

const FOUNTAIN_DROPS: [number, number][] = [
  [8, 2],
  [14, 5],
  [19, 8],
  [23, 11],
  [26, 14],
];

const reflections: { x: number; h: number; tone: WindowTone; alpha: number }[] =
  (() => {
    const rng = mulberry32(0x4a11fe);
    const list = bridgeLights.map((x) => ({
      x,
      h: Math.round(randomRange(rng, 9, 20)),
      tone: "warm" as WindowTone,
      alpha: 0.16,
    }));
    for (const x of [LOTTE.cx - 12, LOTTE.cx + 6, 1620, 120, 1050, 1180, 1420, 1820]) {
      list.push({
        x,
        h: Math.round(randomRange(rng, 12, 26)),
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

function NamsanTower() {
  return (
    <g style={{ fill: "var(--skyline-tower)" }}>
      <rect x={402} y={158} width={36} height={12} />
      <rect x={410} y={152} width={20} height={6} />
      <rect x={417} y={100} width={6} height={52} />
      <rect x={405} y={80} width={30} height={18} rx={4} />
      <rect x={408} y={98} width={24} height={3} />
      <rect x={419} y={48} width={2.5} height={32} />
      <rect x={417.5} y={44} width={5} height={4} style={{ fill: TONE_FILL.warm }} opacity={0.75} />
      <rect x={410} y={86} width={4} height={4} style={{ fill: TONE_FILL.warm }} opacity={0.55} />
      <rect x={418} y={86} width={4} height={4} style={{ fill: TONE_FILL.warm }} opacity={0.45} />
      <rect x={426} y={86} width={4} height={4} style={{ fill: TONE_FILL.warm }} opacity={0.55} />
    </g>
  );
}

function PalaceGate() {
  return (
    <g>
      <rect
        x={130}
        y={200}
        width={140}
        height={36}
        style={{ fill: "var(--skyline-front)" }}
      />
      <path
        d="M100 206 Q120 188 150 184 L250 184 Q280 188 300 206 Q252 196 200 196 Q148 196 100 206 Z"
        style={{ fill: "var(--skyline-front)" }}
      />
      <rect
        x={150}
        y={162}
        width={100}
        height={24}
        style={{ fill: "var(--skyline-front)" }}
      />
      <path
        d="M128 166 Q146 150 172 146 L228 146 Q254 150 272 166 Q236 158 200 158 Q164 158 128 166 Z"
        style={{ fill: "var(--skyline-front)" }}
      />
      {[155, 193, 231].map((x) => (
        <rect
          key={x}
          x={x}
          y={214}
          width={14}
          height={20}
          rx={7}
          style={{ fill: TONE_FILL.warm }}
          opacity={0.4}
        />
      ))}
      <rect
        x={168}
        y={168}
        width={64}
        height={6}
        style={{ fill: TONE_FILL.warm }}
        opacity={0.25}
      />
    </g>
  );
}

function Building63() {
  const { x, top, baseW, topW, baseline } = TOWER63;
  return (
    <g>
      <polygon
        points={`${x + (baseW - topW) / 2},${top} ${x + (baseW + topW) / 2},${top} ${x + baseW},${baseline} ${x},${baseline}`}
        style={{ fill: "var(--skyline-back)" }}
      />
      {tower63Windows.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={2.5}
          height={3.5}
          style={{ fill: TONE_FILL[w.tone] }}
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
      <rect x={LOTTE.cx - 8} y={0} width={3} height={16} style={{ fill: "var(--skyline-front)" }} />
      <rect x={LOTTE.cx + 5} y={0} width={3} height={16} style={{ fill: "var(--skyline-front)" }} />
      <rect x={LOTTE.cx - 1.5} y={18} width={3} height={3} style={{ fill: TONE_FILL.warm }} opacity={0.6} />
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
        opacity={0.12}
      />
      {[
        [90, 340, 244],
        [820, 460, 256],
        [1420, 320, 250],
      ].map(([x, w, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={1}
          style={{ fill: TONE_FILL.cool }}
          opacity={0.06}
        />
      ))}
      <rect
        x={BRIDGE.from}
        y={BRIDGE.deckY}
        width={BRIDGE.to - BRIDGE.from}
        height={6}
        style={{ fill: "var(--skyline-front)" }}
      />
      {[400, 500, 600, 700, 800, 900, 1000].map((x) => (
        <rect
          key={x}
          x={x}
          y={BRIDGE.deckY + 6}
          width={8}
          height={24}
          style={{ fill: "var(--skyline-front)" }}
        />
      ))}
      {bridgeLights.map((x) => (
        <circle
          key={x}
          cx={x}
          cy={BRIDGE.deckY - 2.5}
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
            cy={BRIDGE.deckY + 4 + dy}
            r={1.3}
            style={{ fill: TONE_FILL.cool }}
            opacity={0.5 - i * 0.06}
          />
        )),
      )}
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
        <path d={RIDGE} style={{ fill: "var(--skyline-ridge)" }} opacity={0.6} />
        <NamsanTower />
        <g opacity="0.8">
          <Layer buildings={BACK} fill="var(--skyline-back)" baseline={BACK_H} />
        </g>
        <Building63 />
      </svg>
      <svg
        ref={frontRef}
        viewBox={`0 0 ${VIEW_W} ${FRONT_H}`}
        preserveAspectRatio="none"
        className={`col-start-1 row-start-1 w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none ${sizes.front}`}
      >
        <Layer buildings={FRONT} fill="var(--skyline-front)" baseline={WATER_Y} />
        <PalaceGate />
        <LotteTower />
        <HanRiver />
      </svg>
    </div>
  );
}
