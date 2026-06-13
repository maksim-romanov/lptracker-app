package expo.modules.widgetbridge.widget.util

import java.text.NumberFormat
import java.util.Locale
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.ln

object PriceMath {
  private const val INFINITY_THRESHOLD = 800_000

  fun tickToPrice(tick: Int, decimalsDelta: Int): Double {
    if (tick >= INFINITY_THRESHOLD) return Double.POSITIVE_INFINITY
    if (tick <= -INFINITY_THRESHOLD) return 0.0
    return exp(tick * ln(1.0001) + decimalsDelta * ln(10.0))
  }

  fun format(value: Double): String {
    if (!value.isFinite()) return "∞"
    if (value <= 0) return "0"
    if (value >= 1e15) return "∞"
    val a = abs(value)
    return when {
      a >= 1e6 -> compact(value)
      a >= 1000 -> decimal(value, 0)
      a >= 1 -> decimal(value, 2)
      a >= 0.01 -> decimal(value, 4)
      a >= 1e-6 -> decimal(value, 6)
      else -> String.format(Locale.US, "%.2e", value)
    }
  }

  private fun compact(value: Double): String {
    val a = abs(value)
    return when {
      a >= 1e12 -> "${decimal(value / 1e12, 2)}T"
      a >= 1e9 -> "${decimal(value / 1e9, 2)}B"
      a >= 1e6 -> "${decimal(value / 1e6, 2)}M"
      else -> decimal(value, 0)
    }
  }

  private fun decimal(value: Double, fractionDigits: Int): String {
    val f = NumberFormat.getInstance(Locale.US).apply {
      minimumFractionDigits = 0
      maximumFractionDigits = fractionDigits
      isGroupingUsed = false
    }
    return f.format(value)
  }
}
