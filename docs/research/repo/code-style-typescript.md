---
app: repo
topic: TypeScript code style
checked: 2026-10-02
---

# TypeScript code style

Input for a `docs/concepts/code-style.md` and a short pointer block in root `AGENTS.md`. Each rule names its check: `tsc` (already on in [ts-quality-gates](ts-quality-gates.md) [21]), a Biome rule, a GritQL plugin, or *convention*.

## Decisions

Declarative core

- We keep logic in plain functions over plain data, and do I/O only in the shell (`apps/*`, `packages/infra`), because a pure core needs no test doubles [18]. `packages/core` never calls `Date.now()`, `Math.random()` or `fetch`; time and randomness arrive as arguments. *Convention*; `core` already has `types: []`, so globals fail `tsc`.
- We never mutate an argument. A function may mutate a local it created, when a `for...of` is clearer than a chain. Domain types use `readonly` properties and `readonly T[]`; literals use `as const`. *Convention* (Biome has no readonly-property rule; `noParameterAssign` only stops reassignment [1]).
- We write transformations with `map`/`filter`/`flatMap`, and `for...of` when there is an early exit, an `await` per item or more than one accumulator. We ban `forEach` (`noForEach`) and spread-in-reduce (`noAccumulatingSpread`) [1][7].
- We model states as discriminated unions, not a status string plus nullable fields, and make the invalid combination unrepresentable [8][12]. Example: `{ kind: "ok"; data } | { kind: "failed"; code }`, never `{ failed: boolean; data?: T }`. *Convention*.
- We close every `switch` over an internal union with `default: return value satisfies never;`, because `tsc` then fails when a member is added [8][20]. Wire values are open strings ([0010](../../decisions/0010-wire-contract.md)), so a switch over a parsed wire field has a real `default` branch. `tsc` is the gate. `useExhaustiveSwitchCases` is nursery, type-aware and informational by default [2], so we do not rely on it.
- We use `satisfies` for typed literals (`const chains = { … } as const satisfies Record<string, ChainConfig>`), and `as` only in `as const`. Type assertions and `!` are unsafe [7]; `noNonNullAssertion` is set to `error` [1]. A GritQL plugin for `as <Type>` is a candidate, not verified.
- We brand identifiers that are structurally strings but must not mix (`Address`, `ChainKey`, `PositionId`) and create them only in a parse function at the boundary, with Zod `.brand<"Address">()` [11]. The brand is type-only: it is no runtime check. *Convention*.
- We parse at the boundary and pass the precise type inward; core code never re-validates [12]. Types come from `z.infer` of the schema; we do not hand-write a twin type [11].
- We use no classes for logic. A class is allowed only to extend `Error` (`PortError`). Adapters are `createX(deps): Port` factories ([0005](../../decisions/0005-dependency-injection.md)). `noStaticOnlyClass` is recommended [1]; a GritQL ban on other `class` declarations is a candidate.
- We use no `enum`, `namespace` or parameter property, because `erasableSyntaxOnly` fails them in `tsc` [21]. We leave `noEnum`, `noNamespace` and `noParameterProperties` off, since they would duplicate `tsc`. Use `as const` objects and unions.
- A function with a boolean parameter or more than two parameters takes one options object with named fields (`createPool({ endpoints, retry: false })`, not `createPool(endpoints, false)`), and optional fields are absent, not `undefined` (`exactOptionalPropertyTypes`, already on). `useMaxParams` enforces the count [1]; booleans are *convention*.
- No nested ternary (`noNestedTernary`) and no `let` that is assigned once in a branch; use an expression or an early return [1].

Errors

- We follow [0039](../../decisions/0039-error-model.md): a port throws `PortError` with an uppercase `code`, and the use case maps the code to a scope result. We do not add a `Result` library, because a second error style at the same boundary contradicts 0039. Expected outcomes inside the core (not found, over limit, stale) are returned values: discriminated unions, not exceptions. *Convention*.
- We throw only `Error` instances (`noThrowOnlyError`, listed in the rules index [1]; Google requires it too [7]). Rethrow with context as `new PortError("RPC_ERROR", { cause: error })`, because `cause` keeps the chain [9]. `useErrorCause` (Biome ≥ 2.3.12, off by default) flags a rethrow without `cause`, so we enable it [6].
- A `catch` either maps, retries within policy, or rethrows ([0039](../../decisions/0039-error-model.md)). Empty `catch` is banned, including with a comment; Google allows the commented form [7], and we do not, because 0039 forbids swallowing. Lint: Biome `noEmptyBlockStatements` is a candidate; the swallow-and-log case is *convention*.
- Every async function that starts work is awaited, returned or `void`-marked with a reason. We enable `noFloatingPromises` at `error`; it is nursery and needs the project scan [3].
- A port method takes `signal: AbortSignal` as a required property, never optional and never defaulted ([0029](../../decisions/0029-resilience-patterns.md)). Combine with `AbortSignal.any([request.signal, AbortSignal.timeout(ms)])`, call `signal.throwIfAborted()` before CPU loops, and detect a timeout with `error.name === "TimeoutError"` [10]. An aborted call rethrows its `reason`; it is never mapped to `RPC_ERROR`. Enforced by port types and chaos tests.

