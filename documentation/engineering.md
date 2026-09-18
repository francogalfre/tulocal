# Engineering

Repo-wide architecture and stack conventions. They apply to every app and package regardless of feature. Code-level rules (naming, comments, imports, types) live in [code.md](./code.md); commands and git rules live in [workflow.md](./workflow.md).

## Current state of the repo

The repo was reset on 2026-09-15 to rebuild the MVP from a clean base. What exists today:

- `apps/core`: the Next.js app. It is the whole product: pages, Server Actions, the Better Auth route handler, shadcn/ui components and the listing pipeline all live here. There is no separate server.
- `packages/configuration`: the shared `tsconfig.base.json` every workspace extends.
- `packages/environment`: t3-env schemas for every environment variable, see below.
- `packages/database`: Drizzle client on the Neon HTTP driver, schema, migrations, see below.
- `packages/authentication`: Better Auth server instance, session helpers, request handlers, and the React client.
- `packages/storage`: Redis client, typed cache on top of it, and the Vercel Blob wrapper, see below.
- `packages/payments`: Mercado Pago subscriptions and webhook signature check, see the billing section.
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
| backend                   | Next.js Server Actions and route handlers, inside `apps/core` |
| database                  | PostgreSQL (Neon), Drizzle ORM                               |
| auth                      | Better Auth 1.7, Google sign-in only, see the authentication section |
| ui                        | Tailwind CSS v4, shadcn/ui (Base UI, `base-nova`) installed in `apps/core/src/components/ui` |
| icons                     | Hugeicons free (`@hugeicons/react` + `@hugeicons/core-free-icons`), every icon exposed as `tulocalIcons.<name>` from `apps/core/src/components/icons.tsx` |
| motion                    | `motion` (`motion/react`), wrappers in `apps/core/src/components/motion`, timing in `lib/motion` |
| ai                        | Vercel AI SDK with OpenRouter as the provider                |
| price research            | Tavily                                                       |
| cache                     | Redis over `ioredis`, wrapped by `@tulocal/storage/cache`   |
| file storage              | Vercel Blob, wrapped by `@tulocal/storage/blob`             |
| payments                  | Mercado Pago subscriptions (`mercadopago` SDK), wrapped by `@tulocal/payments` |
| lint / format             | Oxlint / Oxfmt, plus the vendored anti-slop plugin           |
| git hooks                 | Lefthook, commitlint                                         |
| deploy                    | Vercel, one project                                          |

## Target layout

```
apps/
  core/           the Next.js app: pages, Server Actions, features, shadcn/ui, AI pipeline
packages/
  configuration/  shared tsconfig
  environment/    t3-env schemas, the only module that reads process.env
  database/       Drizzle schema, Neon client, migrations
  authentication/ Better Auth server, session helpers, handlers, React client
  storage/        Redis client, typed cache, Vercel Blob wrapper
  payments/       Mercado Pago subscriptions and webhook signature check
tools/
  oxlint/         vendored lint plugins
documentation/    this folder
```

Inside `apps/core/src`: `app/` holds routes only, `features/<domain>/` holds each feature's Server Actions, queries and components together (`features/product/pipeline/` is the listing pipeline, `features/store/ensure.ts` creates the store on first login), `components/ui/` is shadcn output, `lib/` is cross-feature glue (session, logger, money, url).

Decided on 2026-09-15 after the reset: **no tRPC, no Hono, no second deployable.** Mutations are Server Actions in `features/*`, reads are direct Drizzle queries from Server Components, long work runs in `after()` from `next/server`. Add a package only when two apps would share it.

Workspace package names are short technical nouns (`database`, `storage`, `authentication`), published under the `@tulocal/*` scope. Inside a package, folders and files follow [code.md](./code.md).

## Boundaries

