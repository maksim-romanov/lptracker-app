# 0031 · Feature flags through OpenFeature with file-defined flags

- Status: proposed
- Deciders: Maksim Romanov

## Context

The owner ships behind feature flags: gradual rollouts, kill switches for integrations and chains, and safe experiments on every client. Flags must work on the official and self-hosted instances with no paid service, stay reviewable, and not tie the code to one vendor.

## Options

- **flagd-format files in the repo, evaluated in process; the server serves OFREP to native apps.**
- **GO Feature Flag relay proxy** as a separate container.
- **Flagsmith or Unleash**, each with its own database and UI.

## Decision

Chosen **flagd-format files evaluated in process**, because it adds no service to run, keeps every flag change in a reviewed PR, and behaves the same on every instance. OpenFeature is the API, so moving to another provider later is a change in `createRoot` only.

- Core has a `FeatureFlags` port with typed keys generated from the flag manifest; core never imports `@openfeature/*`.
- The server and worker evaluate with `@openfeature/server-sdk` and `@openfeature/flagd-core` on an isolated API instance built in `createRoot`; tests use `InMemoryProvider` through overrides.
- `server` serves `POST /ofrep/v1/evaluate/flags` to native apps; the Swift and Kotlin OFREP providers sit behind a thin app wrapper.
- Self-hosters override flags with a file named in `instance.config`. The official instance may add a remote kill-switch file: signed with minisign against a pinned key, `kill.*` keys only, monotonic version, last-known-good kept.
- `kill.*` flags feed the effective availability of deployments ([0017](0017-state-model.md)).
- Integration lifecycle stays in manifests and `instance.config` ([0017](0017-state-model.md)); `/api/v1/meta` `features` stays instance capabilities ([0010](0010-wire-contract.md)).

## Consequences

- No UI for flags; changes go through PRs or the override file, and the server reloads the file without a restart.
- Swift and Kotlin SDKs are alpha: versions are pinned and hidden behind a wrapper.
- Bun is not an officially listed runtime for the server SDK; a CI smoke test covers it.
- A UI can come later with GO Feature Flag in a superseding ADR, without code changes outside `createRoot`.
- Details and rules: [concepts/feature-flags.md](../concepts/feature-flags.md).
