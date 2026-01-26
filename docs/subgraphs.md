# Subgraphs (The Graph)

## Overview

Subgraphs index blockchain data using The Graph protocol. Located in `apps/subgraphs/`.

## Local Development

### Start Local Graph Node

Requires Docker.

```bash
bun run graph:up
```

This starts:
- Graph Node
- IPFS
- PostgreSQL

### Stop Local Environment

```bash
bun run graph:down
```

## Build & Deploy

### Build Subgraphs

```bash
bun run graph:build
```

Compiles AssemblyScript mappings for all subgraph packages.

### Run Tests

```bash
bun run graph:test
```

## Commands Summary

| Command | Description |
|---------|-------------|
| `bun run graph:up` | Start local Graph Node (Docker) |
| `bun run graph:down` | Stop local Graph Node |
| `bun run graph:build` | Build all subgraphs |
| `bun run graph:test` | Test all subgraphs |

## Working with Individual Subgraphs

Filter to a specific subgraph:

```bash
# Build only uniswap-v3 subgraph
turbo run build --filter=@matrapp/subgraph-uniswap-v3
```
