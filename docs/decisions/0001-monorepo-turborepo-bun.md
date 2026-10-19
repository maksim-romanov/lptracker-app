# 0001 · One Turborepo monorepo on Bun workspaces

- Status: proposed
- Deciders: Maksim Romanov

## Context

VoidX ships a server, a worker, a Swift app, a Kotlin app and shared packages that must change together (API contract, design tokens, chain metadata). Contributors and agents need one place to find everything and one command to verify it.

## Options

- **Turborepo + Bun workspaces**: one repo, task graph across TS and native apps.
- **Nx or moon**: stronger polyglot support, heavier to learn and configure.
- **Separate repos per app**: independent releases, but contract changes span several PRs.

## Decision

Chosen **Turborepo + Bun workspaces**, because it keeps every change to the contract, tokens and apps in one PR and one task graph at the lowest setup cost.

- Apps: `apps/server`, `apps/worker`, `apps/ios-app`, `apps/android-app`; npm scope `@voidx/*`.
- Native apps join the task graph through a `package.json` whose scripts call Tuist/`xcodebuild` and `./gradlew`; `turbo.json` declares their inputs and their dependency on codegen tasks.
- Every workspace exposes the same tasks: `codegen`, `typecheck`, `lint`, `test`, `check`.
- Toolchains (Bun, Java, Swift tooling) are pinned with `mise`.
- Docs and language rules: [0052](0052-docs-as-code.md).

## Consequences

- One command, `bun run check --affected`, verifies any change.
- Turborepo does not see Swift or Gradle dependencies; `dependsOn` for native apps is declared by hand.
- Native build outputs are not cached by Turborepo; Xcode and Gradle keep their own caches.
