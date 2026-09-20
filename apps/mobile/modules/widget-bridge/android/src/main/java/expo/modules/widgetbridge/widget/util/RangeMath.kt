package expo.modules.widgetbridge.widget.util

import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.log10
import kotlin.math.max

object RangeMath {
  /** Band width clamps. Floor keeps the band visible against the thumb on
   *  micro-ranges; ceiling leaves bar margin for out-of-range overshoot. */
  const val MIN_BAND_WIDTH_PCT = 0.20
  const val MAX_BAND_WIDTH_PCT = 0.70

  /** Sigmoid in `log10(ln(upper / lower))` space — center anchored at a range
   *  about 1.1x wide, a typical concentrated LP band. Wider position → wider
   *  band, monotonically, no hard plateau. */
  private const val BAND_WIDTH_LOG_CENTER = -1.0
  private const val BAND_WIDTH_LOG_SPREAD = 1.0

  /** Below this the range draws the narrowest band: a 0.01% span, and nothing
   *  tighter is separable on a 155pt bar. */
  private const val MIN_LOG_SPAN = 1e-4

  /** An unbounded side has no price to place, and a bar with an infinite end
   *  draws nothing. It runs this far from the current price instead — e^89
   *  covers every price an AMM can quote — so a range unbounded on both sides
   *  puts the thumb dead center, which is what full range is. */
  private const val UNBOUNDED_LOG_SPAN = 88.7

  /** Overshoot compression. As `|current - bound| / rangeWidth` grows the
   *  thumb travels through the side margin, asymptotically against the edge. */
  private const val OVERSHOOT_SCALE = 1.5

  data class BarPositions(
    val liquidityLeftPct: Double,
    val liquidityWidthPct: Double,
    val thumbPct: Double,
    val inRange: Boolean,
  )

  fun barPositions(lower: Double?, upper: Double?, current: Double): BarPositions {
    val currentLog = logPrice(current)
    val lowerLog = lower?.let { logPrice(it) } ?: (currentLog - UNBOUNDED_LOG_SPAN)
    val upperLog = upper?.let { logPrice(it) } ?: (currentLog + UNBOUNDED_LOG_SPAN)

    val span = max(MIN_LOG_SPAN, upperLog - lowerLog)
    val bandWidth = bandWidthFor(span)
    val bandLeftPct = (1 - bandWidth) / 2
    val bandRightPct = bandLeftPct + bandWidth

    val currentPos = (currentLog - lowerLog) / span
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

  /** A price of zero, or one that failed to parse, has no logarithm — and a NaN
   *  percentage reaches the layout as a bar with no thumb at all. */
  private fun logPrice(price: Double): Double {
    val value = ln(price)
    return if (value.isFinite()) value else -UNBOUNDED_LOG_SPAN
  }

  private fun bandWidthFor(logSpan: Double): Double {
    val normalized = (log10(logSpan) - BAND_WIDTH_LOG_CENTER) / BAND_WIDTH_LOG_SPREAD
    val sigmoid = 1 / (1 + exp(-normalized))
    return MIN_BAND_WIDTH_PCT + sigmoid * (MAX_BAND_WIDTH_PCT - MIN_BAND_WIDTH_PCT)
  }
}
