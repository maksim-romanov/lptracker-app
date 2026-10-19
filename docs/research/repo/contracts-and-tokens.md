---
app: repo
topic: Contracts, mock API, schemas and design tokens
checked: 2026-09-30
---

# Contracts, mock API, schemas and design tokens

Input for the M0 skeleton: `packages/contracts` ([ADR 0010](../../decisions/0010-wire-contract.md)) and `packages/design-tokens` ([ADR 0027](../../decisions/0027-design-tokens.md), [ADR 0023](../../decisions/0023-motion.md)).

## Decisions

### Contract
- We build the spec with `app.getOpenAPI31Document()` from `@hono/zod-openapi` 1.x on Zod 4, because it is the 3.1 generator of the library ADR 0010 chose, and 3.1 writes nullability as type arrays. [1][2][3]
- We write `openapi.json` with a script (sorted keys, 2-space indent, trailing newline), and CI fails if `codegen` changes it (`git diff --exit-code`), because the library only serves the document at a route and has no file export. [1]
- We write open enums in `openapi.json` as `type: string` plus `x-known-values: [...]` with no `enum` keyword, because oasdiff 1.32.1 reports an added value in a response `enum` as an error, and it does not read extension keywords. [9][11][12]
- For Swift only, we generate a second file, `openapi.swift.json`. It turns each `x-known-values` into `anyOf: [{type: string, enum: [...]}, {type: string}]`, because this is the pattern swift-openapi-generator documents for open enums: known values decode into the enum branch, and unknown ones stay in the string branch. This matches ADR 0010's "Swift open enums via `anyOf`". It conflicts with the iOS audit note, which puts `anyOf` in the wire spec itself (see Open questions). [4][5]
- On Kotlin, open enums stay `String` wrapped in hand-written value classes, because openapi-generator's `enumUnknownDefaultCase` is off by default, and with kotlinx_serialization it does not decode unknown values reliably. [6][7]
- We use open enums only in responses. Request parameters and bodies keep a closed `enum`, so oasdiff still guards removals there. For a removed `x-known-values` entry we write our own test, because oasdiff does not see that change. [12]
- We define one `Problem` component: `type`, `title`, `status`, `detail`, `instance`, plus our `code`. It is served as `application/problem+json`, with extension members allowed, because RFC 9457 requires clients to ignore unknown extensions and requires `status` to match the HTTP status. [13]

### Breaking-change gate
- We run `oasdiff breaking <main>:openapi.json openapi.json --fail-on ERR` and keep the default severities, because the default already blocks new values in closed response enums (`response-property-enum-value-added`) and new `anyOf` branches (`response-property-any-of-added`). This is the ADR 0010 rule. [8][9][10]
- We pin oasdiff in `mise.toml` and keep its settings in `.oasdiff.yaml` (`fail-on`, `severity-levels`), because oasdiff 1.32 added 755 checks, and a version bump changes what fails. [11]
- We run oasdiff only on `openapi.json`, never on derived files, so the Swift-only `anyOf` rewrite never trips it.

### Mock API
- We use Prism 5.x: `prism mock` in static mode for app development and UI tests, and `prism mock -d --seed <n>` for a decoder fuzz job, because static mode returns the named examples and seeded dynamic mode is repeatable. [14][15]
- We generate a third file, `openapi.mock.json`, with the golden fixtures injected as named response `examples`. Apps choose one with `Prefer: example=<name>`. Without examples, Prism returns placeholders such as `"string"` for our open-enum strings. [14]
- We run `prism proxy` against the real server in CI, so responses that break the spec fail the build. [14]
- We keep Microcks as the fallback only. It matches request and response examples by name and discards incomplete ones, and it runs as a separate container service, which adds more setup than we need. [16]

### Golden fixtures
- We keep fixtures in `packages/contracts/fixtures/<schema>/<name>.json`. In TS, each fixture must pass the Zod schema and also validate against the matching `openapi.json` component. Swift and Kotlin tests decode the same files. `*.unknown.json` variants carry unknown enum values, an unknown `extension.type`, an unknown display `kind` and extra fields. This covers the ADR 0010 decode tests and the ADR 0003 golden vectors.

