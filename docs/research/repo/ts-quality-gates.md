---
app: repo
topic: TypeScript and quality gates
checked: 2026-09-30
---

# TypeScript and quality gates

Input for the M0 skeleton. One tool per job: `tsc` types, Biome lint and format, dependency-cruiser import boundaries, `bun pm licenses` dependency licenses, `reuse lint` file licensing, lychee links, markdownlint-cli2 Markdown structure, `bun test` tests.

## Decisions

TypeScript

- We use Bun workspaces as Just-in-Time packages: each `package.json` `exports` points at `.ts` source. We use no project references and no `paths` aliases, because Turborepo advises against project references and says `paths` break Just-in-Time packages [5], and TS 7 removed `baseUrl` [3].
- `packages/core` exports only `./domain`, `./ports` and `./use-cases`, so a deep import into another layer fails to resolve. `moduleResolution: bundler` respects `exports` the same way Bun does [6].
- A shared base tsconfig sets `module: Preserve`, `moduleResolution: bundler`, `moduleDetection: force`, `verbatimModuleSyntax`, `noEmit` and `allowImportingTsExtensions`, as Bun recommends [6]. It also sets `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` and `erasableSyntaxOnly`, because Bun strips types in a single pass and enums, namespaces and parameter properties cannot be stripped [4].
- We skip `isolatedDeclarations`, because it only pays off when `.d.ts` files are emitted, and Just-in-Time packages emit none [4][5].
- Each workspace lists its `types` explicitly, because TS 6+ defaults `types` to `[]` [1]. `["bun"]` goes only in `apps/*` and `packages/infra`. `packages/core`, `contracts`, `integration-kit` and `integrations/` use `types: []` and `lib: ["ESNext"]` without DOM, so `fetch`, `process`, `Bun` and `require` also fail type-checking there. This is a second layer, not the gate.
- We type-check with TS 7 `tsc`, one task per workspace in Turborepo. `typescript` is aliased to `npm:@typescript/typescript6` so dependency-cruiser keeps a compiler API, and TS 7 installs as `@typescript/native`. Reason: TS 7 has no programmatic API before 7.1 [2], and dependency-cruiser supports TS 7 only from 7.1 [9].

Biome

- Biome ≥ 2.5 is the only linter and formatter. CI runs `biome ci`, which never writes and emits GitHub annotations [13][11].
- The `a11y` group is set to `error` for `apps/server`. The Hono JSX canary asserts that `noLabelWithoutControl` fires on `<label for>`, which the rule accepts as well as `htmlFor` [14].
- We ban globals in `integrations/` with Biome instead of ast-grep, which saves a tool. An `overrides` entry for `integrations/**` turns on `noRestrictedGlobals` as an error. It flags only unshadowed global references and takes an object of name → message [12]. A GritQL plugin scoped with `includes: ["integrations/**"]` bans dynamic `import($x)` and `import.meta`, because a keyword is not a global [10]. **This conflicts with ADR 0036, which names ast-grep.**
- The deny list is longer than ADR 0036's: `fetch`, `process`, `Bun`, `require`, `eval`, `globalThis`, plus `global`, `self`, `Function`, `WebSocket`, `EventSource`, `XMLHttpRequest`, `Worker` and `navigator`. `import.meta` is banned because Bun aliases `import.meta.env` to `process.env` [7]. Flag this to the owner as an ADR 0036 change.
- CI fails on any `biome-ignore` comment under `integrations/`, because a comment can suppress both plugin and rule diagnostics [10]. ast-grep has the same hole with `ast-grep-ignore` [16].

dependency-cruiser

- We write each boundary as a `forbidden` rule on paths, using `$1` group matching [8]:
  - `core-self-only`: from `^packages/core/` to anything outside `^packages/core/`.
  - `integration-scope`: from `^integrations/protocols/([^/]+)/` to anything outside `integrations/protocols/$1/`, `packages/core/` or `packages/integration-kit/`. This one rule covers "never infra" and "never each other".
  - `infra-only-from-apps`: from anything outside `^(apps|packages/infra)/` to `^packages/infra/`.
  - `mit-not-agpl`: from `^(packages/(core|contracts|integration-kit|design-tokens)|integrations)/` to `^(apps|packages/infra)/`.
  - `no-builtins-in-mit`: from the MIT paths to `dependencyTypes: ["core"]` or `couldNotResolve: true`. This closes the static `import "node:fs"` and `bun:*` gap that ADR 0036's globals list leaves open.
- We turn on `tsPreCompilationDeps` so type-only imports count toward the MIT → AGPL rule [9].
- For workspaces we match on paths, not dependency-cruiser's `license` condition. The paths come from REUSE.toml and ADR 0016. The `license` condition only sees modules that are actually imported [8], so it misses transitive dependencies.

Licenses

- The dependency license gate is a script over `bun pm licenses --json --prod --filter <workspace>`, run for each MIT workspace [19]. It parses SPDX expressions, accepts an `OR` when one branch is permissive, and fails on GPL, LGPL, AGPL, BUSL, SSPL and `Unknown`. It is built into Bun, so there is no ORT or license-checker to install.
- `reuse lint` from reuse-tool ≥ 6 (REUSE spec 3.3) runs in CI through `fsfe/reuse-action`, pinned by SHA [17][18].

Docs-lint

