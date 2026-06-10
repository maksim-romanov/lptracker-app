# Swift / SwiftUI Conventions

Reference for native iOS code in this repo — primarily the widget extension at `apps/mobile/targets/positions-widget/`. Apply this **instead of** the project's TypeScript conventions for any Swift file.

## Hard rule: TypeScript conventions do not carry to Swift

The TS rules in [`code-style.md`](./code-style.md) (`T`/`I`/`E` prefixes, kebab-case files) are a TS-side choice. In Swift they're wrong — Swift has module-level namespacing and Apple's API Design Guidelines explicitly forbid Hungarian prefixes.

| TypeScript (this project) | Swift (this doc) |
|---------------------------|------------------|
| `TPosition`, `IRepository`, `EChainId` | `Position`, `Repository`, `ChainID` |
| `kebab-case.ts` | `UpperCamelCase.swift` |
| `interface IFoo {}` | `protocol Foo { ... }` |

## Naming (Apple API Design Guidelines)

- Types and protocols: `UpperCamelCase`. Everything else: `lowerCamelCase`.
- Protocol names are either nouns describing what something IS (`Collection`, `View`, `TimelineEntry`) or `-able`/`-ible`/`-ing` capabilities (`Equatable`, `ProgressReporting`). Never `IPositionRenderer`.
- Methods read as English at the call site: `positions.insert(p, at: 0)`, not `positions.insertAtIndex(p, 0)`.
- Properties are noun phrases: `tickRange`, `currentEntry`.
- Boolean properties are assertions: `isEmpty`, `hasPrefix(_:)`, `intersects(_:)`. Never `getIsActive()`, `flagActive`.
- Abbreviations allowed only for established domain terms (`url`, `id`, `sqrtPriceX96`, `tickLower`). No `posMgr`, no `rng`.

## File naming

- One file = one primary type, file named after that type: `PositionEntity.swift` → `struct PositionEntity`.
- Extensions go in their own file: `TypeName+Capability.swift`. Examples: `Color+Tokens.swift`, `Font+Satoshi.swift`, `PositionEntity+AppEntity.swift`.
- Multiple types in one file are OK when tightly coupled (provider + its entry, view + tiny private modifier). Split as soon as either grows past ~30 lines or earns its own test.
- Test files: `PositionEntityTests.swift` (XCTest or swift-testing — same naming).

## Folder structure (widget extension)

Feature-grouped, not type-grouped. Matches Apple's modern sample apps (Backyard Birds, CloudKit sync engine). No MVVM/TCA/VIPER — overkill for a sandboxed extension.

```
apps/mobile/targets/positions-widget/
├── expo-target.config.js
├── Info.plist
├── .swift-format
├── .swiftlint.yml
├── Sources/
│   ├── PositionsWidgetBundle.swift          @main entry point, WidgetBundle
│   ├── Configuration/                       Widget definition, AppIntent, AppEntity
│   ├── Timeline/                            Provider + Entry, SnapshotStore
│   ├── Models/                              Codable structs + discriminated union enum
│   ├── Rendering/
│   │   ├── Common/                          Shared SwiftUI viewlets across protocols
│   │   ├── Small/                           systemSmall composition
│   │   ├── Medium/                          systemMedium composition
│   │   └── Protocols/<Name>/                Per-protocol tail views (V3, V4, ...)
│   ├── DesignSystem/                        Color+Tokens, Font+Satoshi, Spacing, etc.
│   └── Utilities/                           Pure-function helpers (math, hex parsing)
├── Resources/
│   ├── Assets.xcassets/
│   │   └── Colors/                          Role-grouped: Background/, Text/, Status/, ...
│   └── Fonts/                               Satoshi *.otf (not in xcassets)
└── Tests/
```

When a protocol-specific payload grows complex (>2 files), lift it into its own vertical slice: `Models/UniswapV3/Payload.swift`, `Models/UniswapV3/TickRange.swift`.

## SwiftUI conventions

- View structs end with `View`: `SmallPositionView`, `ChainBadgeView`. Apple's own code does this.
- Extract a subview to a top-level struct when it's reused, holds its own `@State`, needs its own `#Preview`, or is >40 lines. Otherwise use a `@ViewBuilder private var sectionName: some View`.
- Prefer `@ViewBuilder` computed properties over `private func returning some View` for trivial extracted chunks.
- `ViewModifier` types live next to the consumer; move to `DesignSystem/` only when token-shaped (`.cardBackground()`).
- Environment values: use the Xcode 16+ `@Entry` macro:

  ```swift
  extension EnvironmentValues {
    @Entry var chainTheme: ChainTheme = .ethereum
  }
  ```

- Plain noun-phrase names for `@State` / `@Binding`: `@State private var isExpanded = false`, never `stateIsExpanded`.
- `#Preview` macros sit inline in the view file. Extract to `ViewName+Previews.swift` only when there are ≥6 preview variants.

## Swift 6 concurrency

- `View` is implicitly `@MainActor` in iOS 18+ SwiftUI — don't annotate manually.
- `TimelineProvider` methods are async-by-design and run off-main. Do NOT mark the provider `@MainActor`.
- `Entry` types and any `Codable` model crossing provider→view must be `Sendable`. Conform explicitly: `struct Entry: TimelineEntry, Sendable { ... }`.
- `AppIntent` types are non-isolated unless they touch UI.
- Reach for `actor` only for shared mutable state under concurrent access. A ~50 KB snapshot file read per timeline reload does not warrant an actor — sync `Data(contentsOf:)` + value-type models is the right shape.

## Codable

