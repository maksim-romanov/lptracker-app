---
app: android-app
topic: Code style, declarative Kotlin and Jetpack Compose
checked: 2026-10-02
---

# Code style: declarative Kotlin and Jetpack Compose

Applies to Kotlin 2.4.20, Compose BOM 2026.09.00, Navigation 3 1.2.0, lifecycle 2.11.0, ktlint 1.8.0, compose-lints ([skeleton](skeleton.md)). Stack and error rules: [ADR 0020](../../decisions/0020-android-stack.md), [0039](../../decisions/0039-error-model.md), [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md). Rule status: *lint* names the check, *convention* has none yet.

## Decisions

### Compose
- We write every screen as two composables: `FooRoute(viewModel = metroViewModel())` collects `uiState.collectAsStateWithLifecycle()` and passes plain values plus `onX` lambdas to a stateless `FooScreen(state, onX, modifier)`. Only `FooRoute` sees a ViewModel; Previews, Roborazzi and Compose tests call `FooScreen`. *lint* `ComposeViewModelForwarding`, `ComposeViewModelInjection`. [1, 2, 3, 4]
- We order parameters: required, `modifier: Modifier = Modifier`, optional, trailing `content` slot. Apply `modifier` once, to the root layout. Handlers are `onClick`, `onValueChange`. *lint* `ComposeParameterOrder`, `ComposeModifierMissing`, `ComposeModifierWithoutDefault`, `ComposeModifierReused`. [5, 6]
- We never take `State<T>` or `MutableState<T>` as a parameter; pass `T` and `(T) -> Unit`, or `() -> T` for values that change every frame (scroll, animation). *lint* `ComposeMutableParameters` covers mutable types only; *convention* for `State<T>`. [5, 7]
- We expose a slot (`@Composable () -> Unit`) instead of `String`/`Painter` params when callers choose the content, and invoke each slot in exactly one place. *lint* `SlotReused`. [5, 6]
- We name unit composables as PascalCase nouns and value-returning ones as lowercase; a composable emits one node or none. *lint* `ComposeNamingUppercase`, `ComposeNamingLowercase`, `ComposeMultipleContentEmitters`, `ComposeContentEmitterReturningValues`. [4, 6]
- We keep composition free of side effects: no I/O, no `launch`, no state writes in the body. Use `LaunchedEffect(key)` for suspend work tied to composition, `rememberCoroutineScope` inside event handlers, `rememberUpdatedState` for callbacks read inside an effect, `DisposableEffect` with `onDispose` for listeners. `LaunchedEffect(true)` is allowed only with a comment-free justification in the call site's lifetime; otherwise list real keys. *convention* (candidate custom Lint). [8]
- We use `derivedStateOf` only when input changes more often than the output (`listState.firstVisibleItemIndex > 0`); a plain expression for string or arithmetic transforms. We wrap `mutableStateOf`/`derivedStateOf` in `remember`. *lint* `ComposeRememberMissing`; the rest *convention*. [8, 9]
- We read fast-changing state in layout or draw: `Modifier.offset { }`, `graphicsLayer { }`, `drawBehind { }`, never `Modifier.alpha(state.value)` in composition (matches [motion](motion.md)). *convention* (candidate custom Lint, already proposed in motion). [9]
- We give every `LazyColumn`/`LazyRow` `items(…, key = { it.id }, contentType = …)` with a stable domain id (the position or scope key, never the index). *convention* (candidate custom Lint: `items(` call without `key =`). [9]
- We keep state in `rememberSaveable` when the user would lose input on rotation or process death, and in `remember` otherwise. State that needs a `Saver` goes in a plain state-holder class `rememberFooState()` next to the composable, not in the ViewModel. Screen state lives in the ViewModel. *convention*. [3, 10]
- We write `@Preview` functions `private`, named `FooPreview`, one multipreview annotation named `*Previews`, calling the stateless `FooScreen` with fixture state from `:core:testing`. *lint* `ComposePreviewPublic`, `ComposePreviewNaming`. [6]
- We never use `Modifier.composed { }` or a `@Composable fun Modifier.foo()`; write `Modifier.Node` or a plain extension that chains existing modifiers. *lint* `ComposeModifierComposed`, `ComposeComposableModifier`. [6]
- We read CompositionLocals only for theme, `Motion` and `LocalReducedMotion`; any other local (including a ViewModel or repository) is a parameter. *lint* `ComposeCompositionLocalUsage` (configure an allowlist). [5, 6]

