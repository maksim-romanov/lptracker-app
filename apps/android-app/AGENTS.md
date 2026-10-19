# android-app

Jetpack Compose app plus Glance widget. Design and plan: `docs/research/android-app/` and, once approved, `docs/specs/android-app-plan.md`. Stack: [ADR 0020](../../docs/decisions/0020-android-stack.md).

## Commands (*planned*)

- `bun run check` — `codegen`, `typecheck`, `lint`, `test`; wraps `./gradlew assembleDebug testDebugUnitTest lint ktlintCheck verifyRoborazziDebug`. Needs the Android SDK.
- `./gradlew connectedDebugAndroidTest` — Compose UI tests with `enableAccessibilityChecks()` on an emulator; CI runs it in `e2e-android`.

## Rules

- Code style: [code-style](../../docs/concepts/code-style.md#kotlin). *Convention* where no lint rule exists.
- Features see only the public repository interfaces of `:core:data` and `:core:model`; implementations are `internal` and `:core:network` is an `implementation` dependency of `:core:data`. Enforced by Gradle visibility and a module-graph assertion (*planned*).
- Decoding never fails on an unknown `type`, `kind` or `status`; unknown families render from the display descriptor. Enforced by golden decode tests.
- `:core:model` has no Android imports. Enforced by the module being a pure Kotlin JVM module.
- Accessibility and motion rules: [ADR 0022](../../docs/decisions/0022-accessibility.md), [ADR 0023](../../docs/decisions/0023-motion.md); enforced on PRs by Compose accessibility checks, Roborazzi and smoke journeys; Macrobenchmark gates releases.

## Tools

Use Google's Android CLI (`--no-metrics`) to inspect a running app: `android layout`, `android screen capture`. Emulators only; from `adb shell` only `input` and `screencap`; no release builds or signing. Gemini in Android Studio reads these `AGENTS.md` files; commit no `GEMINI.md`. Setup: [CONTRIBUTING.md](../../CONTRIBUTING.md#recommended-tools).

## Stop and ask

- A screen needs data the API does not return.
- A new third-party dependency or a Kotlin version bump (Metro is a compiler plugin).
