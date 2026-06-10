# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Documentation

- [docs/architecture.md](docs/architecture.md) - DDD modules, DI patterns, project structure
- [docs/code-style.md](docs/code-style.md) - Naming conventions, imports
- [docs/styling/overview.md](docs/styling/overview.md) - Theme system, @grapp/stacks, typography
- [docs/commands.md](docs/commands.md) - Dev and build commands

## Key Principles

### Framework-Agnostic Logic

Keep business logic in use cases, not in React components. UI should be a thin layer.

### Module Isolation

Each module has its own errors, types, events. Never use shared/global error types across modules.

### DI Patterns

```typescript
// Symbol tokens for replaceable dependencies
export const FEATURE_REPOSITORY = Symbol("FEATURE_REPOSITORY");
container.register(FEATURE_REPOSITORY, FeatureRepository);

// Direct class injection for concrete implementations
constructor(
  @inject(FEATURE_REPOSITORY) private readonly repo: FeatureRepository,
) {}
```

## Widget extension (`targets/positions-widget`)

Native iOS widget extension for tracking one Following LP position. Built with `@bacons/apple-targets` config plugin (CNG-compatible). Data flow: RN app writes JSON snapshot to App Group via `widget-bridge` native module; SwiftUI widget reads on every timeline reload.

- Swift conventions: [docs/swift-conventions.md](docs/swift-conventions.md). Do **not** apply TypeScript conventions here.
- App Group: `group.com.depthly.app.shared`
- Widget kind: `depthly.position`
- Refresh trigger: TanStack Query refetch success (Following changes follow on next refetch; see `usePositionsQuery.ts` TODO marker)
- Implementation plan: `docs/superpowers/plans/2026-06-10-positions-widget.md` (outside git, planning artifact)