Modules and layout

- We use named exports only. `noDefaultExport` is `error` [5][7], with one `overrides` entry for `apps/*/src/index.ts`, because Bun serves `export default { port, fetch: app.fetch }` [16].
- We have no nested barrel files. The only re-exporting files are the `exports` entries of a package (`packages/core/src/domain/index.ts`, …), with named re-exports and never `export *`. `noBarrelFile` is off and `noReExportAll` is `error`, both overridden for those entries [4]. Reason: barrels load every module and hide dependencies [4]; the entry files are the allowed exception because ADR 0004 gives each package fixed subpath exports.
- One concept per file, named for it (`refresh-target.ts`, kebab-case); tests sit beside it as `refresh-target.test.ts`. Imports from another package go through its `exports`; relative imports never leave the package. Enforced by `tsc` and dependency-cruiser ([ts-quality-gates](ts-quality-gates.md)).
- Function size: no line cap. Split when a name would reveal intention, or at `noExcessiveCognitiveComplexity` (set to `error`) [1][13]. We do not extract a single-use helper just to shorten a function; deep functions with small interfaces beat many shallow ones [19].
- Names are whole words (`position`, not `pos`; `entry`, not `e`); a protocol term from the [glossary](../../glossary.md) keeps its standard form (`rpc`, `abi`). Acronyms are written as words (`loadHttpUrl`) [7]. Types and unions are `UpperCamelCase`, constants `camelCase` unless a module-level `as const` table (`useNamingConvention` enforces case only [1]; length and abbreviations are *convention*, with a single-letter-parameter GritQL rule as a candidate). Test files and files that hold pure math may use terse names.
- Unused imports, variables and parameters are errors (`noUnusedImports`, `noUnusedVariables`, `noUnusedFunctionParameters`), because warnings fail the build anyway ([agent-context](../../concepts/agent-context.md)) [1]. Dead code is deleted in the same change; unused exports have no Biome rule (open question).

Comments

- Comment only a hidden constraint, an invariant or surprising behaviour, and say why, never what [14]. No narrative, no "added for X", no commented-out code. *Convention*.
- `/** */` only on port interfaces and exported contract types. It states units, invariants and the `code` values the method throws; Google reserves JSDoc for user-facing documentation [7]. A port method without its thrown codes is incomplete. *Convention*.
- `TODO` carries an issue: `TODO(#123): …`. The exception is an unknown address, start block, ABI or chain id, where `AGENTS.md` demands a bare `TODO` and a stop. Lint: a CI grep, not Biome (no comment rule).
- Biome suppressions (`biome-ignore`) and `@ts-ignore` are banned (`noTsIgnore`) [1]; `@ts-expect-error` is allowed only in `*.test.ts`, to prove a brand or union rejects a value.

Tests

- We use `bun test` with Arrange, Act, Assert separated by blank lines, no `// arrange` comments. One behaviour per test; the name is `<unit> <result> when <condition>` (`refreshTarget keeps last-good scope when the index times out`). Use `test.each` for input tables [15]. *Convention*.
- Fixtures are factory functions returning a full valid object with `Partial` overrides (`makePosition({ chain: "base" })`), the same shape as `createRoot(config, overrides)` ([0005](../../decisions/0005-dependency-injection.md)). We test use cases with the real function and in-memory fakes that implement the port. No `mock.module` or `spyOn` on code we own; mocks are for third-party edges, and recorded cassettes cover the network ([0009](../../decisions/0009-record-replay-verification.md)). *Convention*.
- Math (tick, liquidity, fee and price conversion) gets property tests with fast-check: `fc.assert(fc.property(…))` shrinks a failure and prints a seed [17]. It is a new dev dependency, so it needs the owner. Without it, a table of boundary values with `test.each` is the minimum.
- Type-level promises (brands, exhaustive unions) get a test with `expectTypeOf`, which only fails under `bunx tsc` [15]; so the type-check task must include test files.

## Facts that constrain us

