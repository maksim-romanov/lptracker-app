# 0022 · Semantics and accessibility are enforced on every client

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every client must be semantically correct and accessible. Most code is written by agents, so rules only hold if CI enforces them.

## Options

- **Guidelines in docs, manual audits**.
- **WCAG 2.2 AA as a merge gate with per-platform checks**.

## Decision

Chosen **WCAG 2.2 AA as a merge gate**:

| Client | CI gates |
|---|---|
| Web | Biome a11y rules as errors, with a canary file proving they fire on Hono JSX; html-validate on every page and frame; axe-core via Playwright on every page and after frame reloads; Lighthouse accessibility 100; token contrast test; keyboard navigation tests |
| iOS | `performAccessibilityAudit()` on every screen in every scenario on iPhone, iPad and macOS; SwiftLint strict with a11y rules; snapshots at accessibility text sizes, clipped text fails |
| Android | Compose accessibility checks in UI tests; Roborazzi at font scale 1.0, 1.5, 2.0; Lint a11y rules as errors; Glance tests for content descriptions |

Rules for every client:

- Addresses are read as start and end ("starting 0x1f9a, ending 4c2b") with a copy action.
- Token amounts are spoken in locale format with the unit; one shared formatter builds the visible and spoken strings.
- In or out of range is never shown by colour alone.
- The range bar has a text alternative.
- Live updates are not announced automatically; only important changes go to a polite, throttled live region.
- Every control has a spoken name; icon-only controls also get a Voice Control input label (`accessibilityInputLabels`, Compose `contentDescription`). Checked by the audits above.
- Every swipe, drag and long-press has a button or a custom action with the same result (WCAG 2.5.7), and a list row is one element with swipe and context actions as custom actions. *convention*, checked in the manual pass.
- A live value changes in place: element identity stays stable, so the screen reader cursor never resets. *convention*.
- Tabs are never hidden or disabled; an empty or gated tab says why and offers the next step. *convention*.
- iPad and Mac work from the keyboard: lists, sidebar and fields take focus, commands carry a ⌘ shortcut listed in the menu bar, ⌘, opens settings, and selecting a row never moves focus into the detail. A nightly XCUITest keyboard scenario checks it.
- macOS has no Larger Text, so its checks are window sizes from the minimum to full screen and display zoom, not text-size snapshots.
- Colour has an increased-contrast token context ([0027](0027-design-tokens.md)). Screens are checked with Increase Contrast, Reduce Transparency, Bold Text and Differentiate Without Color on together.
- Web also passes reflow at 320 px and 400% zoom, WCAG 1.4.12 text spacing, Playwright `forcedColors: 'active'` and `prefers-contrast: more`, and sticky bars never hide focus. *convention*, checked in the manual pass.
- Android also sets `Role`, `stateDescription`, `heading`, `collectionInfo` and `paneTitle`, keeps a visible Tab and arrow focus, and never locks orientation on windows from 600 dp. *convention*, checked in the manual pass.
- Nothing flashes more than three times a second (WCAG 2.3.1). *convention*.
- Addresses and amounts stay left to right inside right-to-left text; one right-to-left screenshot scenario (Portfolio with a pseudo right-to-left label; no right-to-left language ships in the MVP, [0041](0041-i18n.md)) runs nightly (*planned*).
- Before a release a person runs the manual pass in [research](../research/repo/accessibility-all-devices.md); the App Store accessibility labels claim only what passes it. *convention*.

## Consequences

- Classic page loads on the web let the browser manage focus and announcements ([0018](0018-web-ssr-hotwire.md)).
- PR gates on native apps: [0048](0048-e2e-testing.md).
- Per-app rules live in `apps/<app>/docs/`.
- Related: [0023](0023-motion.md), [0027](0027-design-tokens.md).
