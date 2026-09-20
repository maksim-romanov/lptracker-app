package expo.modules.widgetbridge

import expo.modules.widgetbridge.widget.util.RangeMath
import org.junit.Test
import org.junit.Assert.*

// Prices, not ticks: the bar is placed from the decimal bounds the contract emits, so the same
// inputs produce the same bar on both platforms.
class RangeMathTest {
  @Test fun centeredPriceSitsMidBand() {
    val p = RangeMath.barPositions(lower = 1000.0, upper = 4000.0, current = 2000.0)
    assertTrue(p.inRange)
    assertEquals(0.5, p.thumbPct, 1e-9)
    assertEquals((1 - p.liquidityWidthPct) / 2, p.liquidityLeftPct, 1e-9)
  }

  @Test fun belowLowerOutOfRange() {
    val p = RangeMath.barPositions(lower = 1000.0, upper = 4000.0, current = 900.0)
    assertFalse(p.inRange)
    assertTrue("thumb left of band", p.thumbPct < p.liquidityLeftPct)
  }

  @Test fun aboveUpperOutOfRange() {
    val p = RangeMath.barPositions(lower = 1000.0, upper = 4000.0, current = 5000.0)
    assertFalse(p.inRange)
    assertTrue("thumb right of band", p.thumbPct > p.liquidityLeftPct + p.liquidityWidthPct)
  }

  @Test fun overshootSaturatesShortOfTheEdge() {
    val p = RangeMath.barPositions(lower = 1000.0, upper = 4000.0, current = 1e12)
    assertTrue(p.thumbPct < 1.0)
    assertTrue(p.thumbPct > 0.95)
  }

  @Test fun bandWidthGrowsWithSpanAndStaysClamped() {
    val tight = RangeMath.barPositions(lower = 0.999, upper = 1.001, current = 1.0)
    val wide = RangeMath.barPositions(lower = 100.0, upper = 100_000.0, current = 2000.0)
    assertTrue("wide band wider than tight", tight.liquidityWidthPct < wide.liquidityWidthPct)
    assertTrue(tight.liquidityWidthPct >= RangeMath.MIN_BAND_WIDTH_PCT)
    assertTrue(wide.liquidityWidthPct <= RangeMath.MAX_BAND_WIDTH_PCT)
  }

  @Test fun fullRangeCentresTheThumb() {
    val p = RangeMath.barPositions(lower = null, upper = null, current = 2000.0)
    assertTrue(p.inRange)
    assertEquals(0.5, p.thumbPct, 1e-9)
    assertTrue(p.liquidityWidthPct > 0.65)
    assertTrue(p.liquidityWidthPct <= RangeMath.MAX_BAND_WIDTH_PCT)
  }

  @Test fun oneUnboundedSideStillPlacesAgainstTheBoundThatExists() {
    val p = RangeMath.barPositions(lower = null, upper = 4000.0, current = 3999.0)
    assertTrue(p.inRange)
    assertTrue(p.thumbPct > 0.5)

    val escaped = RangeMath.barPositions(lower = null, upper = 4000.0, current = 4001.0)
    assertFalse(escaped.inRange)
  }

  @Test fun aPriceWithNoLogarithmDoesNotProduceANaNOffset() {
    val p = RangeMath.barPositions(lower = 1000.0, upper = 4000.0, current = 0.0)
    assertTrue(p.thumbPct.isFinite())
    assertFalse(p.inRange)
  }
}
