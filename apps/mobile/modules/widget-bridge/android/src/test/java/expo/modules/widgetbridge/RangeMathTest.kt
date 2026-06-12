package expo.modules.widgetbridge

import expo.modules.widgetbridge.widget.util.RangeMath
import org.junit.Test
import org.junit.Assert.*

class RangeMathTest {
  @Test fun centeredInRange() {
    val p = RangeMath.barPositions(currentTick = 0, tickLower = -1000, tickUpper = 1000)
    assertTrue(p.inRange)
    assertEquals(0.5, p.thumbPct, 1e-9)
  }

  @Test fun belowLowerOutOfRange() {
    val p = RangeMath.barPositions(currentTick = -2000, tickLower = -1000, tickUpper = 1000)
    assertFalse(p.inRange)
    assertTrue("thumb left of band", p.thumbPct < p.liquidityLeftPct)
  }

  @Test fun aboveUpperOutOfRange() {
    val p = RangeMath.barPositions(currentTick = 2000, tickLower = -1000, tickUpper = 1000)
    assertFalse(p.inRange)
    assertTrue("thumb right of band", p.thumbPct > p.liquidityLeftPct + p.liquidityWidthPct)
  }

  @Test fun farOutAsymptotesShortOfEdge() {
    val p = RangeMath.barPositions(currentTick = 10_000, tickLower = -1000, tickUpper = 1000)
    assertTrue(p.thumbPct < 1.0)
    assertTrue(p.thumbPct > 0.85)
  }

  @Test fun bandWidthGrowsWithRange() {
    val narrow = RangeMath.barPositions(0, -100, 100).liquidityWidthPct
    val wide = RangeMath.barPositions(0, -100000, 100000).liquidityWidthPct
    assertTrue("wide band wider than narrow", wide > narrow)
  }
}
