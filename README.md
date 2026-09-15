# tulocal

Bun + Turborepo monorepo.

- `apps/web` — Next.js frontend (port 3001)
- `apps/server` — Hono API with tRPC and Better Auth (port 3000)
- `packages/api` — tRPC routers and procedures
- `packages/auth` — Better Auth configuration
- `packages/db` — Drizzle schema and Neon Postgres client
- `packages/ui` — Shared shadcn/ui primitives and global styles
- `packages/config` — Shared tsconfig

## Getting started

```bash
bun install
```

Copy `apps/server/.env.example` to `apps/server/.env` and `apps/web/.env.example` to `apps/web/.env`, fill them in, then push the schema and start dev:

```bash
bun run db:push
bun run dev
```

Web: http://localhost:3001 · API: http://localhost:3000

## Environment

Plain `.env` files, loaded natively by Bun (server) and Next.js (web). The server reads `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, plus `OPENROUTER_API_KEY` (OpenRouter, for the vision, image and negotiation models), `TAVILY_API_KEY` (price research) and `BLOB_READ_WRITE_TOKEN` (Vercel Blob for product images). The web app reads `NEXT_PUBLIC_SERVER_URL` and optionally `NEXT_PUBLIC_APP_URL` (share links and QR codes). Drizzle Kit scripts load `apps/server/.env`.

## Scripts

| Script                                                         | Description                        |
| -------------------------------------------------------------- | ---------------------------------- |
| `bun run dev`                                                  | Start web and server               |
| `bun run dev:web` / `dev:server`                               | Start one app                      |
| `bun run build`                                                | Build all apps                     |
| `bun run check-types`                                          | Typecheck all workspaces           |
| `bun run check`                                                | Oxlint + Oxfmt                     |
| `bun run db:push` / `db:generate` / `db:migrate` / `db:studio` | Drizzle Kit                        |
| `bun run deploy` / `deploy:prod`                               | Vercel preview / production deploy |
| `bun run env:preview` / `env:production`                       | Sync local `.env` files to Vercel  |

## UI

Add shared primitives from the repo root:

```bash
npx shadcn@latest add dialog -c packages/ui
```

```tsx
import { Button } from "@tulocal/ui/components/button";
```

## Deployment

Vercel Services (`vercel.json`) deploy `web` and `server` together. Requests under `/api/*` are routed to the server. Link with `bun run deploy:setup`, sync env vars, then `bun run deploy`.
