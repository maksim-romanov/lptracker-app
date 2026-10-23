# Prototypes

Single-file HTML prototypes in [visual/prototypes/](visual/prototypes/). Open them in a browser. The files here are the source.

| Prototype | File | What it holds | Status |
|---|---|---|---|
| Ghost Cards | [ghost-cards.html](drawings/proto-ghost-cards.md) | Position card engine: Drawer (Cards) and Spotlight (Rows) on web, bottom sheet on phone, range bar with spring knob, live values | Approved base |
| UI Kit | [ui-kit.html](drawings/proto-ui-kit.md) | One kit for web, iOS and Android: colour blocks, capsule controls, sheets, accessibility lab | Approved |
| Navigation Map | [navigation-map.html](drawings/proto-navigation-map.md) | Three tabs, every arrow with iOS, Android and web behaviour, entry points from widgets, push and links | Draft; entry rules proposed |
| Mac and iPad Pass | [mac-ipad-pass.html](drawings/proto-mac-ipad-pass.md) | Sidebar, split view, Settings window, menu bar, keyboard | Draft |
| OS 27 and System Surfaces | [os27-surfaces.html](drawings/proto-os27-surfaces.md) | What iOS, iPadOS and macOS 27 change; surfaces outside the app | Draft, partly secondary sources |
| Widgets | [widgets.html](drawings/proto-widgets.md) | Home Screen Small and Medium, Lock Screen shapes, empty state, rendering modes, Android | Approved by the owner |
| Screens | [screens.html](drawings/proto-screens.md) | Every MVP screen on web (390 to 1280 px), iPhone, iPad and Mac; wallet tags and filters, sticky header, states (loading, partial failure, stale, guest over the limit, `plan-limit`), tokens only for M1 to M3; deep links `#<platform>-<screen>` | D0 base, in progress |
| Landing One Block | [landing-one-block.html](drawings/proto-landing-one-block.md) | Landing as one full-screen block, black frosted glass, phone with pushes and widgets | Liked; mobile layout rejected |
| Landing Scroll | [landing-scroll.html](drawings/proto-landing-scroll.md) | Pinned scroll story: iPhone, iPad and Mac, star field | Rejected for now |
| Landing Story | [landing-story.html](drawings/proto-landing-story.md) | Earlier landing prototype built on the screens engine | Superseded |

The wireframe previews are in [visual/wireframes/](visual/wireframes/).

Prototypes use the default Scheme (Dragonfruit, Neon Night) and DM Sans. Approved ones are a source of truth; drafts are not ([which source wins](README.md#which-source-wins)).

## Screens prototype: not drawn yet

The screen pages win over [screens.html](visual/prototypes/screens.html) until it is approved. Draw these before the owner approves it:

- iPad and Mac: Alerts, Add wallet, Wallets, Plans, Sign in; the Settings content on iPad; Preferences and About in the Mac Settings window.
- Web: the alert rule dialog.
- Alerts: the out-of-range summary line, the unread mark, the push-off banner.
- Plans: the current plan, limit rows against usage, the action button.
- Settings: the section order of the page and the Appearance row.
- Portfolio: `failed` (nothing answered, last data kept), the `truncated` note, the `unpriced` note.
- Position: `loading`, `failed`, not found or closed.

## Known deviations

Approved prototypes break these rules. The rule wins; each prototype fixes them before its next approval.

| Prototype | Deviation | Rule |
|---|---|---|
| ghost-cards.html | Springs and easings are its own (`weights` stiffness and damping, `--bouncy`, `--wobbly`, `--ease` 900 ms, `--lift-dur`, `--d-ease`) instead of `brisk`, `gentle`, `flip`; the knob spring (stiffness 170, damping 15) has bounce 0.42, over 0.4; Spotlight `.details` overshoots | [ADR 0023](../../decisions/0023-motion.md), [ADR 0027](../../decisions/0027-design-tokens.md) |
| ghost-cards.html | The narrow Rows expansion animates `max-height` | Disclosures open at once and fade, never animate height ([ADR 0023](../../decisions/0023-motion.md)) |
| ghost-cards.html | `.card:focus-visible` opens the Drawer and Spotlight | Focus never opens; a real button with `aria-expanded` does ([position card](components/data-display.md#position-card)) |
| ghost-cards.html | Secondary text by opacity (`.meta` 0.72, `.amounts` 0.82, `.ends` 0.7) | Solid colour with 4.5:1 against its fill |
| ghost-cards.html | Chip tilt (`rotate(±3deg)`) | No tilt in v0 ([motion](foundations/motion.md#ui-kit-v0)) |
| ghost-cards.html | `--surface`, `--amber` and several `bandFor` results lie outside sRGB | [Clamped values](foundations/colour.md#m0-values) |
| ui-kit.html | Focus ring is `--accent`, 3 px, offset 2 px, outside fills | [Focus ring](foundations/colour.md#focus-ring) |
| ui-kit.html | Press and knob motion use `--spring` 420 ms, `--press` 160 ms and 700 ms literals | `brisk`, or none for the knob ([motion](foundations/motion.md#ui-kit-v0)) |
| ui-kit.html | Light `--surface` and `--success`, dark `--danger` lie outside sRGB; amber chip is 0.86 0.15 85 | [Clamped values](foundations/colour.md#m0-values) |