- Biome 2.5 (2026-06-05). `noBarrelFile` (performance, 1.6.0) and `noDefaultExport` (style, 1.4.0) are off by default, warning when enabled [4][5]. `useErrorCause` (style, 2.3.12) is off by default [6]. `noFloatingPromises` and `useExhaustiveSwitchCases` are nursery since 2.0.0, type-aware, informational by default, and in the `types` domain since 2.4.0 [2][3]. A nursery rule may change between minors.
- Biome cannot ban abbreviations, comment content or a boolean parameter by itself; those need a GritQL plugin, which targets JS, CSS and JSON, or stay *convention* [21].
- TS 7.0 ([ts-quality-gates](ts-quality-gates.md)): `satisfies never` works since TS 4.9 [20]; `erasableSyntaxOnly` bans enums, namespaces and parameter properties [21].
- `Error` `cause` is Baseline widely available since 2021 [9]. `AbortSignal.any`, `timeout` and `throwIfAborted` are standard [10].
- Zod 4 `.brand()` is static-only; `.brand<"X", "out">()` direction needs Zod ≥ 4.2; `.readonly()` freezes at runtime [11].
- Bun 1.4.2: `bun test` has `test.each`, `expectTypeOf` (checked only by `tsc`), no branch coverage [15][21].

## Open questions

- Resolved in [code style](../../concepts/code-style.md): JSX components use the owner's form `const Foo = function (…)`.
- Enabling nursery rules (`noFloatingPromises`, `useExhaustiveSwitchCases`) at `error` makes CI depend on rules that may be renamed; ADR 0049 says "Biome only". Accept, or keep `tsc` and review as the gate?
- Unused exports: Biome has no rule and dependency-cruiser finds only orphan modules. Is a script acceptable, or is Biome plus review enough?
- Does a GritQL rule match arrow-function parameter names, class declarations and `as` expressions? A canary per rule is needed at M0.
- Which code does an aborted call surface: `TIMEOUT` or `KILLED` ([0039](../../decisions/0039-error-model.md)), and who maps it?
- fast-check as a dev dependency, and the path pattern that marks "pure math" files for terse names.
- `noThrowOnlyError` was listed in the rules index, but its own page was not reachable; confirm name, group and default before it goes into `biome.json`.
- Where it lives: root `AGENTS.md` is limited to 100 lines and nested ones to 40, so the full list belongs in a concept doc (≤ 120 lines), with Biome rule names as the single home for lint-enforced items ([writing-docs](../../writing-docs.md)).

## Sources

1. Biome, JavaScript rules — https://biomejs.dev/linter/javascript/rules/
2. Biome, useExhaustiveSwitchCases — https://biomejs.dev/linter/rules/use-exhaustive-switch-cases/
3. Biome, noFloatingPromises — https://biomejs.dev/linter/rules/no-floating-promises/
4. Biome, noBarrelFile — https://biomejs.dev/linter/rules/no-barrel-file/
5. Biome, noDefaultExport — https://biomejs.dev/linter/rules/no-default-export/
6. Biome, useErrorCause — https://biomejs.dev/linter/rules/use-error-cause/
7. Google TypeScript Style Guide — https://google.github.io/styleguide/tsguide.html
8. TypeScript Handbook, Narrowing (exhaustiveness, discriminated unions) — https://www.typescriptlang.org/docs/handbook/2/narrowing.html
9. MDN, Error cause — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
10. MDN, AbortSignal — https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
11. Zod, API (brand, readonly, infer) — https://zod.dev/api
12. Alexis King, Parse, don't validate — https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/
13. Martin Fowler, Beck Design Rules — https://martinfowler.com/bliki/BeckDesignRules.html
14. Google Engineering Practices, What to look for in a review — https://google.github.io/eng-practices/review/reviewer/looking-for.html
15. Bun, Writing tests — https://bun.com/docs/test/writing-tests
16. Hono, Bun — https://hono.dev/docs/getting-started/bun
17. fast-check, Getting started — https://fast-check.dev/docs/introduction/getting-started/
18. Gary Bernhardt, Boundaries (functional core, imperative shell) — https://www.destroyallsoftware.com/talks/boundaries
19. Ousterhout and Martin, APOSD vs Clean Code — https://github.com/johnousterhout/aposd-vs-clean-code
20. Matt Pocock, `satisfies never` — https://www.linkedin.com/posts/mapocock_satisfies-never-is-so-good-for-exhaustiveness-activity-7096780122589917185-Uzh6
21. [TypeScript and quality gates](ts-quality-gates.md), internal, checked 2026-09-30
