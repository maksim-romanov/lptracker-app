---
app: android-app
topic: Design audit findings (input for the research gate)
checked: 2026-09-30
---

# Design audit findings

Findings from the senior Android review of the design docs, to be confirmed or overturned by the app's research gate.

## Decisions
- We set minSdk 26 and targetSdk 36, because Google Play requires target 36 for updates from 2026-08-31, which also enforces edge-to-edge and predictive back. [owner decision, 1]
- We model open enums on the wire as `type: string` plus `x-known-values` and hand-write `@JvmInline value class` wrappers in `:core:model`, because neither Fabrikt nor openapi-generator's Kotlin client decodes unknown enum values safely (Fabrikt falls back to `String`; openapi-generator turns them into null). `Json { ignoreUnknownKeys = true; explicitNulls = false }`; `extension` stays `JsonObject`. [2, 3]
- We revalidate guest `POST` reads with `knownVersion` in the body and a `{ notModified: true }` answer, because HTTP 304 applies only to GET and HEAD and OkHttp's cache ignores POST.
- We run Macrobenchmark nightly on Firebase Test Lab or a physical device and gate releases on it, not PRs; baseline profiles are generated on Gradle Managed Devices in CI, because ±10% on hosted emulators flakes.
- We add modules `:baselineprofile`, `:core:testing` (fake graph), `:core:flags` (OFREP wrapper) and `:feature:<x>:api` route keys so features never depend on each other.
- We wire Metro into ViewModels with `metrox-viewmodel-compose`, into WorkManager through a custom `WorkerFactory`, and into the Glance receiver through the graph held by `Application`; Kotlin and Metro upgrades are grouped in Renovate; a Gradle check fails if any Hilt artifact resolves (ADR 0020); one reference feature is the pattern to copy. [4]
- We store the snapshot and guest watchlist in DataStore with a kotlinx `Serializer`, and tokens with Tink and a Keystore key excluded from backup in `dataExtractionRules`, because DataStore gives atomic writes and a `Flow`, and `security-crypto` is deprecated.
- We lint with ktlint, slack `compose-lints` and custom Lint rules for literal `tween`/`spring` durations and missing `contentDescription`, because detekt 2.0 is alpha against Kotlin 2.4. [5]
- We depend on OneSignal `core` and `notifications` only, and ship an F-Droid flavour without FCM where push is off. [6]
- We keep the Kotlin OFREP provider (0.0.x) behind the wrapper and design so a small hand-written client can replace it. [7]

## Facts that constrain us
- Credential Manager accepts a passkey only if `assetlinks.json` on the RP id lists `get_login_creds` with every signing SHA-256: Play App Signing, upload key and a committed shared debug keystore; otherwise contributor builds cannot sign in. Before Android 14, passkeys need Google Play Services. The self-hosted callback URI is `voidx://auth`; PKCE uses AppAuth-Android. [8]
- mise does not install the Android SDK; cloud agents need an `sdkmanager` setup step with licences. CI uses `gradle/actions/setup-gradle`, the configuration cache, and KVM-enabled `ubuntu-latest` with ATD images for `connectedCheck`.
- Play requires the Financial features declaration (non-custodial tracker), a Data safety entry for OneSignal ids and watched addresses, in-app and web account deletion, and runtime `POST_NOTIFICATIONS`.
- 15-minute WorkManager widget refreshes are deferred by Doze and standby buckets; freshness is best effort. A push-triggered refresh needs a OneSignal `INotificationServiceExtension` enqueuing expedited work; `glance-appwidget-testing` covers widget accessibility.
- Android's only reduced-motion signal is animator scale 0 ("Remove animations"); a test runs at scale 0.

## Open questions
- Whether Firebase Test Lab or a self-hosted device is cheaper for nightly benchmarks at our budget.
- Exact module map and mermaid graph for `docs/specs/android-app-plan.md`.

## Sources
1. Play target API requirements — https://support.google.com/googleplay/android-developer/answer/11926878
2. Fabrikt open enums issue — https://github.com/fabrikt-io/fabrikt/issues/374
3. openapi-generator unknown enum handling — https://github.com/OpenAPITools/openapi-generator/issues/22662
4. Metro is stable — https://www.zacsweers.dev/metro-is-stable/
5. detekt releases — https://github.com/detekt/detekt/releases
6. OneSignal Android setup — https://documentation.onesignal.com/docs/en/android-sdk-setup
7. OFREP Kotlin provider — https://mvnrepository.com/artifact/dev.openfeature.contrib.providers/ofrep
8. RP ID and asset links — https://web.dev/articles/webauthn-rp-id
