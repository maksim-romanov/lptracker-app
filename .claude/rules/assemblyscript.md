---
paths:
  - "apps/subgraphs/*/src/**"
---

# AssemblyScript (subgraph handlers)

Applies identically to both `uniswap-v3` and `uniswap-v4`:

- **Not TypeScript.** No async/await, no destructuring in function params, no spread, no optional chaining on entity fields. Use `if (x === null)` checks.
- **`let`, not `const`.** Biome rules `useConst`, `useImportType`, `useTemplate`, `noDoubleEquals`, `noShadowRestrictedNames`, `noUnusedImports` are disabled for these packages intentionally — don't "fix" the style toward TS conventions.
- Nullable entity fields load as `T | null` — always null-check before access.
- **No `BigInt(0)`** — use `BigInt.zero()`. No `new BigInt(...)`.
- Reverted calls: use `try_<method>()` (returns `{ value, reverted }`), never `<method>()`, which throws and kills the handler.
