import type { AdminHealth, AdminUser, AdminUsersPage } from "@/lib/admin-types";

const MOCK_USERS: AdminUser[] = [
  {
    id: "usr_01HZXK8A",
    username: "amara",
    displayName: "Amara K.",
    status: "active",
    createdAt: "2026-01-12T08:14:00.000Z",
  },
  {
    id: "usr_01HZY2M1",
    username: "leo.waves",
    displayName: "Leo",
    status: "active",
    createdAt: "2026-02-03T16:41:00.000Z",
  },
  {
    id: "usr_01J0AAN4",
    username: "nabila",
    displayName: "Nabila S.",
    status: "suspended",
    createdAt: "2026-03-18T11:02:00.000Z",
  },
  {
    id: "usr_01J0BBP8",
    username: "dj_kito",
    displayName: "Kito",
    status: "active",
    createdAt: "2026-04-02T21:19:00.000Z",
  },
  {
    id: "usr_01J1CCQ2",
    username: "mira.room",
    displayName: "Mira",
    status: "banned",
    createdAt: "2026-04-21T09:55:00.000Z",
  },
  {
    id: "usr_01J2DDR6",
    username: "sami",
    status: "active",
    createdAt: "2026-05-09T14:27:00.000Z",
  },
  {
    id: "usr_01J3EES0",
    username: "host.ada",
    displayName: "Ada N.",
    status: "active",
    createdAt: "2026-06-01T18:08:00.000Z",
  },
  {
    id: "usr_01J4FFT4",
    username: "ghostline",
    displayName: "Ghost",
    status: "suspended",
    createdAt: "2026-07-14T07:33:00.000Z",
  },
];

export function mockHealth(): AdminHealth {
  return {
    ok: true,
    service: "kula-party-backend",
    version: "0.0.0-mock",
    time: new Date().toISOString(),
    checks: {
      api: "up",
      database: "up",
    },
  };
}

export function mockUsers(limit: number, cursor?: string): AdminUsersPage {
  const start = cursor === undefined ? 0 : Number(cursor);
  if (!Number.isInteger(start) || start < 0 || start > MOCK_USERS.length) {
    return { items: [], nextCursor: null };
  }

  const items = MOCK_USERS.slice(start, start + limit);
  const nextIndex = start + limit;
  return {
    items,
    nextCursor: nextIndex < MOCK_USERS.length ? String(nextIndex) : null,
  };
}
