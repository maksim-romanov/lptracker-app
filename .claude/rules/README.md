# Rules — Depthly (project-tailored)

`.claude/rules/*.md` are auto-injected into agent context. These were adapted from the OMC generic templates to this repo, grounded in the actual code — treat them as project truth, not boilerplate.

| File | Scope |
|------|-------|
| `architecture.md` | Monorepo layout, server Clean Architecture layers, **interface-vs-concrete DI rule**, child containers, codegen chain, generated paths, server/mobile divergence |
| `coding-style.md` | TS naming (T/I/E), file naming, Valibot, no React.FC, Biome, immutability, comments, hygiene |
| `error-handling.md` | Server `Result<T, DomainError>` + per-feature `*.error.ts` + error-mapper registry + gateway `partialFailures`; mobile throw + TanStack Query |
| `logging.md` | `@depthly/logger` (LogTape) `getLogger` categories + structured metadata + levels; mobile `ReactNativeLogger`; no `console.log` |
| `git-workflow.md` | Personal commit rules, Conventional Commits, branch naming, PR uniqueness |
| `testing.md` | `bun test` (server), matchstick (subgraphs), required checks, Result-contract testing |
| `security.md` | Secrets/env, Valibot boundary, provider wrapping, no-SQL note |
| `performance.md` | RPC multicall + Redis, RN perf, subgraph handlers, SSR animation |
| `karpathy-guidelines.md` | Think-before-code, simplicity, surgical changes (generic OMC discipline, kept as-is) |

Source of truth for details remains the per-app `CLAUDE.md` and `apps/*/docs/architecture.md`; these rules summarize and cross-link them.
