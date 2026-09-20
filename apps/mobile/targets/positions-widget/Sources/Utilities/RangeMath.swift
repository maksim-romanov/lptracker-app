import Foundation

enum RangeMath {
  /// Band width clamps. Floor keeps the band visible against the thumb on
  /// micro-ranges; ceiling leaves bar margin for out-of-range overshoot.
  static let minBandWidthPct: Double = 0.20
  static let maxBandWidthPct: Double = 0.70

  /// Sigmoid in `log10(ln(upper / lower))` space — center anchored at a range
  /// about 1.1x wide, a typical concentrated LP band. Wider position → wider
  /// band, monotonically, no hard plateau.
  static let bandWidthLogCenter: Double = -1.0
  static let bandWidthLogSpread: Double = 1.0

  /// Below this the range draws the narrowest band: a 0.01% span, and nothing
  /// tighter is separable on a 155pt bar.
  static let minLogSpan: Double = 1e-4

  /// An unbounded side has no price to place, and a bar with an infinite end
  /// draws nothing. It runs this far from the current price instead — e^89
  /// covers every price an AMM can quote — so a range unbounded on both sides
  /// puts the thumb dead center, which is what full range is.
  static let unboundedLogSpan: Double = 88.7

  /// Overshoot compression. As `|current - bound| / rangeWidth` grows the
  /// thumb travels through the side margin, asymptotically against the edge.
  static let overshootScale: Double = 1.5

  struct BarPositions {
    let liquidityLeftPct: Double
    let liquidityWidthPct: Double
    let thumbPct: Double
    let inRange: Bool
  }

  static func barPositions(lower: Double?, upper: Double?, current: Double) -> BarPositions {
    let currentLog = logPrice(current)
    let lowerLog = lower.map(logPrice) ?? currentLog - unboundedLogSpan
    let upperLog = upper.map(logPrice) ?? currentLog + unboundedLogSpan

    let span = max(minLogSpan, upperLog - lowerLog)
    let bandWidth = bandWidthFor(logSpan: span)
    let bandLeftPct = (1 - bandWidth) / 2
    let bandRightPct = bandLeftPct + bandWidth

    let currentPos = (currentLog - lowerLog) / span
    let inRange = currentPos >= 0 && currentPos <= 1

    let thumbPct: Double
    if inRange {
      thumbPct = bandLeftPct + currentPos * bandWidth
    } else if currentPos < 0 {
      let overshoot = -currentPos
      let traveled = bandLeftPct * (1 - exp(-overshoot / overshootScale))
      thumbPct = bandLeftPct - traveled
    } else {
      let overshoot = currentPos - 1
      let traveled = (1 - bandRightPct) * (1 - exp(-overshoot / overshootScale))
      thumbPct = bandRightPct + traveled
    }

    return BarPositions(
      liquidityLeftPct: bandLeftPct,
      liquidityWidthPct: bandWidth,
      thumbPct: thumbPct,
      inRange: inRange
    )
  }

  /// A price of zero, or one that failed to parse, has no logarithm — and a NaN
  /// percentage reaches the layout as a bar with no thumb at all.
  private static func logPrice(_ price: Double) -> Double {
    let value = log(price)
    return value.isFinite ? value : -unboundedLogSpan
  }

  private static func bandWidthFor(logSpan: Double) -> Double {
    let normalized = (log10(logSpan) - bandWidthLogCenter) / bandWidthLogSpread
    let sigmoid = 1 / (1 + exp(-normalized))
    return minBandWidthPct + sigmoid * (maxBandWidthPct - minBandWidthPct)
  }
}
