import SwiftUI

/// Semantic typographic roles for the widget. Each role pins down both
/// the face and the size in pts, so views never reach for
/// `.font(.plex(.monoSemiBold, size: 16))` directly.
enum TypeScale {
  // MARK: - Pair (the widget headline)

  /// Small widget pair, e.g. `ETH/USDC`. Dominant identity element.
  static let pairLg = Font.plex(.sansSemiBold, size: 32)
  /// Medium widget pair, shares column with stats so smaller than `pairLg`.
  static let pairMd = Font.plex(.sansSemiBold, size: 21)

  // MARK: - Values (mono, so figures hold their column across refreshes)

  /// Medium widget primary value (Value column top).
  static let valueLg = Font.plex(.monoSemiBold, size: 20)
  /// Small widget footer primary value.
  static let valueMd = Font.plex(.monoSemiBold, size: 18)
  /// Medium widget primary fees / secondary value option.
  static let valueSm = Font.plex(.monoSemiBold, size: 16)
  /// Medium widget secondary value (token1 amount under token0).
  static let valueXs = Font.plex(.monoMedium, size: 14)
  /// Small widget footer secondary value (fees line).
  static let valueXxs = Font.plex(.monoMedium, size: 13)
  /// Medium widget secondary fees, current price under range bar.
  static let valueXxxs = Font.plex(.monoMedium, size: 12)

  // MARK: - Symbol suffix (`ETH` next to `1.234`)

  static let suffixLg = Font.plex(.sansMedium, size: 12)
  static let suffixMd = Font.plex(.sansMedium, size: 10)
  static let suffixSm = Font.plex(.sansMedium, size: 9)

  // MARK: - Labels & tags

  /// Footer label (`Value`, `Fees`), small widget.
  static let labelLg = Font.plex(.sansMedium, size: 12)
  /// Range bounds, tags large, empty state message.
  static let labelMd = Font.plex(.sansMedium, size: 11)
  /// Tags compact.
  static let labelSm = Font.plex(.sansMedium, size: 10)
}
