---
app: android-app
topic: Android project skeleton (M0)
checked: 2026-09-30
---

# Android project skeleton (M0)

Extends [audit-notes.md](audit-notes.md); decisions there (minSdk/targetSdk, open enums, lint choice, modules, Metro wiring) still hold unless contradicted below.

## Decisions
- We pin AGP 9.4.0, because it is the current stable 9.x, needs Gradle ≥ 9.6.0 and JDK ≥ 17, and supports compileSdk up to 37. [1]
- We pin the Gradle wrapper to 9.7.0, not 9.8.0, because Kotlin 2.4.20 declares support up to Gradle 9.7.0 and 9.8.0 shipped on 2026-09-29. [6, 7]
- We use AGP built-in Kotlin: no `org.jetbrains.kotlin.android`, `kotlin { compilerOptions }` instead of `kotlinOptions`, Kotlin sources through `android.sourceSets` or the variant API. We never set `android.builtInKotlin=false` or `android.newDsl=false`, because AGP 10 (late 2026) removes both opt-outs. [2, 3]
- We pin Kotlin 2.4.20 by putting `org.jetbrains.kotlin:kotlin-gradle-plugin` on the build-logic classpath, because built-in Kotlin otherwise uses the KGP AGP depends on, and `kotlin-serialization` and the Compose compiler plugin must match the Kotlin version. [4, 6]
- We pin Metro 1.4.5 with Kotlin 2.4.20 and bump them together, because Metro 1.2.0+ supports Kotlin 2.4.10/2.4.20 and supports newer Kotlin only on a best-effort basis. [12, 13]
- We put convention plugins in a `build-logic` included build (`pluginManagement { includeBuild("build-logic") }`), not `buildSrc`, because any change in `buildSrc` invalidates configuration for the whole build. [9]
- We keep every version in `gradle/libs.versions.toml`, and convention plugins read the catalog, so Renovate groups Kotlin, the Compose compiler plugin and Metro in one bump. [9, 13]
- Convention plugins: `voidx.android.application`, `voidx.android.library`, `voidx.android.compose`, `voidx.android.feature` (library + compose + Metro + `metrox-viewmodel-compose`), `voidx.jvm.library` (`org.jetbrains.kotlin.jvm` + `com.android.lint`), `voidx.metro`, `voidx.ktlint`. `com.android.lint` is there because Android Lint and compose-lints only run on a JVM module with that plugin. [15, 22]
- We set compileSdk 37, targetSdk 36, minSdk 26, because Compose 1.12 (BOM 2026.09.00) and Navigation 3 1.2.0 need compileSdk 37 and AGP ≥ 9.1.1, while Play requires target 36. [10, 11, 29]
- We use Compose BOM 2026.09.00 and Navigation 3 1.2.0 (`navigation3-runtime` in `:feature:*:api`, `navigation3-ui` in `:app`). 1.2.0 adds shared elements between scenes, predictive back during forward transitions and `List<SceneStrategy>`, which ADR 0023 needs. [10, 11]
- Route keys are `@Serializable data object/class … : NavKey` in `:feature:portfolio:api`. That module depends only on `navigation3-runtime` and `:core:model`, so features never depend on each other. [11]
- ViewModels use `@ContributesIntoMap(AppScope::class)` + `@ViewModelKey` and are read with `metroViewModel()` via `LocalMetroViewModelFactory`. The graph lives in `Application`; `:core:testing` provides a fake graph. [14]
- We generate the Kotlin client with Fabrikt (kotlinx.serialization models + Ktor client) and commit it under `Generated/` in `:core:network`. Fabrikt has a Ktor target and kotlinx support. openapi-generator's `jvm-ktor` pins Ktor 1.6.7 with Gson/Jackson, and its Kotlin enums turn unknown values into `null` since 7.18.0. [16, 17, 19, 20]
- Wire enums reach Kotlin as `String` because the contract emits `type: string` + `x-known-values` without `enum`; `:core:model` wraps them in hand-written `@JvmInline value class`es. Fabrikt's open-enum support (#374) is still open in the backlog. [18, ADR 0010]
- We lint with Android Lint (`warningsAsErrors`, a11y checks as errors) + compose-lints 1.6.0 via `lintChecks` + ktlint, and we add no detekt, because detekt's only Kotlin 2.4/AGP 9 build is `2.0.0-alpha.6`. [21, 22, 23]
- We pin ktlint 1.8.0 (`com.pinterest.ktlint`), because 2.0 is still `ALPHA-4` (now `io.github.ktlint`, built on Kotlin 2.4.0). Until 2.0 is stable we avoid Kotlin 2.4-only syntax such as explicit backing fields. [21]
- We use Roborazzi 1.76.0 on Robolectric 4.17 for JVM screenshot tests, because Robolectric 4.17 supports API 37, so compileSdk 37 needs no `@Config(sdk=…)` override. [25, 26]
- `:baselineprofile` is a `com.android.test` module with `androidx.baselineprofile` and a Gradle Managed Device; `:app` applies the same plugin and declares `baselineProfile(project(":baselineprofile"))`. Generation stays out of `check`. [30]
- We enable `org.gradle.configuration-cache=true` from the first commit and never commit `problems=warn`, because Gradle 9 leaves the cache off by default and calls `warn` a migration aid. CI may use `org.gradle.configuration-cache.read-only=true` on ephemeral runners. [8]
- We need no KSP or kapt in M0, because Metro is a compiler plugin and Room is deferred (ADR 0020). Built-in Kotlin also replaces kapt with `com.android.legacy-kapt`, which we avoid. [2]
- M0 is green when `./gradlew assembleDebug testDebugUnitTest lint ktlintCheck verifyRoborazziDebug` passes with the configuration cache on, and a regenerated client matches `Generated/`.

