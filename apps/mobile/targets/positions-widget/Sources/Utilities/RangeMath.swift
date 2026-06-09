import Foundation

enum RangeMath {
  static let scaleTicks: Double = 10_000
  static let shapeAlpha: Double = 0.5
  static let maxHalf: Double = 0.49

  struct BarPositions {
    let leftHalf: Double
    let rightHalf: Double
    let liquidityLeftPct: Double
    let liquidityWidthPct: Double
    let thumbPct: Double
    let inRange: Bool
  }

  static func weibull(distance: Double) -> Double {
    let d = max(distance, 0)
    return maxHalf * (1 - exp(-pow(d / scaleTicks, shapeAlpha)))
  }

  static func barPositions(currentTick: Int, tickLower: Int, tickUpper: Int) -> BarPositions {
    let leftDist = Double(currentTick - tickLower)
    let rightDist = Double(tickUpper - currentTick)
    let leftHalf = leftDist > 0 ? weibull(distance: leftDist) : -weibull(distance: -leftDist)
    let rightHalf = rightDist > 0 ? weibull(distance: rightDist) : -weibull(distance: -rightDist)
    let inRange = leftHalf > 0 && rightHalf > 0

    let leftPct = 0.5 - leftHalf
    let rightPct = 0.5 + rightHalf
    let liquidityWidthPct = max(0, rightPct - leftPct)

    return BarPositions(
      leftHalf: leftHalf,
      rightHalf: rightHalf,
      liquidityLeftPct: leftPct,
      liquidityWidthPct: liquidityWidthPct,
      thumbPct: 0.5,
      inRange: inRange
    )
  }
}
