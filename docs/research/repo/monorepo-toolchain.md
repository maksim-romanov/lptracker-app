---
app: repo
topic: Monorepo toolchain (Turborepo, Bun workspaces, mise)
checked: 2026-09-30
---

# Monorepo toolchain

Scope: M0 skeleton of the repo root: Turborepo, Bun workspaces, mise, CI and cloud-agent setup. Xcode selection and the Tuist setup live in [ios-app/skeleton.md](../ios-app/skeleton.md) and are not repeated here.

## Decisions

Versions and pins
- We pin Bun 1.4.2 exactly in `mise.toml`, because 1.4 is a Rust rewrite, and 1.4.1 and 1.4.2 already fixed regressions within two weeks of release. [12]
- We pin `turbo` 2.11.x exactly as a root devDependency. The minimum is 2.10.3, the first release that parses Bun 1.4's `lockfileVersion: 2`; older turbo drops workspace resolution. 2.11 adds `prune --production` and reads `devEngines.packageManager`. [1][3]
- We declare `"devEngines": { "packageManager": { "name": "bun", "version": "1.4.2" } }` in the root `package.json` and not the top-level `packageManager`, because Turborepo will deprecate that field. mise stays the source of truth for the Bun version. [1][10]
- We commit `mise.lock` (`[settings] lockfile = true`) and run CI with `MISE_LOCKED=1`, because the lockfile records per-platform checksums and URLs and fails on incomplete entries instead of re-resolving. [18]
- We pin Java with an explicit vendor (`java = "temurin-<major>"`), because a bare `21` resolves to `openjdk` through `java.shorthand_vendor`. The major version comes from Android research. [20]
- We pin Tuist (`aqua:tuist/tuist`, latest stable 4.210.0) and `xcodes` (`aqua:XcodesOrg/xcodes`, macOS only) in `mise.toml`. mise does not install Xcode itself. [21][27]
- We keep one task runner: `package.json` scripts plus Turborepo, with no `mise tasks`. ADR 0001 and every command in AGENTS.md go through `bun run`, and mise tasks would add a second graph with its own caching. [22][ADR 0001]

Workspaces and naming
- We use `"workspaces": ["apps/*", "packages/*", "integrations", "tools/*"]`, and every package is named `@voidx/<dir without the voidx- prefix>`: `@voidx/server`, `@voidx/worker`, `@voidx/ios`, `@voidx/android`, `@voidx/core`, `@voidx/contracts`, `@voidx/integration-kit`, `@voidx/infra`, `@voidx/design-tokens`, `@voidx/integrations`. Turborepo recommends a namespace for internal packages, and `--filter=@voidx/server` stays short. [10]
- We make `integrations/` one workspace, not one per family. `bun.lock` keys every workspace by path, so a new-family PR that added a workspace would change the lockfile and break the hard rule "an integration PR leaves lockfiles unchanged". [17][AGENTS.md]
- We keep Bun's isolated linker, set explicitly in `bunfig.toml` (`[install] linker = "isolated"`). It is the default for new workspaces, it blocks phantom dependencies that dependency-cruiser and the license check would otherwise miss, and on Bun Turborepo only misses cache for packages whose dependencies changed. [13][11]
- We set `[install] minimumReleaseAge = 259200` (3 days) in `bunfig.toml`, so a manual `bun add` gets the same delay ADR 0037 gives Renovate. [14][ADR 0037]
- We put shared versions (TypeScript, Zod, Hono, test tooling) in the root `workspaces.catalog` and reference them as `"catalog:"`, so a bump is one line. [15]

