import Foundation

/// One reading of a position's price range: decimal strings as the contract emits them, and the
/// label the snapshot has already formatted for each. A nil bound is unbounded, not missing.
struct WidgetPriceBounds: Codable, Sendable, Hashable {
  let lower: String?
  let upper: String?
  let current: String
  let lowerLabel: String
  let upperLabel: String
  let currentLabel: String

  var lowerPrice: Double? { lower.flatMap(Double.init) }
  var upperPrice: Double? { upper.flatMap(Double.init) }
  var currentPrice: Double { Double(current) ?? 0 }
}

struct WidgetPriceRange: Codable, Sendable, Hashable {
  let quoted: WidgetPriceBounds
  let inverted: WidgetPriceBounds

  func flipped() -> WidgetPriceRange {
    WidgetPriceRange(quoted: inverted, inverted: quoted)
  }
}
