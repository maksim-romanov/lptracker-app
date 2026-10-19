---
app: ios-app
topic: Swift and SwiftUI code style for agents
checked: 2026-10-02
---

# Swift and SwiftUI code style for agents

Scope: conventions for `apps/ios-app`, Swift 6 language mode, iOS/macOS 26 ([0019](../../decisions/0019-ios-stack.md)). Motion and accessibility rules stay in [motion.md](motion.md) and ADR 0022; tooling setup in [skeleton.md](skeleton.md). Each rule names its check or is *convention*. Lint names are SwiftLint unless marked `swift-format`.

## Decisions

### SwiftUI
- We keep a `View` a function of its inputs: stored `let` values, `@State private`, `@Bindable`, `@Environment`, nothing else. `body` only composes views; no filtering, sorting, formatting, `Date()` or arithmetic. Derived values are computed properties on the model or a formatter held outside `body`, because bodies run on the main thread each frame and long ones cause hitches. Numbers are never computed on the client ([0003](../../decisions/0003-server-owns-protocol-logic.md)). *Convention*; review checks it, the SwiftUI instrument shows violations. [1][2]
- We own state at the lowest view that needs it: `@State private var model = FooModel()` creates an `@Observable` model, a plain `let model: FooModel` receives one, `@Bindable var model` appears only when a `$model.field` binding is needed, shared services come through `@Environment(Service.self)`. Enforced by `private_swiftui_state` (opt-in, enable). [3][4][5]
- We use `@Observable` only. `ObservableObject`, `@Published`, `@StateObject`, `@ObservedObject`, `@EnvironmentObject` are banned by one SwiftLint custom rule `no_legacy_observation` (regex `\b(ObservableObject|@Published|@StateObject|@ObservedObject|@EnvironmentObject)\b`), because `@Observable` tracks only properties a body reads. `@ObservationIgnored` goes on every `@Dependency` and `@Shared` property inside a model (macros do not mix with wrappers). [4][6][7]
- We start async work with `.task { await model.load() }` and `.task(id: key)`, never `.onAppear { Task { … } }` or `init()` fetches, because `.task` is cancelled with the view and `init` of a model must stay cheap. Custom rule `no_task_in_onappear` (regex `onAppear\s*\{\s*Task`). [1][5]
- We never use `AnyView` and keep a constant number of views per `ForEach` element; filter in the model instead of `if` inside the row. `ForEach` identity is the server `id` (`Identifiable`), never `\.self` on values and never an array index. Custom rule `no_anyview` (regex `\bAnyView\b`). Use `.id(_:)` only to reset state on purpose. [1]
- We keep a view type under about 60 lines of `body`: extract a subview as a new `struct` taking only the values it reads (not the whole entity), never a computed `var row: some View` that captures `self`, because a narrow input narrows the dependency and skips updates. Enforced by `function_body_length` and `type_body_length` (warning 60 and 250), the rest *convention*. [1]
- We read per-item state in the row, not the whole collection (`model.isFavorite(id)` backed by a per-item `@Observable`), as in the WWDC25 sample. *Convention*. [2]

### Types and errors
- We model every state as `enum` with associated values (`LoadState<Value>`: `.loading`, `.loaded(Value)`, `.failed(ProblemCode)`) and switch exhaustively without `default:`. Decoded wire enums carry `case unknown(String)` and the switch handles it explicitly, per the "never fail on unknown `type`, `kind` or `status`" rule in the app AGENTS.md; `@unknown default` is only for Apple enums. *Convention*; golden decode tests cover the decoder. [8]
- We prefer `struct`, `let` and `enum`; a `class` is an `@Observable` model, a `final class` with a reason, or a framework requirement. SwiftLint `final_class` is not a built-in; *convention*. [8]
- We throw untyped (`throws`) across module boundaries and from `APIClient`, `Data` and ports; we write `throws(E)` only inside one module where the caller must handle every case, and in generic rethrowing helpers. SE-0413 says untyped is better for most code and that typed throws freezes the function's error contract. Clients branch on the open server `code` and treat unknown codes generically ([0039](../../decisions/0039-error-model.md)), so a closed `enum ProblemCode` thrown from a port is wrong. *Convention*. [9][0039]
- We never write `try!`, `as!`, `!` or `String!` outside tests and generated code. Enforced by `force_try`, `force_cast`, `force_unwrapping` (opt-in, enable) and `implicitly_unwrapped_optional` (opt-in, enable); `swift-format` `NeverForceUnwrap`, `NeverUseForceTry` stay off to avoid two tools reporting one thing. [10][11]
- We never swallow an error: `catch { }` is banned; a catch maps to `LoadState.failed`, retries within policy or rethrows ([0039](../../decisions/0039-error-model.md)). `try?` is allowed only where nil is a defined state and a code comment is not needed. Custom rule `no_empty_catch` (regex `catch\s*\{\s*\}`). [0039]

