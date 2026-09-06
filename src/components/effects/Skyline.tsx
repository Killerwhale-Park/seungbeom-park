"use client";

import { useEffect, useRef } from "react";
import { skylineBack, skylineFront } from "@/components/effects/skylineScene";

type SkylineProps = {
  className?: string;
  size?: "hero" | "mini";
  parallax?: boolean;
};

export function Skyline({
  className,
  size = "hero",
  parallax = true,
}: SkylineProps) {
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

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

  const layerClass =
    "col-start-1 row-start-1 w-full transition-transform duration-700 ease-out will-change-transform motion-reduce:transition-none";

  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none grid content-end select-none items-end",
        size === "mini" ? "h-[150px] overflow-hidden" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={backRef}
        className={layerClass}
        dangerouslySetInnerHTML={{
          __html: skylineBack.night + skylineBack.day,
        }}
      />
      <div
        ref={frontRef}
        className={layerClass}
        dangerouslySetInnerHTML={{
          __html: skylineFront.night + skylineFront.day,
        }}
      />
    </div>
  );
}
