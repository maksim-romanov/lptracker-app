# Code style

How code reads in every workspace. Rules a linter enforces are named by rule id and not repeated as prose. Sources: [TypeScript](../research/repo/code-style-typescript.md), [Swift](../research/ios-app/code-style.md), [Kotlin](../research/android-app/code-style.md).

## Every language

- Pure core, I/O at the edge: time, randomness, network and storage arrive as arguments or ports; use cases and view models never reach for a global clock or client. *Convention.*
- Never mutate an argument or shared state; build a new value. *Convention.*
- Model every state as a closed type and branch on it exhaustively, with no catch-all branch. Wire values are open: the decoded type keeps an `unknown` case and every switch handles it ([0010](../decisions/0010-wire-contract.md)). Enforced by the compiler.
- UI is a function of state: views render a state value and send actions; they never compute numbers, format server values a second time or fetch. *Convention.*
- Never swallow an error: a catch maps, retries or rethrows with the original as cause. Cancellation always propagates. Error codes follow [0039](../decisions/0039-error-model.md).
- No forced casts or unwraps; parse at the boundary into a typed value instead.
- Names are whole words. Closure shorthand (`$0`, `it`, a one-letter callback parameter) follows the language's own idiom: only in a one-line, non-nested closure with one parameter. Test fixtures and pure maths may stay terse. *Convention.*
- A comment states a hidden constraint or surprising behaviour, never what the code does or why it was written this way. *Convention.*
- `TODO(#<issue>)`; a bare `TODO` only for an unknown address, start block or ABI ([integrations](../../integrations/AGENTS.md)). Enforced by a CI grep (*planned*).
- Delete dead code and unused imports in the same change; no compatibility stubs.
- Smallest visibility that compiles: `private` first, then module-internal; public API only through the package entry or module interface.
- Tests: arrange, act, assert separated by blank lines; the name states the result and the condition; fixtures are builders with overrides; fakes are in-memory implementations of our ports, never mocks of our own code. *Convention.*

## TypeScript

Enforced by `tsc` (`strict`, `erasableSyntaxOnly`) and Biome (`noExplicitAny`, `noNonNullAssertion`, `noDefaultExport`, `noReExportAll`, `noBarrelFile`, `noFloatingPromises`, `useErrorCause`, `noParameterAssign`, `noForEach`, `noAccumulatingSpread`, `useMaxParams`, `noExcessiveCognitiveComplexity`, `noUnused*`), all at `error`.

- Close an internal switch with `default: return value satisfies never;`. A switch over a wire value keeps a real `default` for unknown values.
- No `as` except `as const`; use `satisfies` for typed literals. *Convention* (GritQL candidate).
- `Address`, `ChainKey` and `PositionId` are branded types created only by a Zod `.brand` parse at the boundary. *Convention.*
- No classes for logic: use cases are plain functions, adapters are `createX(deps)` factories. The only class extends `Error` (`PortError`). *Convention* (GritQL candidate).
- Domain types are `readonly`; constants use `as const`. *Convention.*
- A function with a boolean flag or more than two parameters takes one options object.
- JSX components: `const PositionRow = function ({ position }: Props) { … }`.
- `/** */` only on ports and contract types, listing the codes they throw.
- The only re-export files are the package `exports` entries (`core/domain`, `core/ports`, `core/use-cases`).
- Property tests with fast-check for maths; `expectTypeOf` for brands.

## Swift

Enforced by swift-format (layout) and SwiftLint `--strict` (`private_swiftui_state`, `force_unwrapping`, `force_try`, `force_cast`, `implicitly_unwrapped_optional`, `identifier_name`, `shorthand_argument`, `anonymous_argument_in_multiline_closure`, `strict_fileprivate`, `no_extension_access_modifier`, `unused_import`, `unused_declaration`, plus custom `no_legacy_observation`, `no_task_in_onappear`, `no_anyview`, `no_gcd`, `no_unchecked_sendable`, `no_empty_catch`, `no_xctest_in_unit_tests`).

- `body` only composes views; filtering, formatting and derived values live on the model. *Convention.*
- `@State private var model = FooModel()` creates a model, a plain `let` receives one, `@Bindable` only for a `$` binding, `@Environment(Service.self)` for services.
- `@Observable` only; `@ObservationIgnored` on `@Dependency` and `@Shared` properties.
- Async work starts in `.task` or `.task(id:)`, never in `init`.
- Identity comes from the server `id`; each `ForEach` element emits a constant number of views. *Convention.*
- UI modules use MainActor default isolation; `Domain`, `APIClient` and `Data` stay nonisolated. Heavy work is `@concurrent`; no actors until measured. *Convention.*
- Throw untyped across modules, carrying the `code`; `throws(E)` only inside one module. *Convention.*
- One type per file; conformances in extensions; no `// MARK:`. *Convention.*
- Tests use Swift Testing (`@Suite struct`, `@Test(arguments:)`, `#expect`, `#require`, the `.dependencies` trait); XCTest only in `VoidXUITests` and performance tests.

## Kotlin

Enforced by the compiler (`allWarningsAsErrors`; `explicitApi()` on `:core:model`, `:core:data`, `:core:designsystem` and `:feature:*:api`), ktlint, compose-lints (`ComposeParameterOrder`, `ComposeModifierMissing`, `ComposeModifierWithoutDefault`, `ComposeModifierReused`, `ComposeViewModelForwarding`, `ComposeViewModelInjection`, `ComposeRememberMissing`, `ComposePreviewPublic`, `ComposeMutableParameters`; `ComposeUnstableCollections` off under strong skipping) and Android Lint as errors.

- Each screen is a `FooRoute` that holds the ViewModel and collects state, plus a stateless `FooScreen(state, onAction, modifier)`.
- `modifier: Modifier = Modifier` is the first optional parameter and is applied once, to the root layout.
- No side effects in composition: `LaunchedEffect` with real keys, `rememberUpdatedState` for callbacks, `derivedStateOf` only when input changes more often than output. *Convention* (custom Lint candidate).
- Screen state is a `sealed interface FooUiState` or a data class of `val`s, exposed as `StateFlow` via `stateIn(WhileSubscribed(5_000))`; actions become state, no one-off event channels. *Convention.*
- Collect with `collectAsStateWithLifecycle()` only. *Convention* (custom Lint candidate).
- Failures are a sealed `Outcome`; wire codes are an open `value class ErrorCode`. Rethrow `CancellationException`. *Convention.*
- Inject dispatchers and scopes; never `Dispatchers.*` or `GlobalScope` inside a class. Suspend functions are main-safe; the ViewModel owns its coroutines. *Convention.*
- Lazy lists pass `key` and `contentType`. *Convention.*
- `internal` by default, `private` when one file uses it.
- Previews are `private` and render `FooScreen` from fixtures. Flow tests use Turbine.
