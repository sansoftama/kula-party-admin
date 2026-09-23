# Kula Party Admin

Ops admin web UI for [Kula Party](https://github.com/sansoftama/kula-party-admin), a Hago-like voice party. This app is separate from the consumer Android app.

It talks only to the existing Ktor service in [kula-party-backend](https://github.com/sansoftama/kula-party-backend) under `/v1/admin/...`. Admin routes, auth, and roles live on that backend. This repository does not run an API server.

Package manager: npm.

## Run

Start the Ktor service from [kula-party-backend](https://github.com/sansoftama/kula-party-backend) on `http://localhost:8080` with `ADMIN_API_TOKEN=dev-admin-token`. This UI calls `GET /v1/admin/health`, `GET /v1/admin/users`, and `GET /v1/admin/reports` with `Authorization: Bearer dev-admin-token`.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `.env.example` points at those stubs (`NEXT_PUBLIC_ADMIN_API_BASE_URL=http://localhost:8080`, `ADMIN_API_TOKEN=dev-admin-token`, `USE_MOCK_ADMIN_API=false`). `dev-admin-token` is a non-prod stub only. Do not commit `.env.local` or production secrets.

For UI-only work without the backend, set `USE_MOCK_ADMIN_API=true` in `.env.local`. Mock mode serves typed fixtures and does not call Ktor.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment

Copy `.env.example` to `.env.local`. Do not commit `.env.local` or production tokens. The example `ADMIN_API_TOKEN` is the non-prod stub `dev-admin-token`.

| Variable | Where it is read | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ADMIN_API_BASE_URL` | Server, request time | Ktor origin. Example and unset default: `http://localhost:8080`. No path suffix. |
| `ADMIN_API_TOKEN` | Server only | Sent as `Authorization: Bearer <token>`. Required when mock mode is off. Local stub: `dev-admin-token`. |
| `USE_MOCK_ADMIN_API` | Server, request time | Example default `false` calls Ktor. `true` returns typed fixtures and does not call the backend. |

There is no login screen in this version. The header shows a placeholder, “Signed in as Admin”. Real admin auth stays on Ktor.

## Pages

| Path | Backend |
| --- | --- |
| `/` and `/health` | `GET /v1/admin/health` |
| `/users` | `GET /v1/admin/users?limit=&cursor=` |
| `/moderation` | `GET /v1/admin/reports?limit=&cursor=&status=` |

The sidebar also lists Payments, Leaderboards, Rooms / Flags, and Support. Those items are inactive.

Users is read-only. The search box filters the page already loaded. It does not send a search query, and there are no ban or suspend actions.

Moderation calls `GET /v1/admin/reports`. It is read-only. Status chips send `status` as `open`, `resolved`, or `dismissed` (omit the param for all statuses). The default `limit` is 20. The search box filters the page already loaded by reporter, target, and reason. It does not send a search query, and there are no resolve, dismiss, or ban actions.

## Contracts

Implemented by kula-party-backend. The typed client is `src/lib/admin-api.ts`. Shared types are `src/lib/admin-types.ts`.

```ts
// GET /v1/admin/health
{
  ok: boolean;
  service: string;
  version?: string;
  time: string;
  checks?: Record<string, "up" | "down">;
}

// GET /v1/admin/users?limit=50&cursor=...
{
  items: Array<{
    id: string;
    username: string;
    displayName?: string;
    status: "active" | "banned" | "suspended";
    createdAt: string;
  }>;
  nextCursor?: string | null;
}

// GET /v1/admin/reports?limit=20&cursor=...&status=open
{
  items: Array<{
    id: string;
    reporterId: string;
    reporterUsername?: string;
    targetType: "user" | "room";
    targetId: string;
    targetLabel?: string;
    reason: string;
    status: "open" | "resolved" | "dismissed";
    createdAt: string;
  }>;
  nextCursor?: string | null;
}
```

With `USE_MOCK_ADMIN_API=true`, responses match those shapes. Mock user and report cursors are numeric offsets (`0`, `8`, …) so `?limit=3` pages through the fixture list. Report fixtures are filtered by `status` before that offset is applied.

## Out of scope

- Consumer Android code
- A second API (no Node/Express/Fastify server in this repo)
- Retool or other hosted admin builders
- Login, roles, bans, payments, report actions, or room controls
