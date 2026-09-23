import "server-only";

import { connection } from "next/server";

import type {
  AdminApiResult,
  AdminHealth,
  AdminLeaderboardsPage,
  AdminPaymentsPage,
  AdminReportsPage,
  AdminRoomsPage,
  AdminSupportTicketsPage,
  AdminUsersPage,
  CheckStatus,
  LeaderboardBoard,
  PaymentStatus,
  ReportStatus,
  ReportTargetType,
  RoomStatus,
  SupportTicketPriority,
  SupportTicketStatus,
  UserStatus,
} from "@/lib/admin-types";
import {
  mockHealth,
  mockLeaderboards,
  mockPayments,
  mockReports,
  mockRooms,
  mockSupportTickets,
  mockUsers,
} from "@/lib/mock-admin";

const DEFAULT_BASE_URL = "http://localhost:8080";
const USER_STATUSES = new Set<UserStatus>(["active", "banned", "suspended"]);
const CHECK_STATUSES = new Set<CheckStatus>(["up", "down"]);
const REPORT_STATUSES = new Set<ReportStatus>(["open", "resolved", "dismissed"]);
const REPORT_TARGET_TYPES = new Set<ReportTargetType>(["user", "room"]);
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
const SUPPORT_TICKET_STATUSES = new Set<SupportTicketStatus>([
  "open",
  "pending",
  "resolved",
  "closed",
]);
const SUPPORT_TICKET_PRIORITIES = new Set<SupportTicketPriority>([
  "low",
  "normal",
  "high",
]);

class AdminApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

function readEnv(name: string): string | undefined {
  // Dynamic lookup keeps NEXT_PUBLIC_* request-time on the server.
  // Next inlines direct `process.env.NEXT_PUBLIC_*` access at build time.
  const value = process.env[name];
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function isMockAdminApi(): boolean {
  return readEnv("USE_MOCK_ADMIN_API") === "true";
}

export function adminApiBaseUrl(): string {
  const raw = readEnv("NEXT_PUBLIC_ADMIN_API_BASE_URL") ?? DEFAULT_BASE_URL;
  const trimmed = raw.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AdminApiError(
      `NEXT_PUBLIC_ADMIN_API_BASE_URL is not a valid URL (${trimmed}).`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AdminApiError(
      "NEXT_PUBLIC_ADMIN_API_BASE_URL must use http or https.",
    );
  }
  return trimmed;
}

function failure<T>(
  error: unknown,
  mock: boolean,
  baseUrl: string,
): AdminApiResult<T> {
  if (error instanceof AdminApiError) {
    return { ok: false, message: error.message, status: error.status, mock, baseUrl };
  }
  if (error instanceof Error) {
    return { ok: false, message: error.message, mock, baseUrl };
  }
  return { ok: false, message: "Unknown admin API error.", mock, baseUrl };
}

function networkMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return "The admin API did not respond in time.";
    }
    if (error.message === "fetch failed") {
      const cause = error.cause;
      const detail = cause instanceof Error ? cause.message : "";
      return detail
        ? `Could not reach the admin API (${detail}).`
        : "Could not reach the admin API.";
    }
    return error.message;
  }
  return "Could not reach the admin API.";
}

async function requestJson<T>(
  baseUrl: string,
  path: string,
  parse: (value: unknown) => T,
  query?: URLSearchParams,
): Promise<T> {
  const token = readEnv("ADMIN_API_TOKEN");
  if (!token) {
    throw new AdminApiError(
      "ADMIN_API_TOKEN is not set. This app will not call Ktor without a bearer token.",
    );
  }

  const url =
    query && [...query.keys()].length > 0
      ? `${baseUrl}${path}?${query.toString()}`
      : `${baseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new AdminApiError(networkMessage(error));
  }

  if (!response.ok) {
    throw new AdminApiError(
      `GET ${path} returned HTTP ${response.status}.`,
      response.status,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AdminApiError(
      `GET ${path} returned a body that was not JSON.`,
      response.status,
    );
  }

  try {
    return parse(body);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "invalid payload";
    throw new AdminApiError(
      `GET ${path} returned an unexpected payload: ${detail}.`,
      response.status,
    );
  }
}

function expectObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} was not an object`);
  }
  return value as Record<string, unknown>;
}

