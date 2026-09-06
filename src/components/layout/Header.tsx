"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/publications", label: "Publications" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`print-hidden fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-night-950/80 backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="font-display text-[15px] font-semibold whitespace-nowrap tracking-[-0.015em] text-moon-50 transition-colors hover:text-ember-200 sm:text-lg"
        >
          Seungbeom Park
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-3.5 sm:gap-7">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative font-mono text-[10px] uppercase tracking-widest transition-colors sm:text-[12px] ${
                  active ? "text-ember-300" : "text-moon-400 hover:text-moon-50"
                }`}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 h-px w-full bg-ember-400"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
