"use client";

function fade(color: string, percent: number): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}

type BurstFxProps = {
  x: number;
  y: number;
  color: string;
  fixed?: boolean;
};

export function BurstFx({ x, y, color, fixed = false }: BurstFxProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none left-0 top-0 z-30 ${fixed ? "fixed" : "absolute"}`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <span
        className="sky-burst-flash absolute block size-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${fade(color, 40)} 0%, transparent 70%)`,
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
              style={{ stroke: color }}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </span>
  );
}
