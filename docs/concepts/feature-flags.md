# Feature flags

How flags are defined, evaluated and removed ([ADR 0031](../decisions/0031-feature-flags-openfeature.md)).

## Files

| File | Holds |
|---|---|
| `flags/manifest.json` | Every flag: `key`, `type`, `default`, `owner`, `expires` (or `permanent: true`), `issue` |
| `flags/voidx.flagd.json` | Definitions in the flagd schema: variants, default variant, targeting, fractional rollouts |
| Override file named in `instance.config` | Instance-specific definitions, layered on top; wins over the repo file |
| Remote kill-switch file (official instance only) | Fetched over https; see below |

Typed flag keys are generated from the manifest; code never uses a string literal as a key.

## Remote kill-switch file

- Signed with minisign; the server verifies it against a public key pinned in `instance.config` and rejects anything unsigned.
- Accepts only `kill.*` keys; any other key rejects the whole file.
- Carries a monotonic `version`; an older version is ignored.
- A file that fails any check leaves the last known good file in force.
- Kill flags feed [effective availability](state-model.md#effective-availability).

## Kinds and names

| Kind | Name | Lifetime |
|---|---|---|
| Release | `release.<area>.<feature>` | Temporary; has `expires` |
| Kill switch | `kill.integration.<family>`, `kill.deployment.<deploymentId>`, `kill.sync.<chain>` | Permanent |
| Operations | `ops.<name>` | Permanent |

Keys are kebab-case segments and never reused.

## Where flags are evaluated

| Client | How |
|---|---|
| Web | On the server, in the route; the page carries only the result |
| Server and worker | `FeatureFlags` port; the worker evaluates once at job start and stores the result in the job payload |
| iOS, Android | OFREP from `server` with ETag; refreshed on foreground, after sign-in and every 5 minutes; last snapshot persisted |
| Widgets | Read the snapshot the app saved; code defaults otherwise; never fetch flags or refresh tokens |

## Evaluation context

| Field | Value |
|---|---|
| `targetingKey` | Salted hash of the account id; a random install id for guests |
| `kind` | `guest`, `account` |
| `instanceKind` | `official`, `selfhost` |
| `platform` | `web`, `ios`, `ipados`, `macos`, `android`, `widget`, `worker` |
| `appVersion` | Semantic version, for `sem_ver` targeting |
| `locale` | |

Never addresses, emails or raw ids.

## Rollouts

`fractional` on `targetingKey`, so a person stays in one cohort: 1% → 10% → 50% → 100%, then the flag is removed. SDK and flagd-core versions are pinned because a change in bucketing reshuffles cohorts.

## Rules

| Rule | Enforced by |
|---|---|
| A flag exists only through the manifest | CI: keys in code match the manifest |
| Every evaluation passes a default, and the default is the safe, old behaviour; a provider error serves the default | port signature + provider-down test |
| One flag per change; no nested flags; branch at the edge (route or `createRoot`), never inside domain logic | review; *convention* |
| Remove a release flag within one release of reaching 100%: code, manifest entry and definition together | CI fails on an expired `expires` and on unused manifest keys |
| A flag read by native apps is removed only after `minClientVersion` passes the last version that reads it | review |
| Flags never decide authorization, consent (OneSignal consent is a user setting) or instance configuration; those belong to auth, user settings and `instance.config`. Kill flags only switch integrations off | review |
| Tests cover both variants and provider-down, with `InMemoryProvider` through `createRoot` overrides | test review |
