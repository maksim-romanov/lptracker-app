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
