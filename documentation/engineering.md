# Engineering

Repo-wide architecture and stack conventions. They apply to every app and package regardless of feature. Code-level rules (naming, comments, imports, types) live in [code.md](./code.md); commands and git rules live in [workflow.md](./workflow.md).

## Current state of the repo

The repo was reset on 2026-09-15 to rebuild the MVP from a clean base. What exists today:

- `apps/core`: the Next.js app, freshly scaffolded.
- `packages/configuration`: the shared `tsconfig.base.json` every workspace extends.
- `packages/environment`: t3-env schemas for every environment variable, see below.
- `packages/database`: Drizzle client on the Neon HTTP driver, schema, migrations, see below.
- `packages/database`: Drizzle client over Neon plus the schema, starting with the Better Auth tables.
- `packages/authentication`: Better Auth server instance, session helpers, request handlers, and the React client.
- `tools/oxlint/anti-slop`: a vendored Oxlint plugin with the anti-slop rules described in [code.md](./code.md).
- Root tooling: Bun, Turborepo, Oxlint, Oxfmt, Lefthook, commitlint.

Everything under "Target layout" below is the plan. Create packages only when a feature needs them, in the shape described here.

## Stack

Bun-managed, Turborepo-orchestrated monorepo.

| layer                     | choice                                                       |
| ------------------------- | ------------------------------------------------------------ |
| runtime / package manager | Bun                                                          |
| monorepo                  | Turborepo, bun workspaces                                    |
| frontend                  | Next.js (App Router)                                         |
| backend                   | Hono                                                         |
| api                       | tRPC                                                         |
| database                  | PostgreSQL (Neon), Drizzle ORM                               |
| auth                      | Better Auth 1.7, Google sign-in only, see the authentication section |
| ui                        | Tailwind CSS v4, shadcn/ui primitives shared via `packages/ui` |
| ai                        | Vercel AI SDK with OpenRouter as the provider                |
| price research            | Tavily                                                       |
| file storage              | Vercel Blob                                                  |
| lint / format             | Oxlint / Oxfmt, plus the vendored anti-slop plugin           |
| git hooks                 | Lefthook, commitlint                                         |
| deploy                    | Vercel (web and server as separate services)                 |

## Target layout

```
apps/
  core/           Next.js frontend
  server/         Hono + tRPC backend
packages/
  configuration/  shared tsconfig
  environment/    t3-env schemas, the only module that reads process.env
  database/       Drizzle schema, Neon client, migrations
  authentication/ Better Auth server, session helpers, handlers, React client
  api/            tRPC routers and business logic, organized by feature
  auth/           Better Auth configuration
  database/       Drizzle schema, client, migrations
  ui/             shared shadcn/ui primitives and design tokens
  ai/             AI pipelines: imagery, listing, negotiation
tools/
  oxlint/         vendored lint plugins
documentation/    this folder
```

Workspace package names are short technical nouns (`api`, `database`, `ui`, `ai`), published under the `@tulocal/*` scope. Inside a package, folders and files follow [code.md](./code.md).

## Boundaries

- **Shared logic lives in `packages/*`.** Never import across `apps/web` and `apps/server` directly.
- **UI primitives come from `@tulocal/ui`.** Do not duplicate a shadcn component inside an app.
- **Organize by feature, not by layer.** Inside a package or app, a feature's files sit together (a `products/` folder holding its schema, router, and logic) rather than in global `schemas/`, `routers/`, `services/` buckets. `lib/` and `utils/` folders are for genuinely shared, cross-feature helpers, not a dumping ground for feature-specific code.
- **One package owns each concept.** The database schema for products lives in `packages/database`, the router in `packages/api`, the AI pipeline in `packages/ai`. Nothing is defined twice.

## tRPC

- Routers live in `packages/api/src/routers`, one folder per domain concept (`store`, `product`, `conversation`, `public`).
- `protectedProcedure` for anything seller-facing (requires auth). `publicProcedure` only for buyer-facing, unauthenticated reads.
- **A public procedure must never select or return a product's floor price.** This is enforced at the query level, not by dropping the field in the frontend. See [rules.md](./rules.md) section 7.
- Every input is parsed with a schema at the procedure boundary. Nothing downstream of a procedure receives an unparsed value.

## Database

