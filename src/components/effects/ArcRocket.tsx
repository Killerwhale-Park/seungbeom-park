"use client";

import { useEffect, useRef } from "react";

type ArcRocketProps = {
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  fixed?: boolean;
  durationMs?: number;
  onArrive: () => void;
};

export function ArcRocket({
  targetX,
  targetY,
  startX,
  startY,
  fixed = false,
  durationMs = 700,
  onArrive,
}: ArcRocketProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const arrived = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const ctrlX = startX + (targetX - startX) * 0.18;
    const ctrlY = targetY + (startY - targetY) * 0.22;
    let raf = 0;
    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const e = 1 - Math.pow(1 - t, 2.1);
      const inv = 1 - e;
      const x = inv * inv * startX + 2 * inv * e * ctrlX + e * e * targetX;
      const y = inv * inv * startY + 2 * inv * e * ctrlY + e * e * targetY;
      element.style.transform = `translate(${x}px, ${y}px)`;
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else if (!arrived.current) {
        arrived.current = true;
        onArrive();
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetX, targetY, startX, startY, durationMs, onArrive]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none left-0 top-0 z-30 block ${fixed ? "fixed" : "absolute"}`}
      style={{ transform: `translate(${startX}px, ${startY}px)` }}
    >
      <span
        className="block size-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-200"
        style={{ boxShadow: "0 0 10px var(--color-ember-200)" }}
      />
    </span>
  );
}
