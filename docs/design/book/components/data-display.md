# Data display

## Position row

*list, compact and expanded; the default view on phone*

- **Anatomy.** Token pair, pair name and fee and chain line, value with the principal token amounts beside it ([ADR 0011](../../../decisions/0011-token-amounts-not-usd.md)), owed fees line, range bar. Status chip is hidden on phone and replaced by the bar shape.
- **Variants.** Default, selected (expanded layouts), partial value (adds a text note), spam-hidden (not shown).
- **States.** Default, pressed, focused, selected, loading (skeleton), out of range, stale.
- **Size.** Height follows content; minimum 72 (*design-pending*). The whole row is one tap target of at least `target.min` in height.
- **Behaviour.** Press or Return opens the details: a bottom sheet on phone, the detail column on native wide layouts, a Spotlight panel under the row on web (the other rows dim), an inline expansion when the container is narrow; an Open link goes to the position screen. Long press or secondary click opens the row menu. Selecting a row in a split layout never moves focus.
- **A11y.** One element. Spoken: pair, status, value, principal amounts, owed fees. Custom actions: Open, Set alert, Share, Copy address.
- **Tokens.** `space.inset.sm color.surface-container-lowest color.outline-variant font.role.title-sm font.role.body`
- **Data.** `pool.token0/1 fee-percent (*needs server field*) chain value.valueUsd partial amounts[principal] amounts[owed] range.*`

## Position card

*Cards view, all clients*

- **Anatomy.** Top: pair, status chip. Middle: pair name, meta. Hero value, owed fees line. Bottom: amounts and range bar.
- **Fill.** Card takes one of the four Fills by index modulo 4; the Ink is chosen by contrast.
- **States.** Default, hover (peek of owed fees), open, focused, loading, out of range.
- **Size.** Width fluid from 260 up; height content-driven, minimum 296 on web and 236 under 600 px, from screens.html (both *design-pending*). Cards form a grid that wraps into rows, columns at least 260 wide; on a phone it is one column.
- **Behaviour.** Web: hover only hints (peek of owed fees); click or Enter opens details in place with the Drawer (the face slides up and uncovers the details); an explicit Open link goes to the position page. Touch: tap opens a bottom sheet; native wide layouts use the detail column. Disclosure uses a real button with aria-expanded.
- **A11y.** The card is an article with one button as the hit area. Hidden details are inert while closed. Escape closes and returns focus.
- **Tokens.** `color.fill-1` to `color.fill-4`, `color.on-fill-1` to `color.on-fill-4`, `radius.lg space.inset.md elevation.level1 intent flip`

### Card data

Fields come from the [position model](../../../concepts/position-model.md). A card never shows a number the server did not send.

| Part | Source | Collapsed | Expanded | If missing or unusual |
|---|---|---|---|---|
| Token pair | `Token.logo` of both tokens | yes | yes | Monogram when `logo` is null |
| Pair name | `Token.symbol`, sanitized | yes | yes | Wraps to two lines, never truncated |
| Fee and chain | fee percent (*needs server field*; the raw `pool.fee` is not formatted on the client), `chain` | yes | no | V4 with `dynamicFee`: the word "dynamic" |
| Status | `range.status`, word plus shape | yes | no | No `range` (full-range share): no bar; the status word is pending |
| Value | `value.valueUsd` | yes | no | `partial` adds "partial value" to the meta line; never zero. Tokens only (no `prices`): the base token amount is the figure and the quote amount sits under it |
| Principal | `amounts` with role `principal`, per token | yes | yes | Exact strings formatted by the client |
| Range bar | `range.barPosition` | yes | yes | Unknown: dashed track, no marker |
| Updated | `asOf` | no | yes | An age line; stale values stay |
| Current price | `range.current` in the quote token | no | yes | |
| Range | `range.lower` to `range.upper` | no | yes | |
| Liquidity histogram | *needs server field* | no | yes | Omitted until a field exists |
| Owed fees, total | *needs server field* | yes | yes | Tokens only: the per-token amounts instead. Replaced by a line when `feeAccrual` is `redirected` or `compounded` |
| Owed fees, per token | `amounts` with role `owed` | peek only | yes | Only when `feeAccrual.mode` is `claimable` |
| Open link | position `ref` | no | yes | Goes to the Position screen |

Never on a card: read block, custody, position id, owner, rewards (empty in the MVP). They live on the [Position screen](../screens/position.md).

## Range bar

*data, every screen*

- **Anatomy.** Track, band (the position range), marker (current price), two end labels. Optional current price label on the position screen.
- **Position.** Marker position is the server value `barPosition` in tick space (0 to 1). The client never computes it.
- **States.** In range: marker is a circle inside the band. Out of range: marker changes shape and sits outside the band. Unknown: dashed track, no marker.
- **Rules.** Shape changes with status, so colour is never the only cue. All parts need 3:1 against the surface or fill under them.
- **Motion.** Marker follows the value with the `gentle` spring; under reduced motion it jumps.
- **A11y.** One image with text: status, quote token price, range low and high. Updated in place, not re-announced on every tick; a status change is announced once.
- **Tokens.** `radius.full`; colours are the ink of the surface it sits on: `color.on-fill-N` on a card, `color.on-surface` on a row ([ADR 0055](../../../decisions/0055-ghost-design-language.md)). Track is a rounded bar, band a lighter pill inside it, marker a round knob (in range) that turns into a diamond (out of range), as in [ghost-cards.html](../visual/prototypes/ghost-cards.html).
- **Data.** `range.lower range.upper range.current range.barPosition range.status`

## Status chip

*label, word + shape*

- **Anatomy.** Shape marker (dot for in range, diamond for out) and a word.
- **Variants.** `in-range out-of-range partial-value unlisted paused stale`. Unlisted marks a non-default token.
- **Size.** Height 28 (*design-pending*). Never truncated; wraps to a second line before it is cut.
- **Rules.** Always a word and a shape. A small decorative tilt is design, not structure.
- **A11y.** The text is the accessible name; the shape is hidden from the screen reader.
- **Tokens.** `color.surface-container-high color.on-surface color.warning-container color.on-warning-container color.error-container color.on-error-container radius.full font.role.label`

## Token pair

*image, decorative*

- **Anatomy.** Two token logos overlapping by a quarter of their width.
- **Size.** `icon.size.lg` or `avatar.size.sm`; always a circle.
- **Fallback.** Monogram of up to 3 characters on a token-derived tone, plus the chain badge. A missing logo never leaves a hole.
- **A11y.** Hidden from the screen reader. The pair name is text next to it.
- **Data.** `tokens[id].logo.hash tokens[id].symbol`

## Value

*text, tabular*

- **Anatomy.** Currency mark, whole part, optional decimals, optional note ("est.", "partial").
- **Roles.** By place: hero total `display-lg`, card value `display-md`, row value `display-sm`, amounts `body` with tabular digits.
- **Rules.** Tabular digits. Value is formatted by the client's shared formatter from the server's decimal string; the client computes nothing. An unpriced value is never shown as zero; it shows the amount or "n/a".
- **Motion.** A changed value rolls its digits in the direction of change; reduced motion swaps the text.
- **A11y.** Plain text. Live updates change in place; no live-region announcement per tick.
- **Tokens.** `font.role.display-* font.feature.tabular-nums color.on-surface`
