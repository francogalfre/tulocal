# tulocal

All project documentation lives in `documentation/`. There is no other source of truth: if a rule is not written there, it is not a rule.

| file                                 | what it covers                                                                              | read it before                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| `documentation/context.md`           | What the product is, what it is not, who it is for, seller and buyer flows, feature priority | any product feature                    |
| `documentation/design.md`            | Visual system: principles, palette, typography, spacing, components, voice and tone         | any UI, component, or copy             |
| `documentation/rules.md`             | Sales agent behavior spec: negotiation, floor price, scam detection, buy handoff            | touching the agent or anything pricing |
| `documentation/engineering.md`       | Stack, monorepo layout, package boundaries, tRPC, database, environment, locked decisions   | creating or moving any file            |
| `documentation/code.md`              | Code rules: naming, one-word files, zero comments, ordering, imports, aliases, types, anti-slop | writing any line of code            |
| `documentation/workflow.md`          | Commands, git hooks, commits, tests, how to close out a change                              | committing                             |

Conventions: documentation and code are in English, product copy is in Rioplatense Spanish. The product name is **tulocal**, lowercase, one word. No em dashes anywhere. When a decision is not covered, resolve it from the principles in the relevant document instead of inventing a new pattern, then write it down.

@documentation/code.md
@documentation/engineering.md
