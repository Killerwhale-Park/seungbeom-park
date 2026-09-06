"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyBibtexButtonProps = {
  bibtex: string;
  className?: string;
};

export function CopyBibtexButton({ bibtex, className }: CopyBibtexButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy BibTeX:", bibtex);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-[2px] border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
        copied
          ? "border-mint-300/40 text-mint-300"
          : "text-moon-400 hover:border-ember-500/40 hover:text-ember-300"
      } ${className ?? ""}`}
    >
      {copied ? (
        <Check size={13} strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Copy size={13} strokeWidth={1.5} aria-hidden="true" />
      )}
      {copied ? "Copied" : "BibTeX"}
    </button>
  );
}