### Integration file schemas
- We generate `packages/integration-kit/schemas/{chain,manifest,deployment,quality}.schema.json` with `z.toJSONSchema(schema, { target: "draft-2020-12", io: "input", unrepresentable: "throw" })`, because the files are inputs (defaults stay optional), and `throw` stops a `z.transform` or `z.date` from silently becoming `{}`. [17]
- We declare these schemas with `z.strictObject`, so a mistyped key fails in `voidx validate` and in the editor.
- We map the schemas to globs in `.vscode/settings.json` (`json.schemas`, and `yaml.schemas` for `quality.yaml`), and CI validates every file against them. We don't add `$schema` to each file, which would be one more line per file for contributors to get wrong.

### Design tokens
- We write the tokens in DTCG 2025.10 format (`*.tokens.json`) and build them with Terrazzo ([token-pipeline](token-pipeline.md)). Colour tokens are `{colorSpace, components, alpha?}` objects, dimension tokens are `{value, unit}` with `px` or `rem`, duration is `{value, unit}` in `ms` or `s`, and cubicBezier is `[x1, y1, x2, y2]`, which maps to CSS `cubic-bezier()`, SwiftUI `.timingCurve` and Compose `CubicBezierEasing`. [18]
- We store a spring as a `duration` token (its perceptual duration) with `$extensions["voidx.spring"] = { bounce }`, bounce from 0 to 0.4. DTCG has no spring type, every token must use a spec type, and tools must keep unknown `$extensions`, so a tool that ignores the extension still reads a valid duration. Apple calls mass, stiffness and damping "not very intuitive" and configures every spring with `duration` and `bounce`, advising caution above 0.4; Compose's `dampingRatio` and `stiffness` and Motion's `visualDuration` and `bounce` are the same two numbers. Conversions: [0027](../../decisions/0027-design-tokens.md); settling-time formula and seed values: [android-app/motion](../android-app/motion.md#spring-token-seed-derived). The extension key avoids the domain, which is configuration ([0044](../../decisions/0044-domain-as-configuration.md)). [18][26][27]
- We generate `@theme` with `--*: initial` and only our namespaces (`--color-*`, `--spacing-*`, `--radius-*`, `--text-*`, `--font-*`, `--ease-*`, `--animate-*`), and override the colour variables for dark mode in a `prefers-color-scheme` block. This way agents cannot fall back to Tailwind's default palette. [23]
- The contrast test reads an explicit list of foreground/background pairs from a tokens file. It converts both colours to sRGB and checks the WCAG 2.2 ratio in light and dark: ≥ 4.5:1 for text, ≥ 3:1 for large text and non-text UI. [24][25]

## Facts that constrain us
- `@hono/zod-openapi` 1.6.3: peer `zod ^4.0.0`, depends on `@asteasolutions/zod-to-openapi ^9.1.0`. Since zod-to-openapi v8, Zod `.meta()` is read like `.openapi()`, and zod-to-openapi does not support Zod 3. [2][3]
- The OpenAPI document (zod-to-openapi) and the integration JSON Schemas (`z.toJSONSchema`) come from two different converters, so the same Zod type may come out slightly differently in each. [3][17]
- `z.toJSONSchema` targets draft-2020-12 (default), draft-07, draft-04 and openapi-3.0. It cannot represent `bigint`, `date`, `map`, `set`, `transform`, `custom`, `undefined`, `void`, `nan` or `symbol`. [17]
- swift-openapi-generator supports OpenAPI 3.0 and 3.1 and has preliminary 3.2 support. [5]
- oasdiff 1.32.1 (2026-09-15) has native 3.1 support (type-array nullability, `if/then/else`), a free GitHub Action, and blocks external `$ref`s by default. [11]
- Prism 5.16.0 (2026-07-17) lists 3.1 support without a feature matrix. Recent releases are mostly dependency and CI fixes, and 5.16 added Scarf analytics. [15]
- RFC 9457: when `type` is missing it means `about:blank`. The RFC recommends absolute, dereferenceable `type` URIs and keeps an IANA registry of problem types. [13]
- DTCG 2025.10: `$root` and `$extends` exist, references may be `{a.b}` or JSON Pointer, and there is no spring or motion-physics type. [18]

## Open questions
- **Conflict:** iOS audit note, "We emit open enums as `anyOf: [enum, string]`", versus ADR 0010 and the position model, "`type: string` with `x-known-values`". The derived `openapi.swift.json` above satisfies both, but the owner should confirm.
- **Conflict:** ADR 0010, "Swift and Kotlin clients are generated and committed", versus the Android audit, "hand-write `@JvmInline value class` wrappers". Which parts of the Kotlin client are generated is still open.
- **Conflict:** ADR 0039 and the plans doc use problem `type` `plan-limit`, a relative URI. RFC 9457 prefers absolute URIs, and self-hosted instances have different origins. Should `type` be one fixed official URL?
- Does oasdiff report enum values added inside an `anyOf` branch? This matters only if the Swift file is ever diffed.
- Prism's support for 3.1 type arrays, `const` and `examples` arrays is undocumented. The M0 spike runs Prism against the generated spec to find out.
- Resolved in [colour-and-contrast](colour-and-contrast.md): Color.js, already pulled in by Terrazzo, declared directly.
- How Swift tests read fixtures that live outside the target: SwiftPM resources must sit under the target, so options are a Tuist resource path or a copy step.

## Sources
1. @hono/zod-openapi README — https://github.com/honojs/middleware/tree/main/packages/zod-openapi
2. @hono/zod-openapi package.json — https://raw.githubusercontent.com/honojs/middleware/main/packages/zod-openapi/package.json
3. zod-to-openapi README — https://github.com/asteasolutions/zod-to-openapi
4. Swift OpenAPI Generator, Useful OpenAPI patterns — https://swiftpackageindex.com/apple/swift-openapi-generator/documentation/swift-openapi-generator/useful-openapi-patterns
5. swift-openapi-generator README — https://github.com/apple/swift-openapi-generator
6. OpenAPI Generator, Kotlin options — https://openapi-generator.tech/docs/generators/kotlin/
7. VoidX Android audit notes — ../android-app/audit-notes.md
8. oasdiff breaking changes — https://github.com/oasdiff/oasdiff/blob/main/docs/BREAKING-CHANGES.md
9. oasdiff check response-property-enum-value-added — https://www.oasdiff.com/checks/response-property-enum-value-added
10. oasdiff check response-property-any-of-added — https://www.oasdiff.com/checks/response-property-any-of-added
11. What's new in oasdiff — https://www.oasdiff.com/whats-new
12. oasdiff 1.32.1 and x-extensible-enum, measured (article) — https://github.com/skkap/yad/pull/9
13. RFC 9457 Problem Details for HTTP APIs — https://www.rfc-editor.org/rfc/rfc9457.html
14. Prism HTTP mocking guide — https://github.com/stoplightio/prism/blob/master/docs/guides/01-mocking.md
15. Prism releases — https://github.com/stoplightio/prism/releases
16. Microcks OpenAPI conventions — https://microcks.io/documentation/references/artifacts/openapi-conventions/
17. Zod, JSON Schema — https://zod.dev/json-schema
18. DTCG Format Module 2025.10 — https://www.designtokens.org/tr/2025.10/format/
19. Style Dictionary, DTCG — https://styledictionary.com/info/dtcg/
20. Style Dictionary issue #1590, DTCG 2025.10 support — https://github.com/style-dictionary/style-dictionary/issues/1590
21. Style Dictionary releases — https://github.com/style-dictionary/style-dictionary/releases
22. Style Dictionary predefined formats — https://styledictionary.com/reference/hooks/formats/predefined/
23. Tailwind CSS, theme variables — https://tailwindcss.com/docs/theme
24. WCAG 2.2 Understanding 1.4.3 Contrast (Minimum) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
25. WCAG 2.2 Understanding 1.4.11 Non-text Contrast — https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
26. WWDC23 Animate with springs — https://developer.apple.com/videos/play/wwdc2023/10158/
27. Motion `spring` — https://motion.dev/docs/spring