- `CodingKeys` is a nested `enum` inside the type — universal idiom.
- If the entire payload is snake_case, prefer a single `JSONDecoder.keyDecodingStrategy = .convertFromSnakeCase` at the load site and skip `CodingKeys` per type.
- Discriminated unions: external `enum: Codable` with custom `init(from:)` that reads a discriminator key first, then constructs the right payload variant. Each payload conforms to `Decodable` and reads the same outer decoder (not a nested key). See `Models/PositionExtension.swift` in the widget for the canonical pattern.

## Extensions

- ✅ Add capability or protocol conformance: `extension PositionEntity: AppEntity { ... }` in `PositionEntity+AppEntity.swift`.
- ❌ Do NOT use `extension` purely to organize a single type internally. Use `// MARK: -` comments instead.
- One capability per extension file. `String+Validation.swift` good, `String+Everything.swift` bad.

## Assets

- Color sets in `Assets.xcassets` are grouped by **role**, not by hue:

  ```
  Assets.xcassets/Colors/
  ├── Background/
  │   ├── Primary.colorset
  │   └── Surface.colorset
  ├── Text/
  │   ├── Primary.colorset
  │   └── Secondary.colorset
  ├── Status/
  │   ├── InRange.colorset
  │   └── OutOfRange.colorset
  ├── Brand/
  │   ├── Primary.colorset
  │   └── Glow.colorset
  └── Chains/
      ├── Ethereum.colorset
      └── Base.colorset
  ```

- Folders use Xcode's "Provides Namespace" attribute; lookups use the slash form: `Color("Background/Surface", bundle: .main)`.
- Wrap all lookups in `Color+Tokens.swift`:

  ```swift
  extension Color {
    static let surface = Color("Background/Surface", bundle: .main)
    static let textPrimary = Color("Text/Primary", bundle: .main)
    static let inRange = Color("Status/InRange", bundle: .main)
  }
  ```

  Stringly-typed `Color("Surface")` calls scattered in view code are banned.

- SF Symbols additions: only when Apple doesn't ship the symbol. `.symbolset` files in `Assets.xcassets/Symbols/`, lowercase dotted names (`position.range.fill`).
- Custom fonts live in `Resources/Fonts/`, listed under `UIAppFonts` in `Info.plist`. Don't put fonts in `Assets.xcassets`.

## Anti-patterns

1. Hungarian / Java prefixes (`TPosition`, `IRepository`, `EChainID`).
2. `final class` as the default. Reach for `struct` first; use `class` only when you need reference identity, inheritance, or `deinit`.
3. `static let shared` singletons used as a convenience global. OK for genuine process-wide resources, banned otherwise.
4. `try!` and `!` force-unwrap in shipping code paths. Use `guard let ... else { ... }` or `try?` + logged fallback. Exception: `#Preview` blocks.
5. `class` for value-like models. `Snapshot`, `Position`, `PriceRange` are `struct`.
6. Forgetting `@MainActor` when a `Task` reaches view-bound state. Use `await MainActor.run { ... }` or annotate the receiver.
7. Inventing `protocol` for things that should be `enum` with associated values.
8. Stringly-typed `Color("Surface")` scattered in views. Wrap in `Color+Tokens.swift`.
9. `private func returning some View` for trivial extracted chunks. Use `@ViewBuilder private var`.
10. Swallowed errors with `try?` in decoding paths. Log them; a silent zero-data widget is a Heisenbug.
11. Implicitly unwrapped optionals (`var foo: Position!`). Banned.

## Formatting and lint

- **Indentation: 2 spaces.** Override Apple-default 4 in both `.swift-format` and `.swiftlint.yml`.
- Line length: 110.
- `swift-format` (Apple, bundled with Xcode 16+) for whitespace and structure.
- `SwiftLint` (Realm) for semantic rules — `file_name`, `file_name_no_space`, `type_name`, `identifier_name`, `explicit_init`, `sorted_imports`.
- Pre-commit via [lefthook](https://github.com/evilmartians/lefthook): native binary, parallel hooks, no Node bootstrap.
- Install on dev machines: `brew install lefthook swift-format swiftlint`. Never via npm.

### Canonical `.swift-format`

```json
{
  "version": 1,
  "indentation": { "spaces": 2 },
  "lineLength": 110,
  "respectsExistingLineBreaks": true,
  "lineBreakBeforeControlFlowKeywords": false,
  "lineBreakBeforeEachArgument": true,
  "rules": {
    "AlwaysUseLowerCamelCase": true,
    "AlwaysUseUpperCamelCase": true,
    "TypeNamesShouldBeCapitalized": true,
    "NoLeadingUnderscores": true,
    "FileScopedDeclarationPrivacy": true,
    "OrderedImports": true,
    "UseShorthandTypeNames": true,
    "ValidateDocumentationComments": false
  }
}
```

### Canonical `.swiftlint.yml`

```yaml
included:
  - Sources
  - Tests

opt_in_rules:
  - file_name
  - file_name_no_space
  - explicit_init
  - sorted_imports
  - prefer_self_type_over_type_of_self
  - redundant_type_annotation

disabled_rules:
  - todo

type_name:
  min_length: 3
  max_length:
    warning: 50
    error: 60

identifier_name:
  min_length:
    error: 2
  excluded: [id, to, in, at, URL, x, y]
```

## References

- [Apple — Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/)
- [Google — Swift Style Guide](https://google.github.io/swift/)
- [swift-format — RuleDocumentation](https://github.com/swiftlang/swift-format/blob/main/Documentation/RuleDocumentation.md)
- [SwiftLint](https://github.com/realm/swiftlint)
- [Swift Migration Guide — Data-Race Safety](https://github.com/swiftlang/swift-migration-guide)
- [Apple — Creating a widget extension](https://developer.apple.com/documentation/widgetkit/creating-a-widget-extension)
