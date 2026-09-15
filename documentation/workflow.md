# Workflow

How to run, check, and ship a change. Architecture lives in [engineering.md](./engineering.md); code rules in [code.md](./code.md).

## Commands

Run from the repo root.

| command                | what it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `bun install`          | install all workspaces                                    |
| `bun run dev`          | start every app through Turborepo                         |
| `bun run build`        | build every app                                           |
| `bun run lint`         | Oxlint with warnings treated as errors                    |
| `bun run format`       | Oxfmt, writes in place                                    |
| `bun run check:format` | Oxfmt in check mode                                       |
| `bun run check:types`  | TypeScript across all workspaces                          |
| `bun run test`         | `bun test` across all workspaces                          |

Scope lint and format to source folders when the whole tree is noisy: `bunx oxlint apps packages` and `bunx oxfmt --write apps packages`. Never commit a formatter pass over `documentation/`, `.claude/`, or `tools/`.

## Local development

- The web app runs on port 3001, the server on port 3000.
- Turborepo runs both as one unit. Killing one child kills the other; restart both with `bun run dev`.
- The server runs with `--hot`, which does not reload changes made inside `packages/*`. After editing a package, restart the dev process.
- Copy each app's `.env.example` to `.env` before the first run. Keys still to be provisioned per developer: `OPENROUTER_API_KEY`, `TAVILY_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `REDIS_URL`.

## Git hooks

Lefthook runs on every commit and is not to be bypassed with `--no-verify`.

- **pre-commit**: Oxfmt writes and re-stages staged `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs` files, then Oxlint runs with warnings as errors. `.agents/`, `.cursor/`, and `tools/oxlint/anti-slop/` are excluded.
- **commit-msg**: commitlint validates the message.

## Commits

- Conventional commits, one line: `type(scope): summary`. Allowed types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`, `ci`, `build`, `revert`, `release`, `hotfix`, `backport`.
- Scope is the workspace or feature touched: `feat(api): ...`, `fix(web): ...`, `docs(documentation): ...`.
- Subject in lowercase, imperative, no trailing period.
- Commit only when asked. Work on `main` goes on a branch first.
- Never commit generated noise: formatter passes over docs, `.DS_Store`, `.env` files.

## Tests

This is a hackathon. Tests are welcome but never a reason to slow down.

- Unit tests are optional. Write one only when it is faster than checking by hand, typically for pure logic: the concession curve, the buy-intent classifier, the reply validator that rejects prices below floor.
- Test files sit next to the code, named `<word>.test.ts`, run with `bun test`.
- No module mocking, no snapshot tests, no test scaffolding frameworks. Call the function, assert the output.
- Do not write tests for UI, routing, or database wiring. Run the app instead.

## Closing out a change

Before reporting a change as done:

1. `bun run check:types` passes.
2. `bunx oxlint apps packages` passes with no warnings.
3. `bunx oxfmt --check apps packages` passes.
4. Every rule in [code.md](./code.md) holds, including the ones the linter cannot see: one-word file names, zero comments, no relative imports, no assertions.
5. If the change touches product behavior, it matches [context.md](./context.md), [design.md](./design.md), and [rules.md](./rules.md).
6. Anything skipped or left unverified is stated explicitly in the report, not implied as done.