### State, errors, types
- We model screen state as one immutable `uiState: StateFlow<FooUiState>`: a `sealed interface FooUiState` with `data object Loading`, `data class Content(…)`, `data class Failed(val error: UiError)` when the states exclude each other, else a single `data class` with `val` fields only. `when` on it has no `else`. *convention*; Kotlin's exhaustive `when` expression is the compiler check. [11, 12, 13]
- We expose `StateFlow`, never `MutableStateFlow`; the backing field is `private val _uiState` until ktlint 2.0 is stable, then explicit backing fields (stable in Kotlin 2.4). Stream-derived state uses `stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), Loading)`; mutate with `_state.update { it.copy(…) }`. *convention*. [11, 14, skeleton]
- We send no one-off events from the ViewModel: user actions become a state change that the UI consumes and acknowledges (`onMessageShown()`), never a `Channel`/`SharedFlow` of events. [11]
- We do not wrap Kotlin collections in `ImmutableList` and disable `ComposeUnstableCollections`: strong skipping is on by default since Kotlin 2.0.20, compares unstable parameters with `===`, and `StateFlow` emits a new state only when `equals` differs. Re-enable it if a compiler report shows a list-driven recomposition hot spot. [15, 16]
- We use `@Immutable`/`@Stable` only on a class that fails the compiler report and sits in a hot path; never to silence a warning. *convention*. [15, 16]
- We represent failure with a sealed result type in `:core:data`, not exceptions: `sealed interface Outcome<out T> { Success(value); Failure(error: ApiError) }`. Repositories catch I/O and decode exceptions at the boundary and rethrow `CancellationException`. The wire `code` stays an open string wrapped in `@JvmInline value class ErrorCode(val value: String)` with constants, so `when (code)` always has `else -> GenericError` and an unknown code never crashes ([0039](../../decisions/0039-error-model.md)). *convention*. [17, 18, ADR 0039]
- We never `catch (Exception)` without rethrowing `CancellationException` first and never swallow: map to `Failure`, retry within policy, or rethrow ([0039](../../decisions/0039-error-model.md)). *convention* (candidate custom Lint on `catch (… : Exception|Throwable)` in a `suspend` function). [17]
- We wrap each wire enum in `@JvmInline value class` ([0020](../../decisions/0020-android-stack.md)); we use `data object` for stateless singletons (sealed members, Nav keys) so `toString` and equality are right. [12, 13]
- We turn on no context parameters in feature code: stable in 2.4 except explicit context arguments, but Compose, Metro and ktlint 1.8 tooling around them is unverified. *convention*. [19]

### Coroutines and Flow
- We inject `CoroutineDispatcher`s (a Metro `@IoDispatcher`-style qualifier, defaults in the constructor) and never call `Dispatchers.IO` or `Dispatchers.Default` inside a class; suspend functions are main-safe because the class owning the blocking work calls `withContext(ioDispatcher)`. *convention* (candidate custom Lint: `Dispatchers.` outside the DI module). [17]
- We never use `GlobalScope`; app-lifetime work takes an injected `CoroutineScope`; screen-bound parallel work uses `coroutineScope { async { } }`. *lint* `GlobalScope` is a Kotlin inspection, not Android Lint; *convention* here. [17]
- We create coroutines in the ViewModel (`viewModelScope.launch`), and ViewModels expose no `suspend` functions. We do not launch in `init`; start the pipeline lazily through `stateIn`. [11, 17]
- Repositories expose `suspend fun` for one-shot calls and `fun observeX(): Flow<T>`, named `get<Model>Stream()` per Android guidance, cold, with no `MutableStateFlow` in the public API. [14, 17]
- We collect only with `collectAsStateWithLifecycle()` in composables, never `collectAsState()` and never `lifecycleScope.launch { collect }`. *convention* (candidate custom Lint: `collectAsState` call). [11, 14]
- We check cancellation (`ensureActive()`) in blocking loops and never hold a `runBlocking` outside tests and `main`. *convention*. [17]