function parseHealth(value: unknown): AdminHealth {
  const record = expectObject(value, "Health response");
  if (typeof record.ok !== "boolean") {
    throw new Error("ok must be a boolean");
  }
  if (typeof record.service !== "string" || record.service.length === 0) {
    throw new Error("service must be a string");
  }
  if (typeof record.time !== "string" || record.time.length === 0) {
    throw new Error("time must be a string");
  }
  if (record.version !== undefined && typeof record.version !== "string") {
    throw new Error("version must be a string");
  }

  let checks: AdminHealth["checks"];
  if (record.checks !== undefined) {
    const rawChecks = expectObject(record.checks, "checks");
    checks = {};
    for (const [name, status] of Object.entries(rawChecks)) {
      if (typeof status !== "string" || !CHECK_STATUSES.has(status as CheckStatus)) {
        throw new Error(`check ${name} must be up or down`);
      }
      checks[name] = status as CheckStatus;
    }
  }

  return {
    ok: record.ok,
    service: record.service,
    version: record.version,
    time: record.time,
    checks,
  };
}

function parseUsers(value: unknown): AdminUsersPage {
  const record = expectObject(value, "Users response");
  if (!Array.isArray(record.items)) {
    throw new Error("items must be an array");
  }

  const items = record.items.map((item, index) => {
    const user = expectObject(item, `items[${index}]`);
    if (typeof user.id !== "string" || user.id.length === 0) {
      throw new Error(`items[${index}].id must be a string`);
    }
    if (typeof user.username !== "string" || user.username.length === 0) {
      throw new Error(`items[${index}].username must be a string`);
    }
    if (typeof user.createdAt !== "string" || user.createdAt.length === 0) {
      throw new Error(`items[${index}].createdAt must be a string`);
    }
    if (typeof user.status !== "string" || !USER_STATUSES.has(user.status as UserStatus)) {
      throw new Error(`items[${index}].status must be active, banned, or suspended`);
    }
    if (user.displayName !== undefined && typeof user.displayName !== "string") {
      throw new Error(`items[${index}].displayName must be a string`);
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      status: user.status as UserStatus,
      createdAt: user.createdAt,
    };
  });

  if (
    record.nextCursor !== undefined &&
    record.nextCursor !== null &&
    typeof record.nextCursor !== "string"
  ) {
    throw new Error("nextCursor must be a string or null");
  }

  return {
    items,
    nextCursor: record.nextCursor ?? null,
  };
}

function parseReports(value: unknown): AdminReportsPage {
  const record = expectObject(value, "Reports response");
  if (!Array.isArray(record.items)) {
    throw new Error("items must be an array");
  }

  const items = record.items.map((item, index) => {
    const report = expectObject(item, `items[${index}]`);
    if (typeof report.id !== "string" || report.id.length === 0) {
      throw new Error(`items[${index}].id must be a string`);
    }
    if (typeof report.reporterId !== "string" || report.reporterId.length === 0) {
      throw new Error(`items[${index}].reporterId must be a string`);
    }
    if (
      report.reporterUsername !== undefined &&
      typeof report.reporterUsername !== "string"
    ) {
      throw new Error(`items[${index}].reporterUsername must be a string`);
    }
    if (
      typeof report.targetType !== "string" ||
      !REPORT_TARGET_TYPES.has(report.targetType as ReportTargetType)
    ) {
      throw new Error(`items[${index}].targetType must be user or room`);
    }
    if (typeof report.targetId !== "string" || report.targetId.length === 0) {
      throw new Error(`items[${index}].targetId must be a string`);
    }
    if (report.targetLabel !== undefined && typeof report.targetLabel !== "string") {
      throw new Error(`items[${index}].targetLabel must be a string`);
    }
    if (typeof report.reason !== "string" || report.reason.length === 0) {
      throw new Error(`items[${index}].reason must be a string`);
    }
    if (
      typeof report.status !== "string" ||
      !REPORT_STATUSES.has(report.status as ReportStatus)
    ) {
      throw new Error(`items[${index}].status must be open, resolved, or dismissed`);
    }
    if (typeof report.createdAt !== "string" || report.createdAt.length === 0) {
      throw new Error(`items[${index}].createdAt must be a string`);
    }

    return {
      id: report.id,
      reporterId: report.reporterId,
      reporterUsername: report.reporterUsername,
      targetType: report.targetType as ReportTargetType,
      targetId: report.targetId,
      targetLabel: report.targetLabel,
      reason: report.reason,
      status: report.status as ReportStatus,
      createdAt: report.createdAt,
    };
  });

  if (
    record.nextCursor !== undefined &&
    record.nextCursor !== null &&
    typeof record.nextCursor !== "string"
  ) {
    throw new Error("nextCursor must be a string or null");
  }

  return {
    items,
    nextCursor: record.nextCursor ?? null,
  };
}

