# 0056 · Android ships after the MVP

- Status: proposed
- Deciders: Maksim Romanov

## Context

The MVP was planned for web, the Apple family and Android at once. Android doubles every client step, needs Gradle and an emulator next to Xcode and the iOS Simulator on one 24 GB Mac that runs the agents, and adds owner inputs (SDK licences, signing fingerprints) before any user benefit.

## Options

- **Android in the MVP**, as in [0002](0002-native-clients-per-platform.md).
- **Android after the MVP**, with the contract and tokens kept platform-neutral.
- **Drop Android**.

## Decision

Chosen **Android after the MVP**, because it shortens every client iteration, frees the host build and device slots for Xcode, and keeps the option open at no design cost: the server already owns the logic ([0003](0003-server-owns-protocol-logic.md)), so Android later is one more thin client on the same contract.

## Consequences

- MVP clients: web (SSR) and `ios-app` for iOS, iPadOS and macOS. [0020](0020-android-stack.md) stays the Android stack and is used when Android starts.
- The contract, fixtures and tokens stay platform-neutral: open enums, no Swift-only shapes, the token pipeline keeps a plugin seam for Compose output.
- `apps/android-app/` holds only its `AGENTS.md` until then; no Android steps, CI jobs or SDK bootstrap run in the MVP.
- Android rows and mentions in [0001](0001-monorepo-turborepo-bun.md), [0014](0014-push-via-onesignal.md), [0022](0022-accessibility.md), [0023](0023-motion.md), [0027](0027-design-tokens.md), [0033](0033-release-and-versioning.md), [0034](0034-observability.md), [0041](0041-i18n.md), [0043](0043-plans-and-entitlements.md), the concepts and the design book apply when Android starts.
- Android research stays in `docs/research/android-app/` and is re-checked by the research gate when Android starts ([roadmap](../roadmap.md#after-the-mvp-android)).
- Related: [0002](0002-native-clients-per-platform.md), [0020](0020-android-stack.md), [0048](0048-e2e-testing.md).
