# CLAUDE.md — apps/subgraphs

The Graph indexers, one AssemblyScript package per protocol: [`uniswap-v3`](uniswap-v3/CLAUDE.md), [`uniswap-v4`](uniswap-v4/CLAUDE.md). No workspace dependencies — fully standalone from the rest of the monorepo.

Read [README.md](README.md) before touching any subgraph: **Rule #1 — never hand-copy contract data.** Addresses, event signatures, and start blocks go into `subgraph.yaml`/`networks.json` straight from the deployed contract via `cast` (Foundry), never typed from memory or a block explorer UI. One wrong character and the subgraph silently indexes nothing.

Adding a new protocol subgraph is a `cast`-driven, multi-step procedure — use the `add-protocol-subgraph` skill instead of improvising it. Deploying an existing one is likewise procedural — each package has its own `subgraph-deploy` skill.