Task graph
- We define `codegen` with `dependsOn: ["^codegen"]` and outputs set to the generated paths (`openapi.json`, `openapi.*.json`, `**/*.schema.json`, `Generated/**`, `**/*.gen.*`). `typecheck`, `lint` and `test` each depend on `codegen` and `^codegen`. `check` is an aggregate task with no script: `dependsOn: ["typecheck", "lint", "test"]`. Turborepo runs nothing for a package without a matching script but still resolves the dependencies. [4][5]
- We make `typecheck` depend on a transit node rather than `^typecheck`, because internal packages export source. Dependents still re-check when a dependency changes, and the tasks run in parallel. [5]
- Native wrappers (`apps/ios-app/package.json`, `apps/android-app/package.json`, both `private`) list `@voidx/contracts` and `@voidx/design-tokens` as `workspace:*` devDependencies. `--affected` follows the package graph, not `pkg#task` edges, so without these entries a contract change would not select the native apps. Each app has a package `turbo.json` (`extends: ["//"]`) that lists its inputs (Swift/Kotlin sources, `Project.swift`, Gradle files) and `outputs: []`. [4][6][ADR 0001]
- We leave the future flag `affectedUsingTaskInputs` off, because open bugs make it misselect tasks: `./` globs never match (#14130), and `**/` mixed with `$TURBO_ROOT$` selects too much (#14340). [4][25]
- Root scripts forward flags: `"check": "turbo run check"`, so `bun run check --affected` and `bun run check --filter=<pkg>` reach turbo. Bun passes flags after the script name to the script; a flag before the name is Bun's own `--filter`. [16]
- `test` runs `bun test` per workspace without `--changed`, because Turborepo already chooses what to run and caches by input hash. `--shard` and `--parallel` (Bun 1.4) stay available for a slow workspace. [12]

CI and cache
- PR jobs check out with full history (`fetch-depth: 0`, or `--filter=blob:none`), not the `fetch-depth: 2` the Turborepo guide shows, because with a shallow clone `--affected` marks every package as changed. [6][9]
- M0 has no remote cache. PR jobs get no secrets (ADR 0037), so `TURBO_TOKEN` is unavailable there. We cache `.turbo` with `actions/cache` (key `turbo-${{ github.sha }}`, restore prefix) and set `cacheMaxSize`. [8][9][2][ADR 0037]
- Toolchains in CI come only from `jdx/mise-action`, pinned by SHA with `install_args: --locked`, and not `oven-sh/setup-bun`, so CI and laptops read the same `mise.toml`. [19][ADR 0037]
- Server and worker images build from `turbo prune @voidx/server --docker --production` followed by `bun install --frozen-lockfile`. For Bun repos, prune removes excluded workspaces from the manifests and the lockfile, so the frozen install succeeds. [7][1]

## Facts that constrain us
- Turborepo 2.11 (2026-09-18): native workspace discovery for Cargo, uv and go.work only (experimental). Swift and Gradle still need `package.json` wrappers. [1]
- Turborepo 2.10: `--affected` and `--filter` intersect; structured inputs `{ "mode": "jit" | "dependencyOutputs" }` defer hashing until upstream outputs exist; `cacheMaxAge`/`cacheMaxSize` evict the local cache. [2][4]
- `--affected` defaults to `main...HEAD`; `TURBO_SCM_BASE`/`TURBO_SCM_HEAD` override it. It works at package level: any changed file selects all of that package's tasks. [6]
- `turbo prune` does not copy `globalDependencies` files unless the `pruneIncludesGlobalFiles` future flag is set. [7]
- Remote cache: Vercel's is free on every plan. To self-host, implement the v8 OpenAPI spec (`ducktors/turborepo-remote-cache`, `brunojppb/turbo-cache-server`, Tapico). HMAC artifact signing uses `signature: true` and `TURBO_REMOTE_CACHE_SIGNATURE_KEY`. [8]
- Bun 1.4: `bun test --parallel/--isolate/--shard/--changed`, `--filter` on `bun add/remove/update`, `bun pm licenses`, and an opt-in global virtual store (`install.globalStore`). Projects created before 1.3.2 keep hoisted installs. [12][13][14]
- Isolated installs can break tools that assume a flat `node_modules` or scan it directly; the fallback is `linker = "hoisted"`. [13]
- Claude Code cloud: Ubuntu 24.04 x86_64 with Bun, Node 22 and OpenJDK 21 preinstalled. **Bun has known proxy issues fetching packages.** The GitHub proxy returns 403 on release-asset downloads from repositories not attached to the session, and mise core Bun downloads from `oven-sh/bun` releases. mise's domains are not on the default allowlist. A setup script is cached only if it finishes in about 5 minutes. [23]
- Codex cloud: Linux `universal` image; the setup script has internet, the agent phase has none by default; the container is cached for up to 12 h. [24]
- Neither cloud runs macOS, so `@voidx/ios` checks cannot run there. [23][24]

## Conflicts with docs
- **ADR 0024** says cloud agents install the toolchain "through mise". In Claude Code cloud, mise's Bun download is blocked by the GitHub proxy (see Facts). A workaround such as the preinstalled Bun or a Custom network allowlist is unverified. Owner decides. [23]
- **Prompt vs architecture.md**: the brief lists `tools/voidx-cli`; architecture.md puts "the `voidx` CLI" inside `packages/integration-kit`. The workspace globs above include `tools/*` only if the owner picks the former.
- **ADR 0001** says native `dependsOn` is "declared by hand". The `workspace:*` devDependencies above are still by hand but go through `package.json`, and they change `bun.lock` once in M0. Refinement, not a reversal.

## Open questions
- Does Bun 1.4 read or enforce `devEngines.packageManager`, or only Turborepo? If only Turborepo, add a CI check that it equals the `mise.toml` pin.
- Does `turbo prune` copy `bunfig.toml`, so `linker` and `minimumReleaseAge` apply inside the Docker build?
- On a Linux machine, should `@voidx/ios#check` fail loudly or be excluded (`--filter=!@voidx/ios`)? A wrapper that exits 0 would be cached as a pass, unless the OS is added to the task hash through `env`.
- Does Renovate update Bun catalogs and `mise.lock` in one PR?
- Is Node needed at all? Only if a tool (dependency-cruiser, oasdiff wrapper) fails under Bun.
- When CI time justifies a remote cache: Vercel (free, but a token only on `push` to main) or self-hosted with signing.

## Sources
1. Turborepo 2.11 — https://turborepo.dev/blog/2-11
2. Turborepo 2.10 — https://turborepo.dev/blog/2-10
3. vercel/turborepo PR 13119, accept Bun lockfile v2 (shipped 2.10.3) — https://github.com/vercel/turborepo/pull/13119
4. Turborepo configuration reference — https://turborepo.dev/docs/reference/configuration
5. Turborepo, configuring tasks (transit nodes) — https://turborepo.dev/docs/crafting-your-repository/configuring-tasks
6. Turborepo `run` reference, `--affected` — https://turborepo.dev/docs/reference/run
7. Turborepo `prune` reference — https://turborepo.dev/docs/reference/prune
8. Turborepo remote caching and self-hosting — https://turborepo.dev/docs/core-concepts/remote-caching
9. Turborepo GitHub Actions guide — https://turborepo.dev/docs/guides/ci-vendors/github-actions
10. Turborepo, structuring a repository — https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
11. Turborepo 2.6, Bun stable — https://turborepo.dev/blog/turbo-2-6
12. Bun 1.4 release notes and blog index — https://bun.com/blog/bun-v1.4 , https://bun.com/blog
13. Bun isolated installs — https://bun.com/docs/pm/isolated-installs
14. bunfig.toml reference — https://bun.com/docs/runtime/bunfig
15. Bun catalogs — https://bun.com/docs/pm/catalogs
16. `bun run` — https://bun.com/docs/cli/run
17. Bun text lockfile — https://bun.com/blog/bun-lock-text-lockfile
18. mise.lock — https://mise.jdx.dev/dev-tools/mise-lock.html
19. mise in CI — https://mise.jdx.dev/continuous-integration.html
20. mise Java — https://mise.jdx.dev/lang/java.html
21. mise registry: tuist, xcodes — https://github.com/jdx/mise/blob/main/registry/tuist.toml , https://github.com/jdx/mise/blob/main/registry/xcodes.toml
22. mise tasks — https://mise.jdx.dev/tasks/
23. Claude Code cloud environments — https://code.claude.com/docs/en/cloud-environments
24. Codex cloud environments — https://learn.chatgpt.com/docs/environments/cloud-environment
25. turborepo issues 14130, 14340 — https://github.com/vercel/turborepo/issues/14130 , https://github.com/vercel/turborepo/issues/14340
26. Bun workspaces — https://bun.com/docs/pm/workspaces
27. mise-versions: tuist — https://mise-versions.jdx.dev/tools/tuist