- **Infrastructure lives in `packages/*`** (environment, database, authentication, storage, payments). Product logic lives in `apps/core/src/features`.
- **UI primitives come from shadcn/ui** in `apps/core/src/components/ui`, added with `bunx --bun shadcn@latest add <component>`. Do not hand-write a button, input or field.
- **Organize by feature, not by layer.** Inside a package or app, a feature's files sit together (a `products/` folder holding its schema, router, and logic) rather than in global `schemas/`, `routers/`, `services/` buckets. `lib/` and `utils/` folders are for genuinely shared, cross-feature helpers, not a dumping ground for feature-specific code.
- **One place owns each concept.** The database schema for products lives in `packages/database`, its actions and pipeline in `apps/core/src/features/product`. Nothing is defined twice.

## Server Actions and queries

- Seller-facing actions call `requireCurrentSession()` from `@/lib/session` first and load data through `findOwnedProduct` / `findStoreByOwner`, which check ownership.
- Buyer-facing reads go through `features/store/public.ts`. **A public query must never select a product's floor price.** This is enforced with Drizzle `columns`, not by dropping the field in the frontend. See [rules.md](./rules.md) section 7.
- Every action parses `FormData` with a zod schema before touching the database. Actions return a `{ error }` state consumed with `useActionState`; navigation happens with `redirect` or `revalidatePath`.

## Database

- Schema lives in `packages/database/src/schema`, one file per domain concept (`stores.ts`, `products.ts`, `conversations.ts`, `questions.ts`, `escalations.ts`, `subscriptions.ts`, `creations.ts`).
- Product category (`product_category`, a fixed taxonomy) and condition (`product_condition`: `new`, `like_new`, `good`, `worn`) are Postgres enums. The Drizzle enum is the only owner of each value list: server code builds zod enums from `productCategory.enumValues` / `productCondition.enumValues`, and the Spanish labels live in `apps/core/src/features/product/category.ts` and `condition.ts` as a `Record` keyed by the enum type, so a missing or extra label fails to compile. Client components only `import type` from the schema.
- The driver is `@neondatabase/serverless` over HTTP (`drizzle-orm/neon-http`): no connection pool to warm up, one fetch per query, the fastest option on Vercel Functions. It does not support interactive transactions (`database.transaction`); use `database.batch` for multi-statement atomic writes. Switch to `drizzle-orm/neon-serverless` (WebSocket pool) only if a feature genuinely needs an interactive transaction.
- `@tulocal/database/client` exports `database`, created once at module load from `databaseEnvironment.DATABASE_URL`, and the `Database` type for passing it around. Use the pooled Neon endpoint (`-pooler` host) in `DATABASE_URL`.
- Run `database:generate` after editing a schema and commit the generated migration. `database:migrate` applies pending migrations, `database:push` syncs the schema without a migration file (local experiments only), `database:studio` opens Drizzle Studio. All four run from the repo root. If `database:migrate` fails with `pg.Pool is not a constructor`, drizzle-kit picked up a stray `pg` package in `node_modules` that is not node-postgres; migration `0012` was applied on 2026-09-17 with `drizzle-orm/neon-http/migrator` instead, which writes the same `drizzle.__drizzle_migrations` journal. drizzle-kit does not load `.env` on its own, so the package scripts pass `apps/core/.env` through `bun --env-file`. `apps/core/.env` is a symlink to the root `.env`.
- Table and column names are English `snake_case`. TypeScript identifiers derived from them are `camelCase`.
- Records the sales agent produces (price agreements, escalations, scam flags, pending and answered questions) are real tables, not JSON blobs inside a conversation row, because the dashboard queries them directly.

## Authentication

`@tulocal/authentication` owns everything Better Auth. Apps mount it and consume it, they never configure it.

