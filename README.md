# Kula Party Admin

Ops admin web UI for [Kula Party](https://github.com/sansoftama/kula-party-admin), a Hago-like voice party. This app is separate from the consumer Android app.

It talks only to the existing Ktor service in [kula-party-backend](https://github.com/sansoftama/kula-party-backend) under `/v1/admin/...`. Admin routes, auth, and roles live on that backend. This repository does not run an API server.

Package manager: npm.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The example env turns mock mode on, so both pages render without Ktor.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment

Copy `.env.example` to `.env.local`. Do not commit real tokens.

| Variable | Where it is read | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ADMIN_API_BASE_URL` | Server, request time | Ktor origin. Default `http://localhost:8080`. No path suffix. |
| `ADMIN_API_TOKEN` | Server only | Sent as `Authorization: Bearer <token>`. Required when mock mode is off. |
| `USE_MOCK_ADMIN_API` | Server, request time | `true` returns typed fixtures and does not call Ktor. Anything else calls the backend. |

There is no login screen in this version. The header shows a placeholder, “Signed in as Admin”. Real admin auth stays on Ktor.

## Pages

| Path | Backend |
| --- | --- |
| `/` and `/health` | `GET /v1/admin/health` |
| `/users` | `GET /v1/admin/users?limit=&cursor=` |

The sidebar also lists Moderation, Payments, Leaderboards, Rooms / Flags, and Support. Those items are inactive.

Users is read-only. The search box filters the page already loaded. It does not send a search query, and there are no ban or suspend actions.

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
```

With `USE_MOCK_ADMIN_API=true`, responses match those shapes. Mock user cursors are numeric offsets (`0`, `8`, …) so `?limit=3` pages through the fixture list.

## Out of scope

- Consumer Android code
- A second API (no Node/Express/Fastify server in this repo)
- Retool or other hosted admin builders
- Login, roles, bans, payments, moderation, or room controls
