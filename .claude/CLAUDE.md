# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

Start here: [docs/README.md](../docs/README.md) — full documentation index.

### Project-wide
- [docs/getting-started.md](../docs/getting-started.md) - Setup, commands, project structure
- [docs/architecture.md](../docs/architecture.md) - Clean Architecture, tech stack
- [docs/code-style.md](../docs/code-style.md) - Naming conventions, language rules
- [docs/codegen.md](../docs/codegen.md) - Type generation pipeline
- [docs/subgraphs.md](../docs/subgraphs.md) - The Graph development

### Mobile App
- [apps/mobile/docs/architecture.md](../apps/mobile/docs/architecture.md) - DDD modules, DI patterns
- [apps/mobile/docs/code-style.md](../apps/mobile/docs/code-style.md) - Mobile-specific conventions
- [apps/mobile/docs/styling/overview.md](../apps/mobile/docs/styling/overview.md) - Theme system, @grapp/stacks
- [apps/mobile/docs/commands.md](../apps/mobile/docs/commands.md) - Dev commands

### Server
- [apps/server/docs/architecture.md](../apps/server/docs/architecture.md) - Clean Architecture, DI, features
- [apps/server/docs/api.md](../apps/server/docs/api.md) - Endpoints, validation

## Rules
- Always run `bunx tsc --noEmit` after code changes to check for TypeScript errors

## Quick Reference

```bash
bun install           # Install dependencies
bun run dev           # Start all dev servers
bun run dev:ios       # Server + iOS
bun run check         # Lint (Biome)
bun run codegen       # Generate types
```