## Module map (M0)
| Module | Plugin | Depends on |
|---|---|---|
| `:app` | application, compose, metro | all `:feature:*`, `:core:designsystem`, `:core:data`, `:core:flags`, `:widget` |
| `:widget` | library, compose (Glance), metro | `:core:data`, `:core:model` |
| `:feature:portfolio` | feature | `:feature:portfolio:api`, `:core:data`, `:core:designsystem` |
| `:feature:portfolio:api` | library | `navigation3-runtime`, `:core:model` |
| `:core:model` | jvm.library (no Android) | kotlinx-serialization |
| `:core:data` | library, metro | `api(:core:model)`, `implementation(:core:network)` |
| `:core:network` | library, metro | Ktor OkHttp, `Generated/` client |
| `:core:designsystem` | library, compose | generated Compose tokens (ADR 0027) |
| `:core:flags` | library, metro | OFREP wrapper (audit-notes) |
| `:core:testing` | library | fakes for `:core:data` repos, fake Metro graph |
| `:baselineprofile` | `com.android.test` + baselineprofile | `targetProjectPath = ":app"` |

## Facts that constrain us
- AGP 9.4: default and minimum Gradle 9.6.0, build-tools 36.0.0, JDK 17, max compileSdk 37. AGP 10 makes the new Variant API mandatory; `android.newDsl.optOut` exists only for migration. [1]
- AGP 9.0 depends on KGP 2.2.10 at runtime; a newer KGP on the buildscript/build-logic classpath wins. [4]
- Kotlin 2.4.0 shipped 2026-06, 2.4.10 on 2026-07-14, 2.4.20 on 2026-09-07. [6]
- Metro's runtime targets Kotlin 2.2 and its Gradle plugin targets Kotlin 2.0. IDE support needs K2 mode and the registry flag `kotlin.k2.only.bundled.compiler.plugins.enabled=false`. [13, 15]
- compose-lints 1.6.0 is built against lint 32.2.1 / Kotlin 2.2. [22]
- Konsist's latest release is 0.17.3 (2024-12-08), older than Kotlin 2.3 and 2.4. [24]
- `sdkmanager` needs `cmdline-tools/latest/` under the SDK root and `sdkmanager --licenses` on headless machines, and Google now calls it deprecated in favour of `android sdk` from the Android CLI. [27, 28]
- mise registry has `android-sdk` (vfox plugin for command-line tools) and `android-cli` (http backend); neither installs platforms or accepts licences by itself. [27, 28, 31]
- Navigation 3 1.2.0 minSdk is 23. [11]

## Conflicts with existing docs (flagged, not resolved)
- `apps/android-app/AGENTS.md` says `check` wraps `./gradlew check lint detekt verifyRoborazziDebug`; ADR 0020 and audit-notes say ktlint + compose-lints with no detekt. [23]
- Resolved: ADR 0020 now bans Hilt with a Gradle check that fails if any Hilt artifact resolves, instead of Konsist.
- audit-notes prefers ktlint because detekt is alpha against Kotlin 2.4, but stable ktlint (1.8.0) is also older than Kotlin 2.4; only its 2.0 alpha is current. [21, 23]
- Roadmap puts widgets in M6 and an "E2E harness on the mock API" in M0; the module list here has `:widget` in M0; the E2E harness is Maestro flows in `e2e/`, see [e2e-testing](../repo/e2e-testing.md).