function parsePayments(value: unknown): AdminPaymentsPage {
  const record = expectObject(value, "Payments response");
  if (!Array.isArray(record.items)) {
    throw new Error("items must be an array");
  }

  const items = record.items.map((item, index) => {
    const payment = expectObject(item, `items[${index}]`);
    if (typeof payment.id !== "string" || payment.id.length === 0) {
      throw new Error(`items[${index}].id must be a string`);
    }
    if (typeof payment.userId !== "string" || payment.userId.length === 0) {
      throw new Error(`items[${index}].userId must be a string`);
    }
    if (payment.username !== undefined && typeof payment.username !== "string") {
      throw new Error(`items[${index}].username must be a string`);
    }
    if (typeof payment.amount !== "number" || !Number.isFinite(payment.amount)) {
      throw new Error(`items[${index}].amount must be a number`);
    }
    if (typeof payment.currency !== "string" || payment.currency.length === 0) {
      throw new Error(`items[${index}].currency must be a string`);
    }
    if (
      typeof payment.status !== "string" ||
      !PAYMENT_STATUSES.has(payment.status as PaymentStatus)
    ) {
      throw new Error(
        `items[${index}].status must be pending, succeeded, failed, or refunded`,
      );
    }
    if (payment.provider !== undefined && typeof payment.provider !== "string") {
      throw new Error(`items[${index}].provider must be a string`);
    }
    if (
      payment.providerPaymentId !== undefined &&
      typeof payment.providerPaymentId !== "string"
    ) {
      throw new Error(`items[${index}].providerPaymentId must be a string`);
    }
    if (typeof payment.createdAt !== "string" || payment.createdAt.length === 0) {
      throw new Error(`items[${index}].createdAt must be a string`);
    }
    if (
      payment.refundedAt !== undefined &&
      payment.refundedAt !== null &&
      typeof payment.refundedAt !== "string"
    ) {
      throw new Error(`items[${index}].refundedAt must be a string or null`);
    }

    return {
      id: payment.id,
      userId: payment.userId,
      username: payment.username,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status as PaymentStatus,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      createdAt: payment.createdAt,
      refundedAt: payment.refundedAt,
    };
  });

  if (
    record.nextCursor !== undefined &&
    record.nextCursor !== null &&
    typeof record.nextCursor !== "string"
  ) {
    throw new Error("nextCursor must be a string or null");
  }

  return {
    items,
    nextCursor: record.nextCursor ?? null,
  };
}

function parseLeaderboards(value: unknown): AdminLeaderboardsPage {
  const record = expectObject(value, "Leaderboards response");
  if (!Array.isArray(record.items)) {
    throw new Error("items must be an array");
  }

  const items = record.items.map((item, index) => {
    const entry = expectObject(item, `items[${index}]`);
    if (typeof entry.id !== "string" || entry.id.length === 0) {
      throw new Error(`items[${index}].id must be a string`);
    }
    if (
      typeof entry.board !== "string" ||
      !LEADERBOARD_BOARDS.has(entry.board as LeaderboardBoard)
    ) {
      throw new Error(`items[${index}].board must be daily, weekly, or all_time`);
    }
    if (typeof entry.rank !== "number" || !Number.isFinite(entry.rank)) {
      throw new Error(`items[${index}].rank must be a number`);
    }
    if (typeof entry.userId !== "string" || entry.userId.length === 0) {
      throw new Error(`items[${index}].userId must be a string`);
    }
    if (entry.username !== undefined && typeof entry.username !== "string") {
      throw new Error(`items[${index}].username must be a string`);
    }
    if (typeof entry.score !== "number" || !Number.isFinite(entry.score)) {
      throw new Error(`items[${index}].score must be a number`);
    }
    if (typeof entry.updatedAt !== "string" || entry.updatedAt.length === 0) {
      throw new Error(`items[${index}].updatedAt must be a string`);
    }

    return {
      id: entry.id,
      board: entry.board as LeaderboardBoard,
      rank: entry.rank,
      userId: entry.userId,
      username: entry.username,
      score: entry.score,
      updatedAt: entry.updatedAt,
    };
  });

  if (
    record.nextCursor !== undefined &&
    record.nextCursor !== null &&
    typeof record.nextCursor !== "string"
  ) {
    throw new Error("nextCursor must be a string or null");
  }

  return {
    items,
    nextCursor: record.nextCursor ?? null,
  };
}

