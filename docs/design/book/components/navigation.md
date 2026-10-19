# Navigation

## Navigation bar

*bar, per screen*

- **Anatomy.** Back (when pushed), title, up to two trailing actions; on Portfolio and Position an optional condensed-value slot that shows the hero total once the hero scrolls under the bar ([sticky header](../../../research/repo/sticky-header-motion.md)).
- **Rules.** On native clients the title is the one heading that takes focus on arrival; web page loads let the browser manage focus. Large title on the top level of a tab where the platform has one.
- **Expanded.** The bar becomes a toolbar; back is replaced by the sidebar and selection.
- **Tokens.** `layer.bars color.background color.outline-variant`

## Tab bar and sidebar

*navigation, three destinations*

- **Destinations.** Portfolio, Alerts, Settings. Same names and order everywhere.
- **Compact and medium.** Bottom tab bar, labels always shown. One stack per tab.
- **Expanded.** Sidebar with the same destinations; wallets appear as a filter list under Portfolio; the Summary under a wallet filter is a *needs server field* (a per-wallet total), otherwise it stays `totals.all`.
- **Rules.** Never hidden or disabled. A gated tab explains why and offers the next step.
- **A11y.** Tab semantics; current item is announced. Targets 44.