### Naming, visibility, layout
- We follow the Kotlin conventions and the Android style guide: 100-column limit, no wildcard imports, `UPPER_SNAKE_CASE` only for deeply immutable `const`/top-level values, acronyms of 3+ letters in `Xml` case, trailing commas, expression bodies for single expressions, named arguments for booleans and same-typed parameters. *lint* ktlint (`no-wildcard-imports`, `max-line-length`, trailing-comma rules, `function-naming`). [20, 21]
- We forbid abbreviations and single-letter names in production code, including lambda parameters, and `it` for anything but a single-expression lambda of one line with an obvious receiver (`ids.map { it.value }`). Nested lambdas, multi-line lambdas and `copy(… = it)` name the parameter. Test fixtures and pure math helpers may stay terse. This is stricter than the Kotlin convention, which recommends `it` in short lambdas. *convention* (candidate custom Lint over UAST: lambda with an implicit `it` spanning more than one line or nested). [20, owner rule]
- We write no narrative, justification or follow-up comments; a comment records a hidden constraint, subtle invariant or surprising behavior. KDoc only on public API of `:core:*`. *convention*. [owner rule]
- We delete dead code, unused parameters and unused imports in the same change, with no compatibility stubs. *lint* ktlint `no-unused-imports`; Android Lint `UnusedResources`, Kotlin compiler warnings as errors (`allWarningsAsErrors`) for the rest. [owner rule, 21, skeleton]
- We make a declaration `internal` unless another module uses it, and `private` unless another file uses it; `@Composable` previews and helpers are `private`. We use `explicitApi()` strict on the library modules whose API other modules consume (`:core:model`, `:core:data`, `:core:designsystem`, `:feature:*:api`), not on `:app`, `:feature:*` implementations or `:widget`, because it forces visibility and return types where a module boundary exists. Enforced by Kotlin compiler; module graph per [AGENTS.md](../../../apps/android-app/AGENTS.md). [22, 23]
- We name files after their single top-level class or composable (`PositionRow.kt`), a descriptive PascalCase name for several declarations, never `Utils.kt` or `Helpers.kt`. Class layout: properties and `init`, constructors, functions, companion, nested types. ViewModel `FooViewModel`, state `FooUiState`, route `FooRoute`, screen `FooScreen`, fake `FakeFooRepository`, default implementation `DefaultFooRepository`. *convention* (ktlint `filename` covers file/class match). [20, 14]
- We write extension functions for operations on a type we do not own or for mapping layers (`PositionDto.toModel()` in `:core:data`, `Position.toRowState()` in the feature); each is `internal` or `private`, in a file named for the receiver or mapping, never a catch-all. Business logic goes in a class, not an extension. *convention*. [20]
- We use `object` only for constants and stateless singletons; nothing with mutable state outside the Metro graph. *convention*. [20]

### Tooling and testing
- We run ktlint with `.editorconfig` `max_line_length = 100`; compose-lints runs through `lintChecks` with `warningsAsErrors`; custom Lint rules (animation literals and content descriptions, [0020](../../decisions/0020-android-stack.md)) grow by the candidates marked above, each only after an agent repeats the mistake twice. We add no detekt ([skeleton](skeleton.md)). [21, 24, skeleton]
- We test ViewModels as JVM tests with a fake repository from `:core:testing`, injected `StandardTestDispatcher` and `runTest`; assert `viewModel.uiState.value` after `advanceUntilIdle()` and keep `WhileSubscribed` by collecting in `backgroundScope`. We prefer fakes over mocks and add no mocking library. [14, 17, 25]
- We test ordered `Flow` emissions with Turbine; a `StateFlow` end state is asserted through `.value`.
- We name tests with backticks (`` `unknown error code shows generic message`() ``), one behavior each, and use Compose rules on the stateless `FooScreen` with `onNodeWithTag`; layers and gates per [native-ui-tests](../repo/native-ui-tests.md). [20, native-ui-tests]
- We run no `@Preview`-only code outside `src/main` previews; Roborazzi snapshots call `FooScreen` with the same fixtures. [native-ui-tests]

## Facts that constrain us
- Strong skipping is default from Kotlin 2.0.20: every restartable composable is skippable; unstable params compare by `===`, stable by `equals`; lambdas auto-`remember`; opt out with `@NonSkippableComposable`, `@DontMemoize`. [15]
- Kotlin 2.4.0 stabilized context parameters (not explicit context arguments, which need `-Xexplicit-context-arguments`) and explicit backing fields; collection literals stay experimental. [19]
- Explicit API mode: `kotlin { explicitApi() }` (errors) or `explicitApiWarning()`; excludes primary constructors, data-class properties, getters/setters, overrides. [22]
- compose-lints ships Android Lint issue ids named above; `ComposeM2Api` is off by default; `ComposeCompositionLocalUsage` needs an allowlist. [6]
- `collectAsStateWithLifecycle` lives in `lifecycle-runtime-compose`; lifecycle 2.11.0 stable (2026-06-17). Navigation 3 scopes ViewModels per entry only with `rememberViewModelStoreNavEntryDecorator()` from `lifecycle-viewmodel-navigation3` and keeps state with `rememberSaveableStateHolderNavEntryDecorator()`; keys are `@Serializable … : NavKey`. [10, 26]
- Android guide calls Hilt "recommended", ADR 0020 bans it; Android guide recommends `viewModel()`, ours is `metroViewModel()`. The rest of the guide applies unchanged. [14, ADR 0020]
- `WhileSubscribed(5_000)` is the Android guidance for `stateIn`; `rememberCoroutineScope` is for event handlers; ViewModel-hosted Compose animation state (`DrawerState`) needs the composition scope. [3, 11]