- `@tulocal/authentication/server` exports the `authentication` instance and the `Session` and `AuthenticatedUser` types. Configuration follows the Better Auth security guide: Google is the only sign-in method, account linking is limited to Google, OAuth tokens are encrypted at rest, rate limiting is stored in the database (serverless-safe) with per-endpoint rules in `limits.ts`, sessions last 7 days with a 24 hour refresh, a 1 hour freshness window for sensitive actions, and a 5 minute encrypted (`jwe`) cookie cache. Cookies use the `tulocal` prefix and the client IP is read from `x-forwarded-for` and `x-real-ip`.
- `@tulocal/authentication/session` exports `findSession(headers)`, `requireSession(headers)`, and `UnauthenticatedError`. Server Actions and Server Components use these through `@/lib/session`, never the raw API.
- `@tulocal/authentication/nextjs` exports `authenticationRouteHandlers`. The app's `app/api/auth/[...all]/route.ts` re-exports its `GET` and `POST`.
- `@tulocal/authentication/client` exports `authenticationClient`, `useSession`, `signInWithGoogle(callbackURL)`, and `signOut()` for React components.
- The Better Auth tables (`users`, `sessions`, `accounts`, `verifications`, `rate_limits`) live in `packages/database/src/schema/authentication.ts` and are passed to the Drizzle adapter with `usePlural`.
- Google OAuth needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, with `<BETTER_AUTH_URL>/api/auth/callback/google` registered as the authorized redirect URI in Google Cloud.

## Billing

Decided on 2026-09-16. The plans, their limits and prices are in [context.md](./context.md); `apps/core/src/features/plan/catalog.ts` is the only place in code that holds them. The feature is split into `plan/access` (which plan a store has), `plan/limits` (usage, slot reservation, Buenos Aires periods, the usage meter) and `plan/subscription` (checkout, cancel, sync, webhook processing and their UI).