### Concurrency
- We set `SWIFT_APPROACHABLE_CONCURRENCY = YES` and `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor` in `Project.swift` for `VoidX`, `VoidXWidgets`, `Feature*`, `DesignSystem`, `WidgetUI`, and leave them off for `Domain`, `APIClient`, `Data`, `AppIntentsKit`'s pure parts. Reason: Apple recommends MainActor default for UI modules and `nonisolated` for general-purpose libraries; `Domain` imports no UI framework ([0019](../../decisions/0019-ios-stack.md)); default MainActor still conflicts with `CodingKey`/`Decodable` conformances in some modules. In MainActor modules we do not write `@MainActor` on models (ADR 0019 says "`@MainActor` models"; the default makes it implicit). Checked by the build and a `Project.swift` review. [12][13][14][0019]
- We write `async` functions that do not need the main actor as `nonisolated`, and put CPU-heavy work (decoding a large snapshot, sorting) in `@concurrent` functions; we do not add actors until a measured main-thread contention. Models and view-facing classes are never actors. [13][14]
- We never use `DispatchQueue`, `OperationQueue`, completion handlers, `Thread`, `Task.detached` or `Task { @MainActor in }` (redundant under the default). Allowed: `Task { }` from a synchronous event handler, `async let`, `TaskGroup`. Custom rule `no_gcd` (regex `\b(DispatchQueue|DispatchGroup|OperationQueue|Task\.detached)\b`). [14]
- We make cross-isolation types `Sendable` as value types (`struct`/`enum` with `Sendable` members) and never use `@unchecked Sendable` or `nonisolated(unsafe)` without stopping to ask the owner. Custom rule `no_unchecked_sendable`. [13][14]
- We honour cancellation: long loops call `try Task.checkCancellation()`, and a model that starts a `Task` stores it and cancels the previous one before replacing it. *Convention*. [14]

### Names, access, layout
- We name by the API Design Guidelines: clarity at the call site, no needless words, `Bool` reads as an assertion (`isEmpty`), mutating and non-mutating pairs as `sort`/`sorted`, no abbreviations (`position`, not `pos`; `response`, not `resp`). Closure and loop parameters are named too (`positions.map { position in … }`), single letters only in test fixtures and pure math. Enforced by `identifier_name` (min 3 characters, `id` excluded by default; keep `warning: 3`, `error: 2`) plus review for abbreviations. [15][16]
- We allow `$0` only in a single-line, single-argument closure; `\.keyPath` beats `$0.field` (`positions.map(\.id)`). A multi-line closure or two arguments gets named parameters. Exception: `withDependencies { $0.clock = .immediate }` and `@Test(.dependencies { … })` overrides, which are Point-Free idiom. Enforced by `anonymous_argument_in_multiline_closure` and `shorthand_argument` with `always_disallow_more_than_one: true` (both opt-in, enable); test targets are excluded. [11][6]
- We make everything `private` first and widen only on need: `internal` inside a module, `public` only for symbols another Tuist target imports (`Domain` entities, `DesignSystem` components); never `fileprivate`. Access goes on members, not on extensions. Enforced by `strict_fileprivate`, `no_extension_access_modifier` (opt-in, enable) and `swift-format` `NoAccessLevelOnExtensionDeclaration`; `explicit_acl` stays off. [11][17]
- We put one primary type per file named like the file, one `extension Type: Protocol` per conformance in the same file, and no `// MARK:` comments: a file that needs sections is split. Enforced by `file_length` (warning 300), `type_body_length`, `one_declaration_per_file` (opt-in, enable) and `mark` (well-formed only). Test: the file holds its own `#Preview` and nothing else. *Partly convention*. [11]
- We write no narrative or justification comments, only hidden constraints or surprising behaviour; no `///` on internal symbols; `///` is required on `public` symbols of `Domain` and `DesignSystem` with a one-sentence summary. Dead code and unused imports are deleted in the same change. Enforced by `unused_import` and `unused_declaration` (analyzer rules; need `swiftlint analyze --compiler-log-path` after `xcodebuild`) and `swift-format` `BeginDocumentationCommentWithOneLineSummary`. [11][15]
- We import the narrowest module (`import Foundation` is not added when `SwiftUI` already re-exports it for the use) and sort imports with `swift-format` `OrderedImports`. [10]