- Schema lives in `packages/database/src/schema`, one file per domain concept (`stores.ts`, `products.ts`, `conversations.ts`, `questions.ts`, `escalations.ts`).
- The driver is `@neondatabase/serverless` over HTTP (`drizzle-orm/neon-http`): no connection pool to warm up, one fetch per query, the fastest option on Vercel Functions. It does not support interactive transactions (`database.transaction`); use `database.batch` for multi-statement atomic writes. Switch to `drizzle-orm/neon-serverless` (WebSocket pool) only if a feature genuinely needs an interactive transaction.
- `@tulocal/database/client` exports `database`, created once at module load from `databaseEnvironment.DATABASE_URL`, and the `Database` type for passing it around. Use the pooled Neon endpoint (`-pooler` host) in `DATABASE_URL`.
- Run `database:generate` after editing a schema and commit the generated migration. `database:migrate` applies pending migrations, `database:push` syncs the schema without a migration file (local experiments only), `database:studio` opens Drizzle Studio. All four run from the repo root; drizzle-kit does not load `.env` on its own, so the package scripts pass `apps/core/.env` through `bun --env-file`.
- Table and column names are English `snake_case`. TypeScript identifiers derived from them are `camelCase`.
- Records the sales agent produces (price agreements, escalations, scam flags, pending and answered questions) are real tables, not JSON blobs inside a conversation row, because the dashboard queries them directly.

## Authentication

`@tulocal/authentication` owns everything Better Auth. Apps mount it and consume it, they never configure it.

- `@tulocal/authentication/server` exports the `authentication` instance and the `Session` and `AuthenticatedUser` types. Configuration follows the Better Auth security guide: Google is the only sign-in method, account linking is limited to Google, OAuth tokens are encrypted at rest, rate limiting is stored in the database (serverless-safe) with per-endpoint rules in `limits.ts`, sessions last 7 days with a 24 hour refresh, a 1 hour freshness window for sensitive actions, and a 5 minute encrypted (`jwe`) cookie cache. Cookies use the `tulocal` prefix and the client IP is read from `x-forwarded-for` and `x-real-ip`.
- `@tulocal/authentication/session` exports `findSession(headers)`, `requireSession(headers)`, and `UnauthenticatedError`. Protected tRPC procedures and Server Components use these, never the raw API.
- `@tulocal/authentication/nextjs` exports `authenticationRouteHandlers`. The app's `app/api/auth/[...all]/route.ts` re-exports its `GET` and `POST`. `@tulocal/authentication/handler` exposes the same handler as a plain `Request` to `Response` function for Hono.
- `@tulocal/authentication/client` exports `authenticationClient`, `useSession`, `signInWithGoogle(callbackURL)`, and `signOut()` for React components.
- The Better Auth tables (`users`, `sessions`, `accounts`, `verifications`, `rate_limits`) live in `packages/database/src/schema/authentication.ts` and are passed to the Drizzle adapter with `usePlural`.
- Google OAuth needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, with `<BETTER_AUTH_URL>/api/auth/callback/google` registered as the authorized redirect URI in Google Cloud.

## Environment variables

- Plain `.env` files, loaded natively by Bun (server) and Next.js (web). `packages/environment/.env.example` lists every variable with a placeholder.
- `@tulocal/environment` is the only place that reads `process.env`. It validates with t3-env and zod at startup and exports three typed objects: `databaseEnvironment` from `@tulocal/environment/database` (only `DATABASE_URL`, validated as a postgres URL), `serverEnvironment` from `@tulocal/environment/server` (extends the database one with every other server variable), and `webEnvironment` from `@tulocal/environment/web`. Nothing else touches `process.env`. A module imports the narrowest object that covers what it reads: the database client and `drizzle.config.ts` import `databaseEnvironment`, so migrations run with only `DATABASE_URL` set.
- Set `SKIP_ENVIRONMENT_VALIDATION=true` only for lint or build steps that run without secrets, never in a running app.
- Real secrets stay in ignored `.env` files or in Vercel.

| app    | variables                                                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| server | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENROUTER_API_KEY`, `TAVILY_API_KEY`, `BLOB_READ_WRITE_TOKEN` |
| web    | `NEXT_PUBLIC_SERVER_URL`, optionally `NEXT_PUBLIC_APP_URL` (share links and QR codes)                                              |

## Locked decisions

Decided during planning on 2026-09-15. Do not re-open them; extend what exists.

- **AI provider is OpenRouter** through `@openrouter/ai-sdk-provider`, on the Vercel AI SDK. Not Vercel AI Gateway. Model identifiers live in one module inside `packages/ai`; image output needs `extraBody.modalities`.
- **Price research uses Tavily**, not Perplexity or Gemini grounding.
- **The listing pipeline is a synchronous tRPC mutation** (`product.runPipeline`) and the dashboard polls every 2 seconds. No Vercel Workflow, no queues.
- **Uploads go through a multipart Hono route** (`POST /upload`) that calls Vercel Blob server-side, because the client-side Blob token fetch does not send cookies cross-origin in local development.
- **Generated product images must never fake the product.** Backgrounds and framing change; the item does not.

## Next.js

`apps/web/AGENTS.md` is regenerated by `next dev` and flags breaking changes in the installed Next.js version versus training data. Read it before writing frontend code. Do not delete its content from a diff, it just comes back.