- **Payments turn on by configuration.** Both Mercado Pago variables are optional. `isPaymentsEnabled()` from `@tulocal/payments/client` is true only when `MERCADOPAGO_ACCESS_TOKEN` and `MERCADOPAGO_WEBHOOK_SECRET` are set. While it is false every shop is on Gratis, the paid cards on the landing and `/plans` show a disabled "Muy pronto", `startSubscription` and `cancelSubscription` do nothing, and the webhook answers 503. Setting both variables in Vercel and redeploying is the whole switch.
- **Mercado Pago subscriptions without an associated plan, with pending payment.** `createPreapproval` in `@tulocal/payments/preapproval` sends POST `/preapproval` with `status: "pending"`, a monthly `auto_recurring` in ARS, `external_reference` set to our `subscriptions.id`, and `back_url` pointing at `/plans`. Mercado Pago returns an `init_point` and charges in its own checkout, so tulocal never touches card data. The plan-based variant (`preapproval_plan`) is not used because it requires creating the subscription with a `card_token_id` from our own card form.
- **`payer_email` must be the email of the Mercado Pago account that pays**, otherwise the subscription fails with a vague error. The checkout dialog asks for it, prefilled with the Google email.
- **The `init_point` bug.** Since 2026-09-02, the `init_point` carries `&activation=true`, which opens "Esta página no existe" (mercadopago/sdk-nodejs#480). `removeBrokenActivationParameter` strips it. Remove the function once Mercado Pago fixes it.
- **The SDK is the official `mercadopago` package, imported only inside `packages/payments`.** Its response types are all optional, so every response is decoded with zod into `Preapproval`. SDK errors become `PreapprovalRejectedError`. `/authorized_payments/{id}` has no SDK client and is a typed `fetch` in `payment.ts`.
- **Tables.** `subscriptions` holds one row per checkout attempt: plan, status (`pending`, `authorized`, `paused`, `cancelled`), the preapproval id, the checkout URL, the payer email, the amount and `access_ends_at`. `product_creations` gets one row per created product and is never deleted, because products are hard-deleted and the free limit counts every product ever created. Migration `0012` backfills it from existing products.
- **Current plan.** `findCurrentPlan(storeId)` in `features/plan/access/current.ts` picks the highest plan whose subscription is `authorized`, or whose `access_ends_at` plus three days of grace is still ahead. A cancelled plan keeps working until the month the seller already paid runs out.
- **Enforcement.** `createProduct` checks `findProductCreationBlocker` before uploading photos, then reserves a slot with `reserveProductCreation`, a single `insert ... select ... where <limit condition>` so two parallel submits cannot pass the cap. `requestScene` rejects free shops. `/api/chat` answers 429 and the chat shows the WhatsApp fallback once a free shop runs out of agent replies for the month (calendar month, Buenos Aires time).
- **Webhook.** `app/api/mercadopago/route.ts` checks `x-signature` with the SDK's `WebhookSignatureValidator` (manifest `id:<data.id from the query>;request-id:<x-request-id>;ts:<ts>;`, HMAC-SHA256 with `MERCADOPAGO_WEBHOOK_SECRET`), answers 401 when it fails, and otherwise processes the notification synchronously so a failure returns 500 and Mercado Pago retries it. Register the URL with the `subscription_preapproval` and `subscription_authorized_payment` topics in the Mercado Pago panel. Test and production have separate URLs and secrets.
- **State always comes from the API, never from the notification body.** `syncPreapproval` reads the preapproval, finds our row by `external_reference`, updates the status and, when authorized, sets `access_ends_at` to `next_payment_date`. It is idempotent. When a subscription is authorized, it cancels the store's other open subscriptions, which is how switching between Pro and Negocio works. `/plans` also syncs the preapproval in `after()` when Mercado Pago sends the seller back with `preapproval_id`, so the page does not wait for the webhook.
- **Local testing.** `back_url` must be https, so point `NEXT_PUBLIC_APP_URL` at a tunnel or use a Vercel preview. Use Mercado Pago test users: the seller's test credentials in `MERCADOPAGO_ACCESS_TOKEN` and the test buyer's email in the checkout dialog.

## Storage

`@tulocal/storage` owns every byte that is not in Postgres: the Redis cache and the Vercel Blob store. Nothing else imports `ioredis` or `@vercel/blob`.

- `@tulocal/storage/redis` exports `redis`, one `ioredis` instance created at module load from `storageEnvironment.REDIS_URL`, with `lazyConnect` so importing the module never opens a socket, and the `tulocal:` key prefix applied to every command. Reach for it directly only when the cache module does not cover the command (counters, sets, locks).
- `@tulocal/storage/cache` exports `CacheEntry<Value>` and four functions over it: `readCache`, `writeCache`, `removeCache`, `rememberCache`. A `CacheEntry` bundles the key, the zod schema of the stored value, and `timeToLiveInSeconds`. Values are stored as JSON and parsed with the schema on the way out. A stored value that no longer matches its schema is deleted and treated as a miss, so a deploy that changes a schema never serves stale data. Every write carries a TTL; there are no keys without expiry. Features define their entries next to the code that uses them, with the key namespaced by feature (`price-research:<productId>`).
- `@tulocal/storage/blob` exports `uploadBlob(input)` and `removeBlob(url)`. Uploads are public, get a random suffix so two sellers never collide on a pathname, and return a `StoredBlob` with `url`, `pathname`, and `contentType`. The token comes from `storageEnvironment`, never from `process.env`.
- Both modules read `storageEnvironment` from `@tulocal/environment/storage`, which validates `REDIS_URL` (a `redis` or `rediss` URL) and `BLOB_READ_WRITE_TOKEN`. `serverEnvironment` extends it.

## Caching

Decided on 2026-09-16. Cache Components stay off until after the demo, because every route reads the session or the buyer cookie and would need a Suspense boundary. What is cached today:

- **Buyer-facing reads** (`findPublicStore`, `findPublicProduct`) wrap their Drizzle query in `unstable_cache` for one hour, tagged `store:<handle>` (built by `@/lib/tags`), and are also wrapped in React `cache()` so a page and its `generateMetadata` share one lookup. The store query serializes `createdAt` to an ISO string inside the cached function and revives it outside, because `unstable_cache` stores JSON and would otherwise return strings where the type says `Date`. Public queries select image columns explicitly for the same reason. Both queries pass a `JSON.stringify` of their column constants as an extra key part, because `unstable_cache` serves a stale entry once while it revalidates in the background: without that key part, a deploy that adds a column to a public query would render one request per entry with the old shape and crash on the missing field.
- **Every action that changes what a buyer can see** calls `updateTag(buildStoreTag(handle))`: publish, update, sell, remove, arrange images, and store update. An action that forgets the tag ships a stale catalog for up to an hour. Owner pages read through `findOwnedProduct` and `findOwnerCatalog`, which are never cached.
- **Tavily searches** go through `searchWeb` in `features/product/pipeline/search.ts`, which wraps the call in `rememberCache` from `@tulocal/storage/cache` under `web-search:<sha256 of the request body>` for 24 hours, so a pipeline retry or a repeated upload does not pay for the same search twice. Both the comparables research and the model facts step use it.
- **Optimized images** keep a 31 day `minimumCacheTTL`, safe because every blob URL carries a random suffix and is never rewritten in place.
- **Session** lookups are already cached by Better Auth's encrypted cookie cache for 5 minutes, see the authentication section.

Route conventions that go with this: `app/not-found.tsx` and `app/error.tsx` render the Spanish fallbacks, and `loading.tsx` exists next to the store, public product and owner product pages so `Link` prefetches those dynamic routes and navigation shows a skeleton instead of blocking.

## Environment variables

- Plain `.env` files, loaded natively by Bun (server) and Next.js (web). `packages/environment/.env.example` lists every variable with a placeholder.
- `@tulocal/environment` is the only place that reads `process.env`. It validates with t3-env and zod at startup and exports five typed objects: `databaseEnvironment` from `@tulocal/environment/database` (only `DATABASE_URL`, validated as a postgres URL), `storageEnvironment` from `@tulocal/environment/storage` (`REDIS_URL` and `BLOB_READ_WRITE_TOKEN`), `paymentsEnvironment` from `@tulocal/environment/payments` (`MERCADOPAGO_ACCESS_TOKEN` and `MERCADOPAGO_WEBHOOK_SECRET`, both optional until payments are turned on), `serverEnvironment` from `@tulocal/environment/server` (extends the database and storage ones with every other server variable; it does not extend the payments one, so the app boots without Mercado Pago keys and only `/plans` and the webhook need them), and `webEnvironment` from `@tulocal/environment/web`. Nothing else touches `process.env`. A module imports the narrowest object that covers what it reads: the database client and `drizzle.config.ts` import `databaseEnvironment`, so migrations run with only `DATABASE_URL` set.
- Set `SKIP_ENVIRONMENT_VALIDATION=true` only for lint or build steps that run without secrets, never in a running app.
- Real secrets stay in ignored `.env` files or in Vercel.

The single app reads every variable: `DATABASE_URL`, `REDIS_URL`, `BLOB_READ_WRITE_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENROUTER_API_KEY`, `TAVILY_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `SUPERADMIN_EMAILS`, `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_APP_URL`. Locally all URLs point at `http://localhost:3000`.

## Superadmin

Decided on 2026-09-18. `apps/core/src/app/admin` is a Next.js route group gated by `requireSuperadminSession` in `@/lib/admin`, which redirects to `/` unless the signed-in user's email is in `SUPERADMIN_EMAILS` (comma-separated, required, no default). Every Server Action in `features/admin/actions.ts` calls the same guard itself, because Server Actions do not go through the route layout. The panel lists every store with its plan and usage, and lets a superadmin grant a plan manually or suspend a store (`stores.suspended_at`), for support and manual sales before Mercado Pago is live.

## Locked decisions

Decided during planning on 2026-09-15. Do not re-open them; extend what exists.

- **AI provider is OpenRouter** through `@openrouter/ai-sdk-provider`, on the Vercel AI SDK. Not Vercel AI Gateway. Model identifiers live in `apps/core/src/features/product/pipeline/models.ts`; image output needs `extraBody.modalities`.
- **Price research uses Tavily**, not Perplexity or Gemini grounding. Tavily is called with `search_depth: "advanced"`: basic mode returns Mercado Libre blog posts and store pages without prices, advanced snippets carry listing titles and prices. Raw content and the extract endpoint do not work for Mercado Libre, so the snippet is the only source. Comparable URLs always come from the Tavily results (the extraction model returns a result index, never a URL).
- **The listing pipeline runs inside `after()`** of the `createProduct` Server Action (`features/product/pipeline/run.ts`): identification first, then images, copy, price research and model facts (`pipeline/facts.ts`, a web search about the identified brand and model distilled into up to eight general sentences stored in `products.facts`, skipped for categories without a model such as clothing) in parallel, and the product page refreshes every 2 seconds until the status leaves `processing`. No Vercel Workflow, no queues.
- **Uploads go through the `createProduct` Server Action**, which receives the photos as `FormData` and calls `uploadBlob` from `@tulocal/storage/blob` server-side. Server Actions reject bodies over 1 MB by default, so `next.config.ts` raises `experimental.serverActions.bodySizeLimit` to 50 MB, enough for three 15 MB product photos or the store's 8 MB avatar and banner. Any new action that receives files relies on that limit. The photo limits (count, size, accepted types) live once in `features/product/upload/limits.ts`, shared by the action and the client dropzone, so a rejected photo is reported before the upload starts and the two sides can never disagree.
- **Generated product images must never fake the product.** Backgrounds and framing change; the item does not.
- **Store location is public only at neighborhood level, decided on 2026-09-16.** Sellers pick an address, neighborhood or city from Photon (`photon.komoot.io`, OpenStreetMap geocoding, no key) through `app/api/places/route.ts`, inside an Argentina bounding box. The exact pick lives in `address_line`, `address_latitude` and `address_longitude`, which are seller-only: **a public query must never select the address columns**, same rule as the floor price. What buyers see comes from `location_name` (district, city, state) and `location_latitude` / `location_longitude`, which `features/store/location/privacy.ts` snaps to the center of a 0.005 degree cell (about 500 m) at save time, so the public map shows a circle near the place instead of the door. Maps render with MapLibre through `@vis.gl/react-maplibre` on the OpenFreeMap `positron` style (no key, no tile limits for this scale); the map component lives in `features/store/location/map.tsx` and defers `maplibre-gl` to the client. MapLibre 6 derives its tile worker URL from `import.meta.url`, which Turbopack does not expose as an http URL, so the map would silently render no tiles: `map.tsx` calls `setWorkerUrl` with the jsdelivr copy of `maplibre-gl-worker.mjs` for the installed version (`getVersion()`), and MapLibre wraps that cross-origin file in a blob module worker itself.
- **Instagram export composes, it does not draw with a model, decided on 2026-09-16.** `/product/[id]/export` turns a published product into a 1080x1920 story and a three slide 1080x1080 carousel. The pieces are rendered per request with `ImageResponse` in `app/product/[id]/export/story/route.tsx` and `carousel/route.tsx` from the satori components in `features/product/export/pieces`, reusing the OpenGraph fonts and palette; the seller downloads the PNG or shares it with `navigator.share` when the browser supports files. Each format has two sources: the pipeline photos, or an AI scene generated on demand with the same `imageModel` and the preservation rules from `pipeline/preserve.ts` (the model never renders text, the price and title are composed on top). Scenes live in the `scenes` table, one row per product and format with a pending, ready or failed status, generated inside `after()` from the `requestScene` action, stored in Blob under `products/<id>/scenes/` and replaced on regeneration. The aspect ratio is requested per call through `providerOptions.openrouter.image_config.aspect_ratio`, which OpenRouter forwards to Gemini. The caption is written by `fastModel` and cached in Redis under `export-caption:<productId>:<updatedAt>` for seven days. No Instagram API: the Graph API needs a business account and app review, and `context.md` forbids auto-publishing.
- **Social profiles are stored as handles**, one nullable column per network (`instagram_handle`, `tiktok_handle`, `facebook_handle`, `x_handle`). `features/store/social/handle.ts` normalizes a pasted URL or `@user` into the bare handle, and `features/store/social/networks.tsx` is the only place that knows each network's profile URL and logo.

## Next.js

`apps/core/AGENTS.md` is regenerated by `next dev` and flags breaking changes in the installed Next.js version versus training data. Read it before writing frontend code. Do not delete its content from a diff, it just comes back.
