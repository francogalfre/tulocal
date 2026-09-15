# Code style

These rules apply to every line of TypeScript, TSX, CSS, and config in this repo. They are not preferences. The linter enforces some of them; the rest are enforced by review. Lint passing is the floor, not the ceiling.

The goal is code that a stranger can read top to bottom without a single explanation: long, explicit names, zero comments, one idea per function, predictable ordering, no cleverness.

## Language

- Code is written in English: identifiers, file names, folder names, database tables, tRPC procedure names, schema keys, log messages.
- Product copy is written in Rioplatense Spanish: UI strings, error messages shown to users, prompts that produce buyer-facing text, and the sales agent's replies. See [design.md](./design.md). Copy lives in the component or in a dedicated module, never mixed into identifiers.

## Files and folders

- **Every file name is exactly one lowercase word.** No hyphens, no underscores, no camelCase, no dots except the extension and an optional `.test` segment.
- **Division happens through folders, not through file names.** Instead of `create-store-form.tsx` write `store/create/form.tsx`. Instead of `use-handle-availability.ts` write `store/handle/availability.ts`. Instead of `auth-client.ts` write `auth/client.ts`.
- Folder names are also one lowercase word. Nest as deep as the concept requires; three levels is normal.
- Examples of correct paths:
  - `components/navigation/avatar.tsx`
  - `lib/database/client.ts`
  - `features/product/pricing/curve.ts`
  - `features/product/pricing/curve.test.ts`
- The only exceptions are names a framework or tool mandates: `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`, `turbo.json`. Never invent a multi-word name for anything else.
- **300 lines per file, maximum. Aim for under 200.** When a file approaches the limit, split it into a folder of one-word files. Do not keep growing one file because it is convenient.
- One exported concept per file. A file named `curve.ts` exports the curve and whatever private helpers it needs, nothing else.

## Naming