- lychee checks links: `--offline --include-fragments` on every PR, which covers relative paths and heading anchors, and a full external run on a schedule [20][21]. We do not use markdown-link-check, because it does not check anchors [23].
- markdownlint-cli2 checks Markdown structure [22].
- A repo script checks every backticked path and every `bun run <task>` in each `AGENTS.md`: it must exist, or its line must say *planned*. This automates the last fluff-test item ([writing-docs](../../writing-docs.md#fluff-test)).

Tests

- We use `bun test`, not Vitest. `bun run test` still runs Vitest on Node [26], but `infra` and `apps` call Bun APIs.
- Coverage uses the `text` and `lcov` reporters, with `coverageThreshold = { lines, functions }` in `bunfig.toml` [24].
- Snapshots live in `__snapshots__/`. Bun never writes a snapshot in CI unless `--update-snapshots` is passed [25], so a missing snapshot fails the run.

## Facts that constrain us

- TS 6.0 (2026-03-23) defaults to `strict`, `module: esnext`, `types: []`, `rootDir: .` and `noUncheckedSideEffectImports`. It deprecates `baseUrl`, `moduleResolution: node` and `outFile` [1].
- TS 7.0 (2026-07-08, npm 7.0.2) is written in Go and removes the options 6.0 deprecated. It has no stable API until 7.1. Tools that import `typescript` need `@typescript/typescript6` [2][3].
- dependency-cruiser 18.5.0 (2026-09-30) supports TypeScript ≤ 6.x. `swc` is an alternative parser [9].
- `allowImportingTsExtensions` requires `noEmit` or `emitDeclarationOnly` [4].
- Biome 2.5 (2026-06-05):
  - GritQL plugins accept path `includes`, and `register_diagnostic` defaults to `error` [10][11].
  - Plugins target JS, CSS and JSON only [10].
  - `noRestrictedGlobals` is off by default, and its default severity is warning [12].
- Biome turns on domains from `package.json` dependencies. The `project` domain, with `noImportCycles` and `noUndeclaredDependencies`, scans the whole repo [15].
- Bun 1.4 (2026-08-20), 1.4.2 (2026-09-05):
  - `bun test` coverage has line and function thresholds only, with no branch coverage. `statements` is accepted but not enforced [24][27].
  - Thresholds apply only with the text reporter, outside `--parallel` [24].
- REUSE 3.3:
  - When several `[[annotations]]` match a file, only the last match applies [17].
  - `aggregate` adds the table's licence to a file's own SPDX header instead of replacing it [17].
  - Files in `.gitignore` are not covered [17].
  - reuse-tool 6.0 scans whole files, so a doc that quotes an SPDX tag with its colon needs `REUSE-IgnoreStart` and `REUSE-IgnoreEnd` around it [18].
- lychee 0.24.2 (2026-05-01) and markdownlint-cli2 0.23.3 [21][22]. Vitest 5.0.3 [26].

## Open questions

- REUSE.toml annotates neither `package.json`, `bun.lock`, `mise.toml`, `biome.json`, `turbo.json`, `tsconfig*.json` nor `.github/**`, so `reuse lint` fails at M0 until the owner picks a licence for them.
- The current `aggregate` precedence adds VoidX MIT to math files ported from Uniswap with their own headers; `closest` may be meant ([ADR 0016](../../decisions/0016-licensing-and-dco.md)).
- Under Bun's isolated linker, workspace imports go through `node_modules` symlinks. We need to confirm that dependency-cruiser reports the real `packages/infra/...` path, so the path rules match.
- Does `bun pm licenses --filter` list transitive dependencies of a single workspace, and does it list sibling workspace packages?
- The `swc` parser in dependency-cruiser 18.3+ could drop the TS 6 alias. We need to confirm it resolves `exports` subpaths and type-only imports.
- Static linting cannot stop constructor escapes such as `(async () => {}).constructor`. Does ADR 0036 accept that residual risk until the sandbox process?
- Where the scheduled external lychee run reports failures, given that it opens no PR.

## Sources

1. TypeScript 6.0 release notes — https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html
2. Announcing TypeScript 7.0 — https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
3. Announcing TypeScript 7.0 RC — https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/
4. TSConfig reference — https://www.typescriptlang.org/tsconfig/
5. Turborepo, TypeScript guide — https://turborepo.dev/docs/guides/tools/typescript
6. Bun, TypeScript — https://bun.sh/docs/runtime/typescript
7. Bun, environment variables — https://bun.com/docs/runtime/environment-variables
8. dependency-cruiser rules reference — https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md
9. dependency-cruiser releases — https://github.com/sverweij/dependency-cruiser/releases
10. Biome linter plugins — https://biomejs.dev/linter/plugins/
11. Biome v2.5 — https://biomejs.dev/blog/biome-v2-5/
12. Biome noRestrictedGlobals — https://biomejs.dev/linter/rules/no-restricted-globals/
13. Biome continuous integration — https://biomejs.dev/recipes/continuous-integration/
14. Biome noLabelWithoutControl — https://biomejs.dev/linter/rules/no-label-without-control/
15. Biome linter domains — https://biomejs.dev/linter/domains/
16. ast-grep lint rules — https://ast-grep.github.io/guide/project/lint-rule.html
17. REUSE specification 3.3 — https://reuse.software/spec-3.3/
18. reuse-tool releases — https://github.com/fsfe/reuse-tool/releases
19. Bun, `bun pm` — https://bun.com/docs/pm/cli/pm
20. lychee — https://github.com/lycheeverse/lychee
21. lychee releases — https://github.com/lycheeverse/lychee/releases
22. markdownlint-cli2 — https://github.com/DavidAnson/markdownlint-cli2
23. markdown-link-check — https://github.com/tcort/markdown-link-check
24. Bun test coverage — https://bun.com/docs/test/code-coverage
25. Bun test snapshots — https://bun.com/docs/test/snapshots
26. Vitest guide — https://vitest.dev/guide/
27. Bun blog — https://bun.com/blog
