package expo.modules.widgetbridge.widget.util

import kotlin.math.exp
import kotlin.math.log10
import kotlin.math.max

object RangeMath {
  private const val MIN_BAND_WIDTH_PCT = 0.20
  private const val MAX_BAND_WIDTH_PCT = 0.70
  private const val BAND_WIDTH_LOG_CENTER = 3.0
  private const val BAND_WIDTH_LOG_SPREAD = 1.0
  private const val OVERSHOOT_SCALE = 1.5

  data class BarPositions(
    val liquidityLeftPct: Double,
    val liquidityWidthPct: Double,
    val thumbPct: Double,
    val inRange: Boolean,
  )

  fun barPositions(currentTick: Int, tickLower: Int, tickUpper: Int): BarPositions {
    val rangeWidth = max(1.0, (tickUpper - tickLower).toDouble())
    val bandWidth = bandWidthFor(rangeWidth)
    val bandLeftPct = (1 - bandWidth) / 2
    val bandRightPct = bandLeftPct + bandWidth

    val currentPos = (currentTick - tickLower).toDouble() / rangeWidth
    val inRange = currentPos in 0.0..1.0

    val thumbPct = when {
      inRange -> bandLeftPct + currentPos * bandWidth
      currentPos < 0 -> {
        val overshoot = -currentPos
        val traveled = bandLeftPct * (1 - exp(-overshoot / OVERSHOOT_SCALE))
        bandLeftPct - traveled
      }
      else -> {
        val overshoot = currentPos - 1
        val traveled = (1 - bandRightPct) * (1 - exp(-overshoot / OVERSHOOT_SCALE))
        bandRightPct + traveled
      }
    }

    return BarPositions(bandLeftPct, bandWidth, thumbPct, inRange)
  }

  private fun bandWidthFor(tickWidth: Double): Double {
    val logTicks = log10(max(1.0, tickWidth))
    val normalized = (logTicks - BAND_WIDTH_LOG_CENTER) / BAND_WIDTH_LOG_SPREAD
    val sigmoid = 1 / (1 + exp(-normalized))
    return MIN_BAND_WIDTH_PCT + sigmoid * (MAX_BAND_WIDTH_PCT - MIN_BAND_WIDTH_PCT)
  }
}
