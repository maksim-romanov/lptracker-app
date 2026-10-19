# 0049 · TypeScript 7, Biome and dependency-cruiser as the TypeScript gates

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every TypeScript workspace runs the same `typecheck` and `lint` tasks ([0001](0001-monorepo-turborepo-bun.md)), and the hard rules in `AGENTS.md` need machine checks: layer boundaries, MIT never importing AGPL, no network or runtime globals in `integrations/`. Agents run these checks after every edit, so they must be fast and few.

## Options

- **TS 6 `tsc`, ESLint + Prettier, ast-grep for banned globals**: the most familiar stack, three tools plus plugins.
- **TS 7 native `tsc`, oxlint + Prettier**: fast, but oxlint has no formatter and no plugin language for our custom bans.
- **TS 7 native `tsc`, Biome, dependency-cruiser**: one tool for lint and format, plugins for custom bans, a dedicated boundary checker.

## Decision

Chosen **TS 7 native `tsc` with Biome and dependency-cruiser**, because it gives the fastest type check and one lint and format tool, and Biome's restricted-globals rule and GritQL plugins replace ast-grep.

- Type checking uses TS 7 `tsc` (`@typescript/native`), one task per workspace. `typescript` is aliased to TS 6 only so dependency-cruiser keeps a compiler API; the alias goes away when TS 7.1 ships its API.
- Biome ≥ 2.5 is the only linter and formatter; CI runs `biome ci`.
- Banned globals in `integrations/` use Biome `noRestrictedGlobals` plus a GritQL plugin for dynamic `import()` and `import.meta`; MIT workspaces also set `types: []` so the same globals fail type checking. The list lives in [0036](0036-integration-trust.md).
- dependency-cruiser enforces layer and license boundaries as path rules, including type-only imports.
- Settings and rule lists: [research/repo/ts-quality-gates](../research/repo/ts-quality-gates.md), [research/repo/monorepo-toolchain](../research/repo/monorepo-toolchain.md).

## Consequences

- Two TypeScript versions coexist until TS 7.1; Renovate groups them.
- A `biome-ignore` comment under `integrations/` fails CI, because it can silence the bans.
- Biome has fewer rules than the ESLint ecosystem; a missing rule is a GritQL plugin or a dependency-cruiser rule, never a second linter.
