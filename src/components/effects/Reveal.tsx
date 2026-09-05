"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "hidden" | "shown">("idle");

  useBeforePaint(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    setPhase("hidden");

    // Sections taller than the viewport can never reach a flat 15% ratio.
    const ratio = Math.min(
      0.15,
      (window.innerHeight * 0.28) / Math.max(node.offsetHeight, 1),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase("shown");
            observer.disconnect();
          }
        }
      },
      { threshold: ratio },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={[
        phase === "hidden"
          ? "translate-y-3 opacity-0"
          : "translate-y-0 opacity-100",
        phase === "shown"
          ? "transition duration-500 ease-out motion-reduce:transition-none"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
