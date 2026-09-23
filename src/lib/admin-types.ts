/**
 * Contracts for kula-party-backend (Ktor) admin routes.
 * This repository does not implement these endpoints.
 *
 * GET /v1/admin/health
 * GET /v1/admin/users?limit=&cursor=
 * GET /v1/admin/reports?limit=&cursor=&status=
 * GET /v1/admin/payments?limit=&cursor=&status=
 * GET /v1/admin/leaderboards?limit=&cursor=&board=
 * GET /v1/admin/rooms?limit=&cursor=&status=
 */

export type CheckStatus = "up" | "down";

export type AdminHealth = {
  ok: boolean;
  service: string;
  version?: string;
  time: string;
  checks?: Record<string, CheckStatus>;
};

export type UserStatus = "active" | "banned" | "suspended";

export type AdminUser = {
  id: string;
  username: string;
  displayName?: string;
  status: UserStatus;
  createdAt: string;
};

export type AdminUsersPage = {
  items: AdminUser[];
  nextCursor?: string | null;
};

export type ReportTargetType = "user" | "room";

export type ReportStatus = "open" | "resolved" | "dismissed";

export type AdminReport = {
  id: string;
  reporterId: string;
  reporterUsername?: string;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
};

export type AdminReportsPage = {
  items: AdminReport[];
  nextCursor?: string | null;
};

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type AdminPayment = {
  id: string;
  userId: string;
  username?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider?: string;
  providerPaymentId?: string;
  createdAt: string;
  refundedAt?: string | null;
};

export type AdminPaymentsPage = {
  items: AdminPayment[];
  nextCursor?: string | null;
};

export type LeaderboardBoard = "daily" | "weekly" | "all_time";

export type AdminLeaderboardEntry = {
  id: string;
  board: LeaderboardBoard;
  rank: number;
  userId: string;
  username?: string;
  score: number;
  updatedAt: string;
};

export type AdminLeaderboardsPage = {
  items: AdminLeaderboardEntry[];
  nextCursor?: string | null;
};

export type RoomStatus = "live" | "idle" | "closed";

export type AdminRoom = {
  id: string;
  name: string;
  hostId: string;
  hostUsername?: string;
  status: RoomStatus;
  participantCount: number;
  flags: string[];
  createdAt: string;
};

export type AdminRoomsPage = {
  items: AdminRoom[];
  nextCursor?: string | null;
};

export type AdminApiResult<T> =
  | {
      ok: true;
      data: T;
      mock: boolean;
      baseUrl: string;
    }
  | {
      ok: false;
      message: string;
      status?: number;
      mock: boolean;
      baseUrl: string;
    };
