"use client";

import { Download } from "lucide-react";

type PdfButtonProps = {
  className?: string;
};

export function PdfButton({ className }: PdfButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`print-hidden inline-flex items-center gap-2 rounded-[2px] border border-white/15 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-moon-200 transition-colors hover:border-ember-500/50 hover:text-ember-200 ${className ?? ""}`}
    >
      <Download size={16} strokeWidth={1.5} aria-hidden="true" />
      Export PDF
    </button>
  );
}