## Open questions
- Does Fabrikt 27.14.0 handle the OpenAPI 3.1 constructs `@hono/zod-openapi` emits (`type: [x, "null"]`, `const`, `anyOf`)? Verify on the first draft `openapi.json` before committing to it; the fallback is a hand-written Ktor client.
- Which ktlint Gradle integration (jlleitschuh `ktlint-gradle`, kotlinter, or the mise-installed CLI) is configuration-cache safe on Gradle 9.7?
- Resolved in [sdk-bootstrap](sdk-bootstrap.md): mise `android-sdk` + `sdkmanager`, cmdline-tools 22.0.
- Which JDK LTS (17, 21 or 25) to pin in mise; AGP needs ≥ 17 and Robolectric on JDK ≥ 17 may need extra `jvmFlags`. [1, 26]
- Is `:widget` an empty Glance stub in M0 or added in M6?
- Is AGP 10 stable before M1, and do we wait for it?

## Sources
1. AGP 9.4.0 release notes — https://developer.android.com/build/releases/agp-9-4-0-release-notes
2. Migrate to built-in Kotlin — https://developer.android.com/build/migrate-to-built-in-kotlin
3. Update your Kotlin projects for AGP 9.0 (JetBrains) — https://blog.jetbrains.com/kotlin/2026/01/update-your-projects-for-agp9/
4. AGP 9 built-in Kotlin version management — https://ntsk.jp/blog/agp9-builtin-kotlin-version-management/
5. AGP 9.0 release notes — https://developer.android.com/build/releases/agp-9-0-0-release-notes
6. Kotlin 2.4.20 released — https://blog.jetbrains.com/kotlin/2026/09/kotlin-2-4-20-released/
7. Gradle 9.8.0 release notes — https://docs.gradle.org/current/release-notes.html
8. Enabling the configuration cache — https://docs.gradle.org/current/userguide/configuration_cache_enabling.html
9. Sharing build logic between subprojects — https://docs.gradle.org/current/userguide/sharing_build_logic_between_subprojects.html
10. Jetpack Compose August '26 release — https://android-developers.googleblog.com/2026/08/jetpack-compose-august-2026-release.html ; BOM — https://developer.android.com/develop/ui/compose/bom
11. Navigation 3 release notes — https://developer.android.com/jetpack/androidx/releases/navigation3
12. Metro changelog — https://github.com/ZacSweers/metro/blob/main/CHANGELOG.md
13. Metro compatibility — https://zacsweers.github.io/metro/latest/compatibility/
14. MetroX ViewModel — https://zacsweers.github.io/metro/latest/metrox-viewmodel/
15. Metro installation — https://zacsweers.github.io/metro/latest/installation/
16. Fabrikt — https://github.com/fabrikt-io/fabrikt
17. Fabrikt releases — https://github.com/fabrikt-io/fabrikt/releases
18. Fabrikt open enums issue #374 — https://github.com/fabrikt-io/fabrikt/issues/374
19. openapi-generator Kotlin generator — https://openapi-generator.tech/docs/generators/kotlin/
20. openapi-generator unknown enum → null — https://github.com/OpenAPITools/openapi-generator/issues/22662
21. ktlint changelog — https://github.com/pinterest/ktlint/blob/master/CHANGELOG.md
22. compose-lints — https://slackhq.github.io/compose-lints/ ; releases — https://github.com/slackhq/compose-lints/releases
23. detekt releases — https://github.com/detekt/detekt/releases
24. Konsist on Maven Central — https://repo1.maven.org/maven2/com/lemonappdev/konsist/maven-metadata.xml
25. Roborazzi releases — https://github.com/takahirom/roborazzi/releases
26. Robolectric releases — https://github.com/robolectric/robolectric/releases
27. sdkmanager — https://developer.android.com/tools/sdkmanager
28. Android CLI — https://developer.android.com/tools/agents/android-cli
29. Play target API requirements — https://support.google.com/googleplay/android-developer/answer/11926878
30. Create Baseline Profiles — https://developer.android.com/topic/performance/baselineprofiles/create-baselineprofile
31. mise registry — https://mise.jdx.dev/registry.html
