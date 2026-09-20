import Foundation
import Testing

@testable import PositionsWidget

@Suite("RangeMath")
struct RangeMathTests {
  @Test("a current price at the geometric centre of the range sits mid-band")
  func centeredPrice() {
    let positions = RangeMath.barPositions(lower: 1000, upper: 4000, current: 2000)
    #expect(positions.inRange)
    #expect(abs(positions.thumbPct - 0.5) < 1e-9)
    #expect(abs(positions.liquidityLeftPct - (1 - positions.liquidityWidthPct) / 2) < 1e-9)
  }

  @Test("a price below the lower bound is out of range")
  func belowLower() {
    let positions = RangeMath.barPositions(lower: 1000, upper: 4000, current: 900)
    #expect(!positions.inRange)
    #expect(positions.thumbPct < positions.liquidityLeftPct)
  }

  @Test("a price above the upper bound is out of range")
  func aboveUpper() {
    let positions = RangeMath.barPositions(lower: 1000, upper: 4000, current: 5000)
    #expect(!positions.inRange)
    #expect(positions.thumbPct > positions.liquidityLeftPct + positions.liquidityWidthPct)
  }

  @Test("overshoot compresses towards the edge without ever reaching it")
  func overshootSaturates() {
    let positions = RangeMath.barPositions(lower: 1000, upper: 4000, current: 1e12)
    #expect(positions.thumbPct < 1)
    #expect(positions.thumbPct > 0.95)
  }

  @Test("a wider range draws a wider band, clamped to the ceiling")
  func bandWidthGrowsWithSpan() {
    let tight = RangeMath.barPositions(lower: 0.999, upper: 1.001, current: 1)
    let wide = RangeMath.barPositions(lower: 100, upper: 100_000, current: 2000)
    #expect(tight.liquidityWidthPct < wide.liquidityWidthPct)
    #expect(tight.liquidityWidthPct >= RangeMath.minBandWidthPct)
    #expect(wide.liquidityWidthPct <= RangeMath.maxBandWidthPct)
  }

  @Test("a range unbounded on both sides centres the thumb near the widest band")
  func fullRange() {
    let positions = RangeMath.barPositions(lower: nil, upper: nil, current: 2000)
    #expect(positions.inRange)
    #expect(abs(positions.thumbPct - 0.5) < 1e-9)
    #expect(positions.liquidityWidthPct > 0.65)
    #expect(positions.liquidityWidthPct < RangeMath.maxBandWidthPct)
  }

  @Test("one unbounded side still places the thumb against the bound that exists")
  func halfUnbounded() {
    let positions = RangeMath.barPositions(lower: nil, upper: 4000, current: 3999)
    #expect(positions.inRange)
    #expect(positions.thumbPct > 0.5)

    let escaped = RangeMath.barPositions(lower: nil, upper: 4000, current: 4001)
    #expect(!escaped.inRange)
  }

  @Test("a price with no logarithm does not produce a NaN offset")
  func degeneratePrice() {
    let positions = RangeMath.barPositions(lower: 1000, upper: 4000, current: 0)
    #expect(positions.thumbPct.isFinite)
    #expect(!positions.inRange)
  }
}