## Conflicts with existing docs (flagged, not resolved)
- Resolved in [code style](../../concepts/code-style.md): `it` follows the Kotlin idiom (one-line, non-nested lambdas).
- [skeleton](skeleton.md) says avoid Kotlin 2.4-only syntax (explicit backing fields) until ktlint 2.0 is stable although Kotlin 2.4.20 is pinned; this file keeps `_uiState` pairs until then.
- ADR 0020 lists two custom Lint rules; this file proposes more (collectAsState, `Dispatchers.`, `items` without `key`, `it` nesting, `catch Exception` in suspend). Adding them is the owner's call.
- compose-lints `ComposeUnstableCollections` (on by default) contradicts decision "no ImmutableList"; this file disables it.
- `apps/android-app/AGENTS.md` states `./gradlew … lint ktlintCheck`; it does not name `explicitApi()` or `allWarningsAsErrors`, which this file adds to module conventions.

## Open questions
- ktlint docs (rules, `ktlint_official` vs `android_studio` code style, whether `function-naming` ignores `@Composable` by default) returned 404/503 this session; verify against 1.8.0 before writing `.editorconfig`.
- compose-lints release page showed 1.6.0 with "AGP/lint 9.3 or newer" and an old date, versus lint 32.2.1 in skeleton; confirm the artifact version and that `ComposeCompositionLocalUsage` exists in it.
- Does `metrox-viewmodel-compose` scope ViewModels per `NavEntry` through the Nav3 decorators, or per Activity? Not found in Metro docs.
- Does `kotlin.collections.*` need a Compose `stability_configuration_file` to be treated stable, or is strong skipping enough? Check one compiler report in M0.
- Resolved in [code style](../../concepts/code-style.md): Turbine is approved for Flow tests.
- Is `allWarningsAsErrors` safe with Metro's compiler-plugin warnings and generated `Generated/` code?
- Compose Preview tooling versus Roborazzi: is a separate `@Preview` set needed, or do screenshot tests replace previews as the fixture catalogue?

## Sources
1. Where to hoist state — https://developer.android.com/develop/ui/compose/state-hoisting
2. Architecture, UI layer events — https://developer.android.com/topic/architecture/ui-layer/events
3. State and Compose (`remember`, savers, hoisting rules) — https://developer.android.com/develop/ui/compose/state
4. Android Kotlin style guide — https://developer.android.com/kotlin/style-guide
5. Compose component API guidelines — https://github.com/androidx/androidx/blob/androidx-main/compose/docs/compose-component-api-guidelines.md
6. compose-lints rules — https://slackhq.github.io/compose-lints/rules/ ; releases — https://github.com/slackhq/compose-lints/releases
7. Compose API guidelines (State params) — same as 5
8. Side-effects in Compose — https://developer.android.com/develop/ui/compose/side-effects
9. Compose performance best practices — https://developer.android.com/develop/ui/compose/performance/bestpractices
10. Save and manage Navigation 3 state — https://developer.android.com/guide/navigation/navigation-3/save-state
11. UI state production — https://developer.android.com/topic/architecture/ui-layer/state-production
12. Sealed classes and interfaces — https://kotlinlang.org/docs/sealed-classes.html
13. Data objects — https://kotlinlang.org/docs/object-declarations.html#data-objects
14. Recommendations for Android architecture — https://developer.android.com/topic/architecture/recommendations
15. Strong skipping mode — https://developer.android.com/develop/ui/compose/performance/stability/strongskipping ; stability — https://developer.android.com/develop/ui/compose/performance/stability
16. Fix stability issues — https://developer.android.com/develop/ui/compose/performance/stability/fix
17. Best practices for coroutines in Android — https://developer.android.com/kotlin/coroutines/coroutines-best-practices
18. Inline value classes — https://kotlinlang.org/docs/inline-classes.html
19. What's new in Kotlin 2.4.0; context parameters — https://kotlinlang.org/docs/whatsnew24.html ; https://kotlinlang.org/docs/context-parameters.html
20. Kotlin coding conventions — https://kotlinlang.org/docs/coding-conventions.html
21. ktlint — https://pinterest.github.io/ktlint/latest/ ; changelog — https://github.com/pinterest/ktlint/blob/master/CHANGELOG.md
22. Explicit API mode (Gradle DSL) — https://kotlinlang.org/api/kotlin-gradle-plugin/kotlin-gradle-plugin-api/org.jetbrains.kotlin.gradle.dsl/-kotlin-top-level-extension-config/explicit-api.html
23. Kotlin API guidelines, backward compatibility — https://kotlinlang.org/docs/api-guidelines-backward-compatibility.html
24. Android Lint configuration — https://developer.android.com/studio/write/lint
25. Testing Kotlin coroutines on Android — https://developer.android.com/kotlin/coroutines/test
26. Lifecycle releases — https://developer.android.com/jetpack/androidx/releases/lifecycle
- [skeleton], [motion], [native-ui-tests]: files in `docs/research/`; ADR 0020, 0039: `docs/decisions/`; "owner rule": owner's personal rules given in the task.
