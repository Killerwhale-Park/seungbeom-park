"use client";

import { useMemo } from "react";

function fade(color: string, percent: number): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}

type Ray = {
  angle: number;
  inner: number;
  outer: number;
  width: number;
  alpha: number;
};

function makeRays(): Ray[] {
  const count = 14 + Math.floor(Math.random() * 5);
  return Array.from({ length: count }, (_, i) => {
    const angle =
      (i / count) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / count) * 1.7;
    return {
      angle,
      inner: 3 + Math.random() * 5,
      outer: 18 + Math.random() * 16,
      width: 1 + Math.random() * 1.3,
      alpha: 0.55 + Math.random() * 0.45,
    };
  });
}

type BurstFxProps = {
  x: number;
  y: number;
  color: string;
  fixed?: boolean;
};

export function BurstFx({ x, y, color, fixed = false }: BurstFxProps) {
  const rays = useMemo(() => makeRays(), []);

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
        width="80"
        height="80"
        viewBox="-40 -40 80 80"
        className="sky-burst-ray absolute -translate-x-1/2 -translate-y-1/2"
      >
        {rays.map((ray, i) => (
          <line
            key={i}
            x1={Math.cos(ray.angle) * ray.inner}
            y1={Math.sin(ray.angle) * ray.inner}
            x2={Math.cos(ray.angle) * ray.outer}
            y2={Math.sin(ray.angle) * ray.outer}
            style={{ stroke: color }}
            strokeWidth={ray.width}
            strokeLinecap="round"
            opacity={ray.alpha}
          />
        ))}
        {rays
          .filter((_, i) => i % 3 === 0)
          .map((ray, i) => (
            <circle
              key={`tip-${i}`}
              cx={Math.cos(ray.angle) * (ray.outer + 3)}
              cy={Math.sin(ray.angle) * (ray.outer + 3)}
              r={1.1}
              style={{ fill: color }}
              opacity={ray.alpha * 0.9}
            />
          ))}
      </svg>
    </span>
  );
}
