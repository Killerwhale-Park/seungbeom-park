import type { Period } from "@/lib/types";

export function formatDate(value: string): string {
  return value.split("-").join(".");
}

export function formatPeriod(period: Period): string {
  const start = formatDate(period.start);

  if (period.end) return `${start} - ${formatDate(period.end)}`;
  if (period.expected) return `${start} - ${formatDate(period.expected)} (expected)`;

  return `${start} - Present`;
}
