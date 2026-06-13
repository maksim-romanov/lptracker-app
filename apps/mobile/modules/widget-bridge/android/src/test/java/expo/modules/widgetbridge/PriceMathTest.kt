package expo.modules.widgetbridge

import expo.modules.widgetbridge.widget.util.PriceMath
import org.junit.Test
import org.junit.Assert.*

class PriceMathTest {
  @Test fun tickZeroIsOneTimesScale() {
    assertEquals(1.0, PriceMath.tickToPrice(tick = 0, decimalsDelta = 0), 1e-9)
  }

  @Test fun decimalsDeltaScalesPrice() {
    val p = PriceMath.tickToPrice(0, -6)
    assertEquals(1e-6, p, 1e-12)
  }

  @Test fun infinityThreshold() {
    assertTrue(PriceMath.tickToPrice(800_000, 0).isInfinite())
    assertEquals(0.0, PriceMath.tickToPrice(-800_000, 0), 0.0)
  }

  @Test fun formatLargeUsesCompactSuffix() {
    assertEquals("1.5M", PriceMath.format(1_500_000.0))
    assertEquals("2B", PriceMath.format(2e9))
  }

  @Test fun formatNearOneTwoFractionDigits() {
    assertEquals("1.23", PriceMath.format(1.234))
  }

  @Test fun formatTinyUsesExp() {
    val s = PriceMath.format(1e-8).lowercase().replace(" ", "")
    assertEquals("1.00e-08", s)
  }

  @Test fun formatZeroOrLessIsZero() {
    assertEquals("0", PriceMath.format(0.0))
    assertEquals("0", PriceMath.format(-1.0))
  }

  @Test fun formatInfinityIsInfinitySymbol() {
    assertEquals("∞", PriceMath.format(Double.POSITIVE_INFINITY))
  }
}
