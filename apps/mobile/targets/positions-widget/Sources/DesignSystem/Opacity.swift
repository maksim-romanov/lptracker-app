import CoreGraphics

/// Named opacity levels. Every `.opacity(0.xx)` literal in views should
/// resolve to one of these — they represent specific design intents
/// (subtle surface tint vs. an outline vs. a glow), not arbitrary numbers.
enum Opacity {
  // MARK: - Strokes and surface tints

  /// Background fill for low-emphasis chips (e.g. neutral tag chip).
  static let strokeSubtle: CGFloat = 0.06
  /// Column divider lines.
  static let strokeMuted: CGFloat = 0.08
  /// Range-bar inactive track.
  static let strokeStrong: CGFloat = 0.10
  /// Background fill of a tinted status chip.
  static let surfaceTint: CGFloat = 0.12
  /// Slightly stronger background fill of a status chip.
  static let surfaceTintStrong: CGFloat = 0.14
  /// Hairline border around tinted chips.
  static let outlineHairline: CGFloat = 0.28

  // MARK: - Text states

  /// Placeholder text when a value is missing (e.g. `—` glyph).
  static let textDisabled: CGFloat = 0.45
  /// Slightly stronger placeholder for medium-density layouts.
  static let textPlaceholder: CGFloat = 0.5

  // MARK: - Glow / gradient

  /// Drop-shadow color for the range-bar thumb.
  static let glow: CGFloat = 0.55
  /// Starting opacity of the range-bar liquidity-band gradient.
  static let gradientStart: CGFloat = 0.85
}

/// Tokens for text dynamic resizing (`minimumScaleFactor`). Lower value =
/// more aggressive shrinking when content overflows.
enum TextScale {
  /// Headline pair text — shrinks substantially to fit `WBTC/USDC`.
  static let aggressive: CGFloat = 0.4
  /// Default for stat values and labels.
  static let standard: CGFloat = 0.5
  /// Tight range labels we want to keep close to designed size.
  static let moderate: CGFloat = 0.7
}