function parseRooms(value: unknown): AdminRoomsPage {
  const record = expectObject(value, "Rooms response");
  if (!Array.isArray(record.items)) {
    throw new Error("items must be an array");
  }

  const items = record.items.map((item, index) => {
    const room = expectObject(item, `items[${index}]`);
    if (typeof room.id !== "string" || room.id.length === 0) {
      throw new Error(`items[${index}].id must be a string`);
    }
    if (typeof room.name !== "string" || room.name.length === 0) {
      throw new Error(`items[${index}].name must be a string`);
    }
    if (typeof room.hostId !== "string" || room.hostId.length === 0) {
      throw new Error(`items[${index}].hostId must be a string`);
    }
    if (room.hostUsername !== undefined && typeof room.hostUsername !== "string") {
      throw new Error(`items[${index}].hostUsername must be a string`);
    }
    if (
      typeof room.status !== "string" ||
      !ROOM_STATUSES.has(room.status as RoomStatus)
    ) {
      throw new Error(`items[${index}].status must be live, idle, or closed`);
    }
    if (
      typeof room.participantCount !== "number" ||
      !Number.isFinite(room.participantCount)
    ) {
      throw new Error(`items[${index}].participantCount must be a number`);
    }
    if (
      !Array.isArray(room.flags) ||
      room.flags.some((flag) => typeof flag !== "string" || flag.length === 0)
    ) {
      throw new Error(`items[${index}].flags must be an array of strings`);
    }
    if (typeof room.createdAt !== "string" || room.createdAt.length === 0) {
      throw new Error(`items[${index}].createdAt must be a string`);
    }

    return {
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      hostUsername: room.hostUsername,
      status: room.status as RoomStatus,
      participantCount: room.participantCount,
      flags: room.flags as string[],
      createdAt: room.createdAt,
    };
  });

  if (
    record.nextCursor !== undefined &&
    record.nextCursor !== null &&
    typeof record.nextCursor !== "string"
  ) {
    throw new Error("nextCursor must be a string or null");
  }

  return {
    items,
    nextCursor: record.nextCursor ?? null,
  };
}

function parseSupportTickets(value: unknown): AdminSupportTicketsPage {
  const record = expectObject(value, "Support tickets response");
  if (!Array.isArray(record.items)) {
    throw new Error("items must be an array");
  }

  const items = record.items.map((item, index) => {
    const ticket = expectObject(item, `items[${index}]`);
    if (typeof ticket.id !== "string" || ticket.id.length === 0) {
      throw new Error(`items[${index}].id must be a string`);
    }
    if (typeof ticket.userId !== "string" || ticket.userId.length === 0) {
      throw new Error(`items[${index}].userId must be a string`);
    }
    if (ticket.username !== undefined && typeof ticket.username !== "string") {
      throw new Error(`items[${index}].username must be a string`);
    }
    if (typeof ticket.subject !== "string" || ticket.subject.length === 0) {
      throw new Error(`items[${index}].subject must be a string`);
    }
    if (ticket.bodyPreview !== undefined && typeof ticket.bodyPreview !== "string") {
      throw new Error(`items[${index}].bodyPreview must be a string`);
    }
    if (
      typeof ticket.status !== "string" ||
      !SUPPORT_TICKET_STATUSES.has(ticket.status as SupportTicketStatus)
    ) {
      throw new Error(
        `items[${index}].status must be open, pending, resolved, or closed`,
      );
    }
    if (
      typeof ticket.priority !== "string" ||
      !SUPPORT_TICKET_PRIORITIES.has(ticket.priority as SupportTicketPriority)
    ) {
      throw new Error(`items[${index}].priority must be low, normal, or high`);
    }
    if (typeof ticket.createdAt !== "string" || ticket.createdAt.length === 0) {
      throw new Error(`items[${index}].createdAt must be a string`);
    }
    if (
      ticket.updatedAt !== undefined &&
      ticket.updatedAt !== null &&
      typeof ticket.updatedAt !== "string"
    ) {
      throw new Error(`items[${index}].updatedAt must be a string or null`);
    }

    return {
      id: ticket.id,
      userId: ticket.userId,
      username: ticket.username,
      subject: ticket.subject,
      bodyPreview: ticket.bodyPreview,
      status: ticket.status as SupportTicketStatus,
      priority: ticket.priority as SupportTicketPriority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  });

  if (
    record.nextCursor !== undefined &&
    record.nextCursor !== null &&
    typeof record.nextCursor !== "string"
  ) {
    throw new Error("nextCursor must be a string or null");
  }

  return {
    items,
    nextCursor: record.nextCursor ?? null,
  };
}

export async function getAdminHealth(): Promise<AdminApiResult<AdminHealth>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return { ok: true, data: mockHealth(), mock, baseUrl };
    }
    const data = await requestJson(baseUrl, "/v1/admin/health", parseHealth);
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}

