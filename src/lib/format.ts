import type { ReportStatus } from "@/lib/admin-types";

const REPORT_STATUSES = new Set<ReportStatus>(["open", "resolved", "dismissed"]);

export function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date)} UTC`;
}

export function parseLimit(
  raw: string | string[] | undefined,
  fallback = 50,
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, 100);
}

export function parseCursor(
  raw: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseReportStatus(
  raw: string | string[] | undefined,
): ReportStatus | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  if (trimmed && REPORT_STATUSES.has(trimmed as ReportStatus)) {
    return trimmed as ReportStatus;
  }
  return undefined;
}