- **Every name says exactly what the thing is or does.** Read the name alone and you know its type, its unit, and its role. `remainingGapToFloorPrice`, not `gap`. `computeNextCounterOffer`, not `next`. `isBuyerShowingPurchaseIntent`, not `intent`.
- **Long names beat short names.** There is no penalty for a 40-character identifier. There is a penalty for a name that needs a lookup.
- **No abbreviations.** `configuration`, not `config`. `request`, not `req`. `response`, not `res`. `error`, not `err`. `conversation`, not `conv`. `parameters`, not `params`. `properties`, not `props` in your own types (React's `props` parameter name is the one exception). The only allowed short forms are universal acronyms: `id`, `url`, `api`, `html`, `css`, `qr`, `ai`.
- **No filler words.** Names never contain `data`, `info`, `item`, `temp`, `value`, `result`, `object`, `helper`, `util`, `manager`, `handler`, `shape`, `stuff`, `thing`, `misc`. Each of these hides what the variable actually holds. The linter rejects `shape` outright.
- **Booleans read as questions**: `isPublished`, `hasFloorPrice`, `canNegotiate`, `shouldNotifySeller`.
- **Functions start with a verb**: `createStore`, `computeNextCounterOffer`, `parseBuyerMessage`, `persistEscalation`. Functions that return a boolean start with `is`, `has`, `can`, or `should`.
- **Collections are plural nouns**: `products`, `pendingQuestions`, `comparableListings`. Never `productList` or `productsArray`.
- **Constants are `camelCase` like everything else**, except true module-level literals that never change, which are `SCREAMING_SNAKE_CASE`: `DEFAULT_MAX_COUNTER_OFFERS`.
- **Types and components are `PascalCase`**, one word per concept: `NegotiationSettings`, `PendingQuestion`, `ProductCard`.
- **Numbers carry their unit in the name**: `timeoutInMilliseconds`, `priceInArs`, `unsoldForDays`.

## Comments

- **Zero comments.** No line comments, no block comments, no JSDoc, no TODO, no FIXME, no section banners, no commented-out code, no `eslint-disable`, no `@ts-ignore`, no `@ts-expect-error`, no "SAFETY" notes.
- If something seems to need a comment, the fix is a better name, a smaller function, or a named constant. If a piece of logic is genuinely surprising, extract it into a function whose name states the surprise.
- The vendored plugin in `tools/oxlint/anti-slop` is third-party code and is exempt. Nothing under `apps/` or `packages/` is.

## File layout and spacing

Every module follows the same order, top to bottom:

1. Imports (see below).
2. Module-level constants.
3. Types and schemas.
4. Private helper functions.
5. The exported function or component, last.

Spacing rules:

- One blank line between every top-level declaration. Never two.
- One blank line after the import block.
- Inside a function, a blank line separates logical steps: parse input, compute, persist, return. No blank line at the start or end of a block.
- No blank lines between the lines of a single logical step.
- Braces on every `if`, `for`, and arrow body with more than one expression. No single-line `if` without braces.
- Early returns over nested conditionals. Maximum two levels of nesting inside a function; past that, extract.

## Functions

- **Top-level functions use the `function` keyword.** Arrow functions are only for inline callbacks passed to another call.
- **Named exports only.** Default exports are used only where a framework requires them (Next.js `page.tsx`, `layout.tsx`, config files).
- **One function does one thing.** If describing it needs "and", split it.
- **Parameters are typed by a named type owned by the domain**, never by an inline object literal type. `function createStore(input: CreateStoreInput)`, not `function createStore(input: { name: string; handle: string })`. The linter rejects inline object parameters.
- Functions with more than three positional parameters take a single named input type instead.
- **Explicit return types on every exported function.**
- No functions that return `unknown` or `Promise<unknown>`. Decode at the boundary and return a real type.

## Imports

- **Always import through an alias. Never write a relative import**, not even `./sibling`.
  - Inside `apps/*`, the alias is `@/*`, declared in the app's `tsconfig.json` and pointing at its own `src/*`.
  - Inside `packages/*`, the alias is the package's own name: `@tulocal/environment/database` from within `@tulocal/environment`. Every module a package imports, from itself or from others, is listed in its `package.json` `exports`. Packages never declare `@/*`, because a consumer's `tsc` and bundler resolve the consumed package's source with the consumer's `paths`, and `@/` would point at the wrong `src`.
  - Cross-package imports use the workspace name too: `@tulocal/database/client`, `@tulocal/ui/button`.
- Imports are grouped in this order, with exactly one blank line between groups and none inside a group:
  1. Node built-ins (`node:crypto`, `node:path`).
  2. External packages (`react`, `zod`, `hono`, `drizzle-orm`).
  3. Workspace packages (`@tulocal/*`).
  4. Own-package imports (`@/*` in apps, the package's own name in packages).
- Inside a group, entries are sorted alphabetically by module path. Value imports come before type imports from the same module.
- Type-only imports always use `import type`. The base tsconfig has `verbatimModuleSyntax` on, so this is not optional.
- No barrel `index.ts` files except the single public entry of a package. Import from the concrete module.
- No wildcard imports (`import * as`) except when a library's API is designed for it.

Example:

```ts
import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { database } from "@tulocal/database/client";
import { products } from "@tulocal/database/schema/products";

import { protectedProcedure } from "@tulocal/api/procedures/protected";
import type { CreateProductInput } from "@tulocal/api/features/product/types";
```

## Types

- **`any` is forbidden.** In every form: annotations, generics, `as any`, `Record<string, any>`.
- **Type assertions are forbidden.** No `as`, no angle-bracket casts, no `as unknown as`, no `as never`, no non-null `!`. The only allowed assertion is `as const`. The anti-slop plugin requires a comment on every assertion, and comments are forbidden, so the practical effect is that assertions never appear.
- **`unknown` exists only at I/O boundaries** and is decoded immediately with a schema. No function parameter typed `unknown` (except an error `cause`), no type alias that resolves to `unknown`, no dictionary typed `Record<string, unknown>`.
- **No runtime `typeof` checks** to figure out what a value is. Parse it into a real type at the boundary and let the type system carry it from there.
- **No widening then narrowing.** Do not declare a value as a broad type and later assert it back down. Let inference keep the precise type.
- `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, and `noUnusedParameters` are on in the base tsconfig. Code that only compiles with them off is wrong.
- Schemas (zod) are the source of truth for external data. Derive the TypeScript type from the schema, never write both by hand.

## Anti-slop

Slop is code that looks plausible and carries no evidence. These patterns are rejected on sight:

- **Defensive code with no failure to defend against.** No `try/catch` around code that cannot throw, no `?? ""` or `|| []` fallbacks that hide a missing value, no optional chaining on a value that is never optional.
- **Empty or swallowing `catch` blocks.** Handle the error, rethrow it, or let it propagate.
- **Conditional spreads to omit fields**: `...(condition ? { field } : {})`. Build the object explicitly.
- **`Reflect.get`, `Reflect.apply`, dynamic property access by string.** Use typed access or model the dispatch behind an interface.
- **Premature abstraction.** No generic helper, config layer, or plugin system for a single caller. Two similar call sites can stay duplicated; extract on the third.
- **Dead code.** No unused exports, no unreachable branches, no "just in case" parameters. Git history is the fallback, not the working tree.
- **Magic values.** Any number or string with meaning gets a named constant.
- **Leftover `console.log`.** Logging goes through one logger module per app, with a message that names the event.
- **Placeholder implementations.** No functions that return hardcoded fake data "for now", no `throw new Error("not implemented")`. Build the real thing or do not add the function.
- **Module mocking in tests.** No `vi.mock` or `jest.mock`. If a test needs a fake dependency, pass it through the real interface.
- **Re-exporting for convenience.** A module exports what it owns, nothing it merely imports.

## React and Next.js specifics

- Components are functions with the `function` keyword, `PascalCase`, one per file, file named after the component in one lowercase word (`components/navigation/avatar.tsx` exports `Avatar`).
- Props types are named `<Component>Props` and declared in the same file, above the component.
- Hooks start with `use` and live in a file named after what they return, in one word: `store/handle/availability.ts` exports `useHandleAvailability`.
- Server Components by default. `"use client"` only on the leaf that actually needs browser state.
- No inline styles. Tailwind utilities plus the tokens from [design.md](./design.md).
- Copy strings live in the component that renders them, in Rioplatense Spanish, never abstracted into a translation layer for the hackathon.

## CSS

- Tokens from [design.md](./design.md) are declared once in `packages/ui`, without comments.
- No arbitrary Tailwind values (`w-[13px]`) when a token or scale step exists.
- No `!important`.
