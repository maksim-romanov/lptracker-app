# 0055 · Ghost: colour-block cards over a native shell

- Status: proposed
- Deciders: Maksim Romanov

## Context

Native-first calm looked bland, and copying a reference product's look would read as borrowed. VoidX needs one recognisable content layer on web, iOS, iPadOS, macOS and Android that stays readable in every palette and lively without hurting density ([research](../research/repo/design-direction.md)).

## Options

- **Native-first calm**: system look, character only in small details.
- **Utility table** in the Uniswap manner, or **editorial noir** in the Cosmos manner.
- **Ghost**: Phantom-inspired colour-block cards with one huge number each, on a native shell.

## Decision

Chosen **Ghost**, because it was the owner's pick across seven reference samples and survives every Scheme tested once ink is chosen per card ([samples](../research/repo/crypto-site-design-audit.md), [shell](../research/repo/brand-over-native.md)).

- Page tinted toward the Scheme hue; text in a deep ink, never pure black; pill buttons; bold headlines and figures with tight tracking.
- Positions are colour-block cards in four rotating fills. Each card picks its ink, dark or light, by the higher WCAG contrast against its fill; the contrast test checks every fill in every palette ([0027](0027-design-tokens.md)).
- The range bar uses only the card's ink: a hairline, the range as two brackets with a light fill, the price as a dot that becomes a diamond out of range. Status chips carry a word and a shape; out of range is an amber chip with dark ink in every palette.
- Two portfolio views in the MVP, remembered, with the choice kept in Settings: **Cards** (a grid that wraps into rows) and **Rows**.
- Hover only hints; position details open on click, Enter or tap. On web, Cards use **Drawer** (the face slides up and uncovers the details) and Rows use **Spotlight** (a panel under the row, the other rows dim; an inline expansion when the container is narrow); on phones a row opens a bottom sheet; native wide layouts use the detail column. The default view is Rows on phones and Cards on wide layouts. Motion values and reduced behaviour: [0023](0023-motion.md).
- Hover moves only an inner layer, so the hit area never leaves the pointer.
- The MVP ships one default Scheme: **Dragonfruit** (light, the primary surface designed first) and **Neon Night** (dark); values in [0027](0027-design-tokens.md). The theme follows the system unless the user picks light or dark. A user-selected Scheme comes after the MVP; a new Scheme is one more resolver context, not a redesign.
- Typeface: **DM Sans** for figures, titles and body text on every platform, figures in Bold; addresses and hashes in SF Mono on Apple and DM Mono elsewhere; Chinese in the platform CJK face ([typeface research](../research/repo/typeface.md)).

## Consequences

- One card component spec per client; navigation, sheets, menus and inputs stay native ([shell](../research/repo/brand-over-native.md)).
- A new Scheme ships only when the contrast test passes for every card fill in light and dark.
- After the MVP: a setting for the Scheme ([roadmap](../roadmap.md#after-the-mvp-personalisation)).
- Related: [0022](0022-accessibility.md), [0023](0023-motion.md), [0027](0027-design-tokens.md), [0031](0031-feature-flags-openfeature.md).
