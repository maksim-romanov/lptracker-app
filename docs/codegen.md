# Code Generation

## Overview

The project uses code generation for:
- **GraphQL types** - TypeScript types from The Graph schemas
- **OpenAPI schemas** - API documentation from Valibot schemas

## Run Codegen

From the monorepo root:

```bash
bun run codegen
```

This runs codegen in all packages with proper dependency ordering (server first, then mobile).

## What Gets Generated

### Server

1. **GraphQL types** (`graphql-codegen`)
   - Generated from subgraph schemas
   - Location: `apps/server/src/features/*/infrastructure/graph/generated/`

2. **OpenAPI schemas** (`scripts/generate-openapi.ts`)
   - Generated from Valibot route schemas
   - Location: `apps/server/openapi/`

### Mobile

Currently a placeholder. Will generate API client types from server OpenAPI schemas.

## Dependency Order

```
server#codegen → mobile#codegen
```

The mobile package waits for server codegen to complete (configured in `turbo.json`).

## Manual Generation

Run codegen for a specific package:

```bash
# Server only
cd apps/server && bun run codegen

# Or via turbo filter
turbo run codegen --filter=server
```
