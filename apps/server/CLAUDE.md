# CLAUDE.md

This file provides guidance to Claude Code when working with the server codebase.

## Documentation

- [docs/architecture.md](docs/architecture.md) - Clean Architecture, DI, feature modules
- [docs/api.md](docs/api.md) - Endpoints, validation, error handling

## Key Principles

### Clean Architecture Layers
Domain → Data → Application → Presentation. Dependencies point inward.

### Result Types
All use cases return `Result<T, DomainError>` via neverthrow. Never throw in business logic.

### DI Patterns

```typescript
// Symbol tokens for replaceable dependencies
export const POSITIONS_REPOSITORY = Symbol("POSITIONS_REPOSITORY");
container.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });

// Child containers for chain-specific isolation
const chainContainer = container.createChildContainer();
```

### Resilience
External providers use opossum circuit breakers + rate-limiter-flexible. Caching via Redis with request deduplication.