export async function getAdminUsers(input: {
  limit: number;
  cursor?: string;
}): Promise<AdminApiResult<AdminUsersPage>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return {
        ok: true,
        data: mockUsers(input.limit, input.cursor),
        mock,
        baseUrl,
      };
    }
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) {
      query.set("cursor", input.cursor);
    }
    const data = await requestJson(baseUrl, "/v1/admin/users", parseUsers, query);
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}

export async function getAdminReports(input: {
  limit: number;
  cursor?: string;
  status?: ReportStatus;
}): Promise<AdminApiResult<AdminReportsPage>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return {
        ok: true,
        data: mockReports(input.limit, input.cursor, input.status),
        mock,
        baseUrl,
      };
    }
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) {
      query.set("cursor", input.cursor);
    }
    if (input.status) {
      query.set("status", input.status);
    }
    const data = await requestJson(baseUrl, "/v1/admin/reports", parseReports, query);
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}

export async function getAdminPayments(input: {
  limit: number;
  cursor?: string;
  status?: PaymentStatus;
}): Promise<AdminApiResult<AdminPaymentsPage>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return {
        ok: true,
        data: mockPayments(input.limit, input.cursor, input.status),
        mock,
        baseUrl,
      };
    }
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) {
      query.set("cursor", input.cursor);
    }
    if (input.status) {
      query.set("status", input.status);
    }
    const data = await requestJson(baseUrl, "/v1/admin/payments", parsePayments, query);
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}

export async function getAdminLeaderboards(input: {
  limit: number;
  cursor?: string;
  board?: LeaderboardBoard;
}): Promise<AdminApiResult<AdminLeaderboardsPage>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return {
        ok: true,
        data: mockLeaderboards(input.limit, input.cursor, input.board),
        mock,
        baseUrl,
      };
    }
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) {
      query.set("cursor", input.cursor);
    }
    if (input.board) {
      query.set("board", input.board);
    }
    const data = await requestJson(
      baseUrl,
      "/v1/admin/leaderboards",
      parseLeaderboards,
      query,
    );
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}

export async function getAdminRooms(input: {
  limit: number;
  cursor?: string;
  status?: RoomStatus;
}): Promise<AdminApiResult<AdminRoomsPage>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return {
        ok: true,
        data: mockRooms(input.limit, input.cursor, input.status),
        mock,
        baseUrl,
      };
    }
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) {
      query.set("cursor", input.cursor);
    }
    if (input.status) {
      query.set("status", input.status);
    }
    const data = await requestJson(baseUrl, "/v1/admin/rooms", parseRooms, query);
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}

export async function getAdminSupportTickets(input: {
  limit: number;
  cursor?: string;
  status?: SupportTicketStatus;
}): Promise<AdminApiResult<AdminSupportTicketsPage>> {
  await connection();
  const mock = isMockAdminApi();
  let baseUrl = DEFAULT_BASE_URL;
  try {
    baseUrl = adminApiBaseUrl();
    if (mock) {
      return {
        ok: true,
        data: mockSupportTickets(input.limit, input.cursor, input.status),
        mock,
        baseUrl,
      };
    }
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) {
      query.set("cursor", input.cursor);
    }
    if (input.status) {
      query.set("status", input.status);
    }
    const data = await requestJson(
      baseUrl,
      "/v1/admin/support/tickets",
      parseSupportTickets,
      query,
    );
    return { ok: true, data, mock, baseUrl };
  } catch (error) {
    return failure(error, mock, baseUrl);
  }
}
