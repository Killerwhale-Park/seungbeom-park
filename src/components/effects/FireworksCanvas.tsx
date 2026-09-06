"use client";

import { useEffect, useRef, useState } from "react";
import { mulberry32, pickFrom, randomRange, type Rng } from "@/lib/random";

type FireworksCanvasProps = {
  className?: string;
  interactive?: boolean;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  twinkle: boolean;
  halo: boolean;
};

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  age: number;
  fuse: number;
  colors: readonly string[];
  power: number;
};

type Flash = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
};

const TAU = Math.PI * 2;
const FRAME = 1000 / 60;
const MAX_SPARKS = 1200;
const MAX_BURSTS = 4;

const FAMILIES: readonly (readonly string[])[] = [
  ["#ffd98a", "#f2b45c", "#ffe9bd", "#fff3d6"],
  ["#e8e6f0", "#f4f5fb", "#d8dcee"],
  ["#ff8d7d", "#ff6b5e", "#ffc4ba", "#ffdcd4"],
  ["#8fe89f", "#6fd884", "#c4f5cc", "#e2ffe8"],
  ["#7fb2ff", "#5d97f2", "#b6d2ff", "#dce9ff"],
  ["#c09aff", "#a878f2", "#dcc8ff", "#efe4ff"],
  ["#ff9ec2", "#f27fab", "#ffc9dd"],
  ["#7de8dc", "#5dd6c8", "#c2f7f1"],
];

const LIGHT_FAMILIES: readonly (readonly string[])[] = [
  ["#b8741a", "#a05a12", "#d99444"],
  ["#5c617e", "#464c6b", "#7c81a0"],
  ["#c9342a", "#a8241c", "#e0564a"],
  ["#188a4f", "#106b3b", "#27a565"],
  ["#1f6fd4", "#1657a8", "#3c8ae8"],
  ["#7a2fc2", "#5f2299", "#9350d9"],
  ["#d33f7e", "#b02861", "#e26a9d"],
  ["#0f9490", "#0b736f", "#2ab3ae"],
];

const FAMILY_WEIGHTS = [0.24, 0.12, 0.13, 0.13, 0.13, 0.11, 0.08, 0.06];

function isLightTheme(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light"
  );
}

function familyFor(rng: Rng): readonly string[] {
  const families = isLightTheme() ? LIGHT_FAMILIES : FAMILIES;
  let roll = rng();
  for (let i = 0; i < families.length; i += 1) {
    roll -= FAMILY_WEIGHTS[i];
    if (roll <= 0) return families[i];
  }
  return families[0];
}

function hexAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function FireworksCanvas({
  className,
  interactive = true,
}: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(reducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const context = element.getContext("2d");
    if (!context) return;
    const canvas: HTMLCanvasElement = element;
    const ctx: CanvasRenderingContext2D = context;

    let width = 1;
    let height = 1;

    const rng = mulberry32((Date.now() ^ 0x9e3779b9) >>> 0);
    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];
    const flashes: Flash[] = [];
    const bursts: number[] = [];

    let raf = 0;
    let last = 0;
    let visible = true;
    let nextLaunch = 0;

    function measure() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawStatic() {
      const srng = mulberry32(0x51ce0f);
      const spots = [
        [0.24, 0.32],
        [0.56, 0.21],
        [0.79, 0.4],
      ];
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = isLightTheme() ? "source-over" : "lighter";
      for (const spot of spots) {
        const cx = spot[0] * width;
        const cy = spot[1] * height;
        const colors = familyFor(srng);
        const radius = Math.min(width, height) * randomRange(srng, 0.08, 0.13);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        glow.addColorStop(0, hexAlpha(colors[0], 0.12));
        glow.addColorStop(1, hexAlpha(colors[0], 0));
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        for (let i = 0; i < 110; i += 1) {
          const angle = (i / 110) * TAU + randomRange(srng, -0.08, 0.08);
          const dist = radius * randomRange(srng, 0.5, 1.05);
          ctx.globalAlpha = randomRange(srng, 0.22, 0.72);
          ctx.fillStyle = pickFrom(srng, colors);
          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(angle) * dist,
            cy + Math.sin(angle) * dist * 0.94 + dist * 0.14,
            randomRange(srng, 0.9, 1.9),
            0,
            TAU,
          );
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function explode(rocket: Rocket) {
      const willow = rng() < 0.22;
      const desired = Math.round(randomRange(rng, 70, 138) * rocket.power);
      const room = MAX_SPARKS - sparks.length;
      if (room < 24) sparks.splice(0, 24 - room);
      const count = Math.min(desired, MAX_SPARKS - sparks.length);
      if (count <= 0) return;

      const baseSpeed = randomRange(rng, 2.1, 3.8) * rocket.power;
      const tightness = randomRange(rng, 0.55, 0.88);
      const gravity = willow
        ? randomRange(rng, 0.038, 0.05)
        : randomRange(rng, 0.02, 0.042);
      const drag = willow ? 0.99 : 0.985;
      let longest = 0;

      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * TAU + randomRange(rng, -0.14, 0.14);
        const speed =
          baseSpeed *
          randomRange(rng, tightness, tightness + (1 - tightness) * 1.6);
        const life = willow
          ? randomRange(rng, 88, 110)
          : randomRange(rng, 60, 104);
        if (life > longest) longest = life;
        sparks.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed + rocket.vx * 0.18,
          vy: Math.sin(angle) * speed + rocket.vy * 0.18,
          life,
          maxLife: life,
          size: randomRange(rng, 0.9, 1.9),
          color: pickFrom(rng, rocket.colors),
          gravity,
          drag,
          twinkle: rng() < 0.34,
          halo: rng() < 0.22,
        });
      }

      flashes.push({
        x: rocket.x,
        y: rocket.y,
        life: 10,
        maxLife: 10,
        radius: 34 * rocket.power + baseSpeed * 6,
        color: rocket.colors[0],
      });
      bursts.push(longest);
    }

    function launch(targetX: number, targetY: number, power: number) {
      const startY = height + 6;
      const speed = randomRange(rng, 7.2, 9.4);
      const fuse = Math.max(16, (startY - targetY) / speed);
      const startX = Math.min(
        Math.max(targetX + randomRange(rng, -1.5, 1.5) * fuse, 12),
        Math.max(width - 12, 12),
      );
      const gravity = 0.16;
      rockets.push({
        x: startX,
        y: startY,
        vx: (targetX - startX) / fuse,
        vy: (targetY - startY - 0.5 * gravity * fuse * fuse) / fuse,
        gravity,
        age: 0,
        fuse,
        colors: familyFor(rng),
        power,
      });
    }

    function step(dt: number) {
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        bursts[i] -= dt;
        if (bursts[i] <= 0) bursts.splice(i, 1);
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.age += dt;
        r.vy += r.gravity * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;

        if (r.age >= r.fuse || r.y <= 4) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const p = sparks[i];
        const d = Math.pow(p.drag, dt);
        p.vx *= d;
        p.vy = p.vy * d + p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0 || p.y > height + 40) sparks.splice(i, 1);
      }

      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        flashes[i].life -= dt;
        if (flashes[i].life <= 0) flashes.splice(i, 1);
      }
    }

    function render() {
      const light = isLightTheme();
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";

      for (const f of flashes) {
        const t = f.life / f.maxLife;
        const radius = f.radius * (1.25 - t * 0.5);
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
        glow.addColorStop(0, hexAlpha(f.color, (light ? 0.2 : 0.34) * t));
        glow.addColorStop(0.5, hexAlpha(f.color, 0.1 * t));
        glow.addColorStop(1, hexAlpha(f.color, 0));
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(f.x - radius, f.y - radius, radius * 2, radius * 2);
      }

      ctx.lineCap = "round";
      for (const p of sparks) {
        const t = p.life / p.maxLife;
        let alpha = t > 0.4 ? 1 : t / 0.4;
        if (p.twinkle && t < 0.34) alpha *= randomRange(rng, 0.25, 1);
        ctx.globalAlpha = alpha;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.6) {
          const stretch = Math.min(3.2, 1.2 + speed * 0.5);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * stretch, p.y - p.vy * stretch);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
        }
        if (p.halo && alpha > 0.5) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.2, 0, TAU);
          ctx.fill();
        }
      }

      for (const r of rockets) {
        const glow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 10);
        glow.addColorStop(0, light ? "rgba(138, 79, 19, 0.45)" : "rgba(255, 233, 189, 0.5)");
        glow.addColorStop(1, light ? "rgba(138, 79, 19, 0)" : "rgba(255, 233, 189, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(r.x - 10, r.y - 10, 20, 20);
        ctx.fillStyle = light ? "#6e3d0c" : "#fff3d6";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.5, 0, TAU);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(Math.max((now - last) / FRAME, 0.25), 2.5);
      last = now;

      if (now >= nextLaunch) {
        if (rockets.length + bursts.length < MAX_BURSTS) {
          launch(
            randomRange(rng, 0.14, 0.86) * width,
            randomRange(rng, 0.14, 0.44) * height,
            1,
          );
          nextLaunch = now + randomRange(rng, 3200, 6400);
        } else {
          nextLaunch = now + 600;
        }
      }

      step(dt);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      if (sparks.length === 0 && rockets.length === 0 && flashes.length === 0) {
        return;
      }
      render();
    }

    function pause() {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function sync() {
      if (visible && !document.hidden) {
        if (raf === 0) {
          last = performance.now();
          nextLaunch = last + 900;
          raf = requestAnimationFrame(frame);
        }
      } else {
        pause();
      }
    }

    const sizeObserver = new ResizeObserver(() => {
      measure();
      if (reduced) drawStatic();
    });
    sizeObserver.observe(canvas);
    measure();

    const themeObserver = new MutationObserver(() => {
      if (reduced) drawStatic();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (reduced) {
      drawStatic();
      return () => {
        sizeObserver.disconnect();
        themeObserver.disconnect();
      };
    }

    const viewObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    viewObserver.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      if (rockets.length + bursts.length >= MAX_BURSTS + 2) return;
      const rect = canvas.getBoundingClientRect();
      launch(
        Math.min(Math.max(event.clientX - rect.left, 16), width - 16),
        Math.min(Math.max(event.clientY - rect.top, 24), height * 0.72),
        1.16,
      );
    };
    if (interactive) canvas.addEventListener("pointerdown", onPointerDown);

    sync();

    return () => {
      pause();
      sizeObserver.disconnect();
      themeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, [reduced, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={[
        "block h-full w-full",
        interactive ? "pointer-events-auto" : "pointer-events-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
