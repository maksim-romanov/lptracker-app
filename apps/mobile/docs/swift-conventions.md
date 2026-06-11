# Swift / SwiftUI conventions

Applies to native iOS code in this repo — primarily `apps/mobile/targets/positions-widget/`.

The TypeScript conventions (`T`/`I`/`E` prefixes, kebab-case files) do **not** carry to Swift. Apple's API Design Guidelines explicitly forbid Hungarian prefixes, and Swift has module-level namespacing. Use `Position` not `TPosition`, `Repository` not `IRepository`, `ChainID` not `EChainId`.

## Naming

- Types and protocols: `UpperCamelCase`. Everything else: `lowerCamelCase`.
- Protocol names are nouns describing what something IS (`TimelineEntry`, `View`) or `-able`/`-ible`/`-ing` capabilities (`Equatable`). Never `IPositionRenderer`.
- Methods read as English at the call site: `positions.insert(p, at: 0)`, not `positions.insertAtIndex(p, 0)`.
- Boolean properties are assertions: `isEmpty`, `hasPrefix(_:)`. Never `getIsActive()`, `flagActive`.
- Abbreviations allowed only for established domain terms (`url`, `id`, `sqrtPriceX96`, `tickLower`).

## File naming

- One file = one primary type, file named after that type: `PositionEntity.swift` → `struct PositionEntity`.
- Extensions: `TypeName+Capability.swift` (e.g. `Color+Tokens.swift`, `PositionEntity+AppEntity.swift`).
- Multiple types per file only when tightly coupled (provider + its entry). Split as soon as either grows past ~30 lines or earns its own test.

## Folder structure (widget extension)

Feature-grouped, not type-grouped — matches Apple's modern sample apps. No MVVM/TCA/VIPER (overkill for a sandboxed extension).

```
positions-widget/
├── Sources/
│   ├── PositionsWidgetBundle.swift   @main entry, WidgetBundle
│   ├── Configuration/                Widget definition, AppIntent, AppEntity
│   ├── Timeline/                     Provider + Entry, SnapshotStore
│   ├── Models/                       Codable structs + discriminated-union enum
│   ├── Rendering/
│   │   ├── Common/                   Shared viewlets across protocols
│   │   ├── Small/  Medium/           Family-specific compositions
│   │   └── Protocols/<Name>/         Per-protocol tail views (V3, V4, ...)
│   ├── DesignSystem/                 Color+Tokens, Font+Satoshi, Spacing
│   └── Utilities/                    Pure-function helpers
├── Resources/
│   ├── Assets.xcassets/Colors/       Role-grouped (Background, Text, Status, Brand, Chains)
│   └── Fonts/                        Satoshi *.otf (not in xcassets)
└── Tests/
```

When a protocol payload grows past ~2 files, lift it into its own vertical slice: `Models/UniswapV3/Payload.swift`, `Models/UniswapV3/TickRange.swift`.

## SwiftUI

- View structs end with `View`: `SmallPositionView`, `ChainBadgeView`.
- Extract to a top-level `struct` when reused, holding own `@State`, needing own `#Preview`, or >40 lines. Otherwise use `@ViewBuilder private var sectionName: some View` — prefer the computed property over `private func ... -> some View` for trivial chunks.
- `ViewModifier` types live next to the consumer; only move to `DesignSystem/` once token-shaped (`.cardBackground()`).
- Environment values use the Xcode 16+ `@Entry` macro:

  ```swift
  extension EnvironmentValues {
    @Entry var chainTheme: ChainTheme = .ethereum
  }
  ```

- `@State` / `@Binding` use plain noun phrases: `@State private var isExpanded = false`.
- `#Preview` lives inline; move to `ViewName+Previews.swift` only when there are ≥6 variants.

## Swift 6 concurrency

- `View` is implicitly `@MainActor` in iOS 18+ — don't annotate.
- `TimelineProvider` methods are async-by-design and run off-main. Do **not** mark the provider `@MainActor`.
- `Entry` types and any `Codable` model crossing provider → view must conform to `Sendable` explicitly.
- `AppIntent` types are non-isolated unless they touch UI.
- `actor` is overkill for a ~50 KB snapshot file read per timeline reload — sync `Data(contentsOf:)` + value-type models is the right shape.

## Codable

- `CodingKeys` is a nested `enum` inside the type.
- If the payload is entirely snake_case, set `JSONDecoder.keyDecodingStrategy = .convertFromSnakeCase` at the load site and skip per-type `CodingKeys`.
- Discriminated unions: outer `enum: Codable` with custom `init(from:)` reads a discriminator key, then constructs the right payload variant. Each payload conforms to `Decodable` and reads the same outer decoder (not a nested key). Canonical example: `Models/PositionExtension.swift`.

## Extensions

- ✅ Add a capability or protocol conformance: `extension PositionEntity: AppEntity { ... }` in `PositionEntity+AppEntity.swift`.
- ❌ Do not use `extension` purely to organize one type internally. Use `// MARK: -` comments.
- One capability per extension file. `String+Validation.swift` good, `String+Everything.swift` bad.

## Assets

Color sets in `Assets.xcassets/Colors/` are grouped by **role**, not by hue (`Background/`, `Text/`, `Status/`, `Brand/`, `Chains/`). Folders use Xcode's "Provides Namespace" attribute; lookups use the slash form.

Wrap all lookups in `Color+Tokens.swift`:

```swift
extension Color {
  static let surface = Color("Background/Surface", bundle: .main)
  static let textPrimary = Color("Text/Primary", bundle: .main)
  static let inRange = Color("Status/InRange", bundle: .main)
}
```

Stringly-typed `Color("Surface")` calls scattered through view code are banned.

Custom fonts live in `Resources/Fonts/`, listed under `UIAppFonts` in `Info.plist`. Don't put fonts in `xcassets`.

## Anti-patterns

1. Hungarian / Java prefixes (`TPosition`, `IRepository`, `EChainID`).
2. Forgetting `@MainActor` when a `Task` reaches view-bound state. Use `await MainActor.run { ... }` or annotate the receiver.
3. Stringly-typed `Color("Surface")` outside `Color+Tokens.swift`.
4. `private func ... -> some View` for trivial chunks — use `@ViewBuilder private var`.
5. Swallowed errors with `try?` in decoding paths. Log them; a silent zero-data widget is a Heisenbug.

## Lint & format

- **Indentation: 2 spaces.** Configured in `.swift-format` and `.swiftlint.yml` (overrides Apple defaults).
- Line length: 110.
- `swift-format` (Apple, bundled with Xcode 16+) for whitespace and structure.
- `SwiftLint` (Realm) for semantic rules.
- Pre-commit via [lefthook](https://github.com/evilmartians/lefthook). Install: `brew install lefthook swift-format swiftlint`.
- Canonical configs live in the actual files (`apps/mobile/targets/positions-widget/.swift-format`, `.swiftlint.yml`) — read those, don't mirror here.
