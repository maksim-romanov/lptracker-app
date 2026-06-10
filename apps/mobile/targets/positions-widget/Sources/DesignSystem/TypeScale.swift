import SwiftUI

/// Semantic typographic roles for the widget. Each role pins down both
/// the weight (Satoshi face) and the size in pts, so views never reach
/// for `.font(.satoshi(.bold, size: 16))` directly.
enum TypeScale {
  // MARK: - Pair (the widget headline)

  /// Small widget pair, e.g. `ETH/USDC`. Dominant identity element.
  static let pairLg = Font.satoshi(.black, size: 32)
  /// Medium widget pair, shares column with stats so smaller than `pairLg`.
  static let pairMd = Font.satoshi(.black, size: 21)

  // MARK: - Values (monospace-feel numbers)

  /// Medium widget primary value (Value column top).
  static let valueLg = Font.satoshi(.bold, size: 20)
  /// Small widget footer primary value.
  static let valueMd = Font.satoshi(.bold, size: 18)
  /// Medium widget primary fees / secondary value option.
  static let valueSm = Font.satoshi(.bold, size: 16)
  /// Medium widget secondary value (token1 amount under token0).
  static let valueXs = Font.satoshi(.bold, size: 14)
  /// Small widget footer secondary value (fees line).
  static let valueXxs = Font.satoshi(.bold, size: 13)
  /// Medium widget secondary fees, current price under range bar.
  static let valueXxxs = Font.satoshi(.bold, size: 12)

  // MARK: - Symbol suffix (`ETH` next to `1.234`)

  static let suffixLg = Font.satoshi(.medium, size: 12)
  static let suffixMd = Font.satoshi(.medium, size: 10)
  static let suffixSm = Font.satoshi(.medium, size: 9)

  // MARK: - Labels & tags

  /// Footer label (`Value`, `Fees`), small widget.
  static let labelLg = Font.satoshi(.medium, size: 12)
  /// Range bounds, tags large, empty state message.
  static let labelMd = Font.satoshi(.medium, size: 11)
  /// Tags compact.
  static let labelSm = Font.satoshi(.medium, size: 10)
}
