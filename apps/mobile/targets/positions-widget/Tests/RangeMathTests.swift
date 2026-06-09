import Foundation
import Testing
@testable import PositionsWidget

@Suite("RangeMath")
struct RangeMathTests {
  @Test("currentTick at the center of [lower, upper] yields equal half-widths")
  func centeredTick() {
    let positions = RangeMath.barPositions(currentTick: 0, tickLower: -1000, tickUpper: 1000)
    #expect(abs(positions.liquidityLeftPct - 0.5 + positions.leftHalf) < 1e-9)
    #expect(positions.inRange)
    #expect(positions.thumbPct == 0.5)
  }

  @Test("currentTick below tickLower marks position as out of range")
  func belowLower() {
    let positions = RangeMath.barPositions(currentTick: -2000, tickLower: -1000, tickUpper: 1000)
    #expect(!positions.inRange)
  }

  @Test("currentTick above tickUpper marks position as out of range")
  func aboveUpper() {
    let positions = RangeMath.barPositions(currentTick: 2000, tickLower: -1000, tickUpper: 1000)
    #expect(!positions.inRange)
  }

  @Test("Weibull saturates — distance of 100000 ticks does not exceed MAX_HALF (0.49)")
  func saturates() {
    let h = RangeMath.weibull(distance: 100_000)
    #expect(h < 0.49)
    #expect(h > 0.48)
  }

  @Test("thumb is always centered at 0.5")
  func thumbCenter() {
    let positions = RangeMath.barPositions(currentTick: 500, tickLower: -1000, tickUpper: 1000)
    #expect(positions.thumbPct == 0.5)
  }
}
