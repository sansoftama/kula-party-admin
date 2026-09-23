/**
 * Contracts for kula-party-backend (Ktor) admin routes.
 * This repository does not implement these endpoints.
 *
 * GET /v1/admin/health
 * GET /v1/admin/users?limit=&cursor=
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
