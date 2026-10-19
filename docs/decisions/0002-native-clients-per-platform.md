# 0002 · Native clients per platform

- Status: proposed
- Deciders: Maksim Romanov

## Context

VoidX needs iOS, iPadOS, macOS with widgets, and Android with widgets. Widgets, passkeys, push and platform motion are first-class features, and each platform has its own idioms for them.

## Options

- **Native Swift and native Kotlin**: best platform fit, two codebases.
- **React Native or Flutter**: one codebase, weaker widgets and platform feel.
- **Kotlin Multiplatform shared data layer**: shares networking and caching, adds a Kotlin framework boundary inside the Swift app.

## Decision

Chosen **native Swift** (`ios-app`: one multiplatform SwiftUI target for iOS, iPadOS and macOS plus a widget extension) and **native Kotlin** (`android-app`: Jetpack Compose plus Glance widgets), because the owner wants fully native apps and the shareable logic already runs once on the server ([0003](0003-server-owns-protocol-logic.md)).

## Consequences

- The apps share contracts, not code: the OpenAPI spec, design tokens and chain metadata are generated into each ([0010](0010-wire-contract.md)).
- `:core:model` on Android stays pure Kotlin, so Kotlin Multiplatform remains possible later.
- UI work is done twice; the thin-client rule keeps that to presentation only.
