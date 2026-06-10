import Foundation

enum RangeMath {
  /// Band width clamps. Floor keeps the band visible against the thumb on
  /// micro-ranges; ceiling leaves bar margin for out-of-range overshoot.
  static let minBandWidthPct: Double = 0.20
  static let maxBandWidthPct: Double = 0.70

  /// Sigmoid in `log10(tickWidth)` space — center anchored at `log10(1000)`
  /// (≈ ±5% price band, a typical concentrated LP range). Wider position →
  /// wider band, monotonically, no hard plateau.
  static let bandWidthLogCenter: Double = 3.0
  static let bandWidthLogSpread: Double = 1.0

  /// Overshoot compression. As `|current - bound| / rangeWidth` grows the
  /// thumb travels through the side margin, asymptotically against the edge.
  static let overshootScale: Double = 1.5

  struct BarPositions {
    let liquidityLeftPct: Double
    let liquidityWidthPct: Double
    let thumbPct: Double
    let inRange: Bool
  }

  static func barPositions(currentTick: Int, tickLower: Int, tickUpper: Int) -> BarPositions {
    let rangeWidth = max(1, Double(tickUpper - tickLower))
    let bandWidth = bandWidthFor(tickWidth: rangeWidth)
    let bandLeftPct = (1 - bandWidth) / 2
    let bandRightPct = bandLeftPct + bandWidth

    let currentPos = Double(currentTick - tickLower) / rangeWidth
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

  private static func bandWidthFor(tickWidth: Double) -> Double {
    let logTicks = log10(max(1, tickWidth))
    let normalized = (logTicks - bandWidthLogCenter) / bandWidthLogSpread
    let sigmoid = 1 / (1 + exp(-normalized))
    return minBandWidthPct + sigmoid * (maxBandWidthPct - minBandWidthPct)
  }
}