### Tests
- We write Swift Testing: `@Suite struct`, `@Test("sentence")` without a `test` prefix, `#expect` for checks, `#require` to unwrap or stop, `init` instead of `setUp`. Several inputs go through `@Test(arguments:)` (arguments `Sendable`), never a `for` loop, so each case reports alone. XCTest stays only in `VoidXUITests` ([native-ui-tests](../repo/native-ui-tests.md)). Enforced by `swift-format` `SwiftTestingNamingConventions` and a custom rule `no_xctest_in_unit_tests` (regex `import XCTest`, excluded for `VoidXUITests`). [18][19][10]
- We override dependencies per test with the `.dependencies { $0.apiClient = .fixture }` trait, never a global or a singleton; every client port has `liveValue`, `testValue` and `previewValue`. Test fixtures may use short names (`sut`, `a`, `b`) only in `*Tests` targets (`identifier_name` is excluded there). [6][7]

### What each tool enforces
- We let `swift format` own layout (2 spaces, 100 columns, trailing commas, import order, `omit explicit returns`) and SwiftLint own semantics, and disable every SwiftLint rule that formats (`line_length`, `trailing_comma`, `vertical_whitespace`, `opening_brace`, `indentation_width`), because two tools reporting one thing makes agents oscillate ([skeleton.md](skeleton.md)). [10][17]
- We keep custom rules to regex ones in `.swiftlint.yml` (`custom_rules`; official builds support only regex, SwiftSyntax rules need a custom build); each uses `match_kinds` where it applies (for example `identifier` for `AnyView`) so comments and strings do not trigger. Count and names are in the lint config, not here. [11]

## Facts that constrain us
- Swift 6.2 (2025-09-15) added `@concurrent`, `nonisolated(nonsending)` by default and default MainActor isolation as an opt-in, long-term mode; Xcode 26 turns it on for new app targets. Xcode 27 ships Swift 6.4 ([agent-docs-and-skills.md](agent-docs-and-skills.md)); public skills still target 6.2. [12][13]
- Known rough edges of default MainActor: `CodingKey`-style conformances that expect nonisolated, and `Bundle.module`. Approachable Concurrency also enables `NonisolatedNonsendingByDefault` and `InferIsolatedConformances`. [14]
- SwiftLint `identifier_name` flags single letters (min length 3 warning, 2 error); `private_swiftui_state` covers `@State` and `@StateObject` in `View`, `App`, `Scene`, `ViewModifier`; `shorthand_argument` default `allow_until_line_after_opening_brace: 4`. SwiftLint 0.65.1 ([skeleton.md](skeleton.md)). [11]
- `force_unwrapping`, `implicitly_unwrapped_optional`, `shorthand_argument`, `anonymous_argument_in_multiline_closure`, `private_swiftui_state`, `explicit_acl` are disabled by default; `unused_import` is an analyzer rule that needs a compiler log. [11]
- swift-format defaults: `lineLength` 100, indentation 2 spaces, `fileScopedDeclarationPrivacy` private. Lint-only rules include `NeverForceUnwrap`, `UseSynthesizedInitializer`, `ReplaceForEachWithForLoop` (prefer `for in` over `forEach`), `SwiftTestingNamingConventions`. [10][17]
- `.task` runs async work at view appearance, and SwiftUI's performance sessions call out formatters, filtering and synchronous fetches in `body` or `init`. [1][2]
- Swift Testing parameterized arguments must be `Sendable`; each argument runs as its own test case. [18]

