# 0036 · Integration code runs with capabilities only, under maintainer review

- Status: proposed
- Deciders: Maksim Romanov

## Context

Community adapters run inside `server` and `worker`, next to database, RPC and OneSignal keys. A malicious or careless adapter could read environment variables, call the network or spawn processes. dependency-cruiser checks static imports only.

## Options

- **In process, capability context, lint and review.**
- **A separate sandbox process** without environment or network, talking to core over IPC.

## Decision

Chosen **in process with capabilities, lint and review**, because it keeps the MVP simple and fast while closing the obvious paths; a sandbox process stays open for later.

- Adapters receive only `AdapterContext`: a `ChainReader` pinned to `readBlock`, the configured index sources, the staking plugin, a logger, a clock ([concepts/integration-model.md](../concepts/integration-model.md)).
- Biome bans `fetch`, `process`, `Bun`, `require`, dynamic `import()`, `import.meta`, `eval` and `globalThis` in `integrations/`, plus the longer list in [research](../research/repo/ts-quality-gates.md) ([0049](0049-typescript-toolchain.md)).
- Every new or changed `adapter.ts` needs a maintainer's review. Until adapters run sandboxed, only maintainers merge a PR that changes `adapter.ts`.
- CODEOWNERS lists maintainers only. A bot mentions the integration owners named in the manifest; owner handles are validated as GitHub usernames.
- CODEOWNERS requires a maintainer's review for gate and config paths: `.github/`, `.claude/`, `scripts/guard/**`, `biome.json`, `biome/**`, `.dependency-cruiser.*`, `turbo.json`, the root `package.json`, `bunfig.toml`, `mise.toml`, `canaries/**` and `packages/integration-kit`.
- CI path scope is an allowlist: an integration PR may touch `integrations/**` and the app files the [promise](../concepts/integration-model.md#promise) allows; any other path fails the guard. So it cannot change core packages, gates or agent instructions (`AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/`, `.mcp.json`).
- Chain-file URLs (`publicRpcs`, `explorer`, `logo`) are https only and must be on a maintainer allowlist; private IP ranges are blocked at connect time.
- Token logo fetches pass the [fetch guard](../concepts/prices-and-logos.md#fetch-guard).

## Consequences

- Review load grows with new families; pure forks need no `adapter.ts` and no code review beyond data.
- Before M3a the owner decides the sandbox: each adapter in a Bun subprocess with `env: {}` and no network, talking to core over IPC. Also move earlier if an adapter needs broader capabilities or review cannot keep up.
- CI details are in [0037](0037-ci-and-supply-chain.md).
