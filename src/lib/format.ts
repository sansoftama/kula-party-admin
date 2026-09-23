import type {
  LeaderboardBoard,
  PaymentStatus,
  ReportStatus,
  RoomStatus,
} from "@/lib/admin-types";

const REPORT_STATUSES = new Set<ReportStatus>(["open", "resolved", "dismissed"]);
const PAYMENT_STATUSES = new Set<PaymentStatus>([
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);
const LEADERBOARD_BOARDS = new Set<LeaderboardBoard>([
  "daily",
  "weekly",
  "all_time",
]);
const ROOM_STATUSES = new Set<RoomStatus>(["live", "idle", "closed"]);

// IDR amounts are whole rupiah. Other currencies are minor units (cents).
const ZERO_DECIMAL_CURRENCIES = new Set(["IDR", "JPY", "KRW", "VND", "CLP"]);

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

export function parsePaymentStatus(
  raw: string | string[] | undefined,
): PaymentStatus | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  if (trimmed && PAYMENT_STATUSES.has(trimmed as PaymentStatus)) {
    return trimmed as PaymentStatus;
  }
  return undefined;
}

export function parseLeaderboardBoard(
  raw: string | string[] | undefined,
): LeaderboardBoard | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  if (trimmed && LEADERBOARD_BOARDS.has(trimmed as LeaderboardBoard)) {
    return trimmed as LeaderboardBoard;
  }
  return undefined;
}

export function parseRoomStatus(
  raw: string | string[] | undefined,
): RoomStatus | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  if (trimmed && ROOM_STATUSES.has(trimmed as RoomStatus)) {
    return trimmed as RoomStatus;
  }
  return undefined;
}

export function formatMoney(amount: number, currency: string): string {
  const code = currency.trim().toUpperCase();
  if (!Number.isFinite(amount) || !/^[A-Z]{3}$/.test(code)) {
    return `${amount} ${currency}`.trim();
  }

  const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code);
  const major = zeroDecimal ? amount : amount / 100;

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      currencyDisplay: "code",
      minimumFractionDigits: zeroDecimal ? 0 : 2,
      maximumFractionDigits: zeroDecimal ? 0 : 2,
    }).format(major);
  } catch {
    return `${amount} ${code}`;
  }
}

export function shortId(id: string): string {
  if (id.length <= 16) {
    return id;
  }
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