## Open questions
- `SWIFT_DEFAULT_ACTOR_ISOLATION` and `SWIFT_APPROACHABLE_CONCURRENCY` spellings come from the Xcode UI names ("Default Actor Isolation", "Approachable Concurrency") and a blog; confirm the raw keys and the Tuist `settings` syntax in a spike.
- Which defaults of swift-format are on: the rule list does not say. Run `swift format dump-configuration` and decide whether `AllPublicDeclarationsHaveDocumentation` is on.
- `swift-dependencies` documentation on `@ObservationIgnored @Dependency` in `@Observable` models was not reachable (403); the `@ObservationIgnored` rule above is taken from the swift-sharing README for `@Shared` and from Point-Free's usual guidance for `@Dependency`. Verify.
- Whether `unused_import` and `unused_declaration` can run in CI cost-effectively: they need a build log from `xcodebuild`, and `unused_declaration` is known to false-positive on SwiftUI previews and `@Observable` members.
- Does `strict_fileprivate` stay default-off, and does `one_declaration_per_file` exist in SwiftLint 0.65? The rule directory fetch was unreliable; check `swiftlint rules` before writing `.swiftlint.yml`.
- Wording of the cancellation guarantee for `.task` (Apple's page returned 404 through the fetch tool); verify the sentence on developer.apple.com.
- A closed `enum` for known problem codes with `.unknown(String)` is allowed in `Domain` as a mapping aid; the owner should confirm that it does not count as typed throws.

## Conflicts with existing docs (flagged, not resolved)
- ADR 0019: "Swift 6 strict concurrency with `@MainActor` models". This file drops the explicit annotation in MainActor-default modules; `Domain` stays nonisolated, which ADR 0019 does not state.
- ADR 0039 "ports throw typed errors" (in the TypeScript sense) versus Rule above: Swift ports throw untyped `Error`s carrying a `code`; typed throws are not used at boundaries.
- Resolved in [code style](../../concepts/code-style.md): closure shorthand follows the language idiom (one-line, non-nested, one parameter).
- ADR 0022 and skeleton.md name SwiftLint a11y rules only; this file adds ten more custom/opt-in rules, so `swiftlint --strict` gets noisier and the skeleton's "rules that overlap with formatting are disabled" list must include the ones named here.
- Resolved in [code style](../../concepts/code-style.md): `apps/ios-app/AGENTS.md` points to it.

## Sources
1. WWDC23 Demystify SwiftUI performance — https://developer.apple.com/videos/play/wwdc2023/10160/
2. WWDC25 Optimize SwiftUI performance with Instruments — https://developer.apple.com/videos/play/wwdc2025/306/
3. Managing model data in your app — https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app
4. Migrating from the Observable Object protocol to the Observable macro — https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro
5. swift-dependencies in-session use of `.task` (see 1) and Apple `task(priority:_:)` — https://developer.apple.com/documentation/swiftui/view/task(priority:_:)
6. pointfreeco/swift-dependencies README — https://github.com/pointfreeco/swift-dependencies
7. pointfreeco/swift-sharing README — https://github.com/pointfreeco/swift-sharing
8. The Swift Programming Language, Enumerations — https://docs.swift.org/swift-book/documentation/the-swift-programming-language/enumerations/
9. SE-0413 Typed throws — https://github.com/apple/swift-evolution/blob/main/proposals/0413-typed-throws.md
10. swift-format rule documentation and configuration — https://github.com/swiftlang/swift-format/blob/main/Documentation/RuleDocumentation.md
11. SwiftLint rule directory and custom rules — https://realm.github.io/SwiftLint/rule-directory.html
12. Swift 6.2 released — https://www.swift.org/blog/swift-6.2-released/
13. WWDC25 Embracing Swift concurrency — https://developer.apple.com/videos/play/wwdc2025/268/
14. Approachable Concurrency in Swift Packages (Use Your Loaf) — https://useyourloaf.com/blog/approachable-concurrency-in-swift-packages/
15. Swift API Design Guidelines — https://www.swift.org/documentation/api-design-guidelines/
16. SwiftLint identifier_name — https://realm.github.io/SwiftLint/identifier_name.html
17. swift-format README and configuration — https://github.com/swiftlang/swift-format/blob/main/Documentation/Configuration.md
18. Implementing parameterized tests — https://developer.apple.com/documentation/testing/parameterizedtesting
19. Migrating a test from XCTest — https://developer.apple.com/documentation/testing/migratingfromxctest
- [0003] [0019] [0039]: ADRs in `docs/decisions/`
