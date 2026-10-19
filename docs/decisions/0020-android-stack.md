# 0020 · Android app stack

- Status: proposed
- Deciders: Maksim Romanov

## Context

A native Kotlin app for phones and tablets with a home-screen widget. Agents need a mainstream structure with fast, compile-time feedback, and dependencies must be swappable in tests.

## Options

- **ViewModel + StateFlow with Hilt**.
- **ViewModel + StateFlow with Metro**.
- **Circuit or Molecule presenters**.
- **Kotlin Multiplatform shared with iOS**.

## Decision

Chosen **ViewModel + StateFlow with Metro**, because it is the most widely known pattern and Metro checks the graph at compile time.

- Compose, Navigation 3, unidirectional data flow.
- minSdk 26, targetSdk 36 (Play requirement; predictive back and edge-to-edge enforced).
- Now in Android module layout (`:app`, `:feature:*`, `:core:*`, `:widget`) with convention plugins; Kotlin and Metro are pinned together because Metro is a compiler plugin.
- Metro reaches ViewModels through `metrox-viewmodel-compose`, workers through a custom `WorkerFactory`, and the Glance widget reads the graph from `Application`. A Gradle check fails if any Hilt artifact resolves.
- Cache and guest watchlist: DataStore with a kotlinx `Serializer`, per server URL. Tokens are encrypted with Tink and a Keystore key and excluded from backup. Room waits until history exists.
- Lint: ktlint and compose-lints, plus custom Lint rules for literal animation values and missing content descriptions.
- WorkManager for widget refresh, Glance for the widget.
- Ktor with the OkHttp engine; the generated client is committed under `Generated/`. Neither Fabrikt nor openapi-generator produces open enums, so wire enums are strings wrapped in hand-written value classes and the JSON decoder ignores unknown keys.
- Push through the OneSignal SDK ([0014](0014-push-via-onesignal.md)).
- `applicationId` and the App Links host come from one Gradle property; working value `xyz.depthly.voidx` ([0044](0044-domain-as-configuration.md)).
- UI tests and E2E flows configure Debug builds through intent extras; `testTagsAsResourceId` is set once at the root ([0048](0048-e2e-testing.md)).
- Sign-in: Credential Manager on the official instance, with `assetlinks.json` listing every signing fingerprint including a committed debug keystore; AppAuth with a Custom Tab and PKCE on self-hosted instances ([0012](0012-accounts-guests-and-passkeys.md)).
- No Kotlin Multiplatform now; `:core:model` stays free of Android imports so it remains possible.

## Consequences

- Applies when Android starts after the MVP ([0056](0056-android-after-the-mvp.md)).
- Features see only the public repository interfaces of `:core:data`; implementations are `internal` and `:core:network` is an `implementation` dependency, enforced by Gradle visibility and a module-graph assertion.
- Related: [0005](0005-dependency-injection.md), [0022](0022-accessibility.md), [0023](0023-motion.md).
