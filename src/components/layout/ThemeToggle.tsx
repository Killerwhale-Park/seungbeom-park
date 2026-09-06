"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "light";
}

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = () => {
    const next = !light;
    if (next) {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      if (next) {
        localStorage.theme = "light";
      } else {
        localStorage.removeItem("theme");
      }
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to night theme" : "Switch to day theme"}
      className="flex size-7 cursor-pointer items-center justify-center rounded-[2px] border border-white/10 text-moon-400 transition-colors hover:border-ember-500/40 hover:text-ember-300 sm:size-8"
    >
      {light ? (
        <Moon size={14} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Sun size={14} strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
