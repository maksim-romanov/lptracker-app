package expo.modules.widgetbridge.widget.ui.components

import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Shader
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.toArgb
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import expo.modules.widgetbridge.widget.data.WidgetPriceBounds
import expo.modules.widgetbridge.widget.data.WidgetStatus
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Sizing
import expo.modules.widgetbridge.widget.util.RangeMath
import kotlin.math.max

private const val BAR_WIDTH_PX = 600
private const val BAR_HEIGHT_PX = 48

// The thumb sits at the current price whatever the status, so a position that holds nothing can
// still land inside its old bounds. Only a status that holds liquidity earns a live tint.
private fun holdsLiquidity(status: WidgetStatus): Boolean = when (status) {
  WidgetStatus.InRange, WidgetStatus.OutOfRange -> true
  WidgetStatus.Drained, WidgetStatus.Closed, WidgetStatus.Unknown -> false
}

private fun render(bounds: WidgetPriceBounds, status: WidgetStatus): Bitmap {
  val pos = RangeMath.barPositions(bounds.lowerPrice, bounds.upperPrice, bounds.currentPrice)
  val w = BAR_WIDTH_PX.toFloat()
  val h = BAR_HEIGHT_PX.toFloat()
  val trackHeight = 40f
  val thumbDiameter = 46f
  val fillColor = when {
    !holdsLiquidity(status) -> Colors.textMuted
    pos.inRange -> Colors.statusInRange
    else -> Colors.statusOutOfRange
  }

  val bmp = Bitmap.createBitmap(BAR_WIDTH_PX, BAR_HEIGHT_PX, Bitmap.Config.ARGB_8888)
  val canvas = Canvas(bmp)
  val paint = Paint(Paint.ANTI_ALIAS_FLAG)

  // Inactive track
  paint.color = Colors.textPrimary.copy(alpha = Opacity.strokeStrong).toArgb()
  canvas.drawRoundRect(
    0f, (h - trackHeight) / 2,
    w, (h + trackHeight) / 2,
    trackHeight / 2, trackHeight / 2, paint,
  )

  // Active gradient capsule
  val activeLeft = (w * pos.liquidityLeftPct).toFloat()
  val activeWidth = max(0f, (w * pos.liquidityWidthPct).toFloat())
  if (activeWidth > 0) {
    val activeRight = activeLeft + activeWidth
    paint.shader = LinearGradient(
      activeLeft, 0f, activeRight, 0f,
      fillColor.copy(alpha = Opacity.gradientStart).toArgb(),
      fillColor.toArgb(),
      Shader.TileMode.CLAMP,
    )
    canvas.drawRoundRect(
      activeLeft, (h - trackHeight) / 2,
      activeRight, (h + trackHeight) / 2,
      trackHeight / 2, trackHeight / 2, paint,
    )
    paint.shader = null
  }

  // Thumb
  val thumbX = (w * pos.thumbPct).toFloat().coerceIn(thumbDiameter / 2, w - thumbDiameter / 2)
  val thumbY = h / 2

  // Glow
  paint.color = fillColor.copy(alpha = Opacity.glow).toArgb()
  paint.maskFilter = BlurMaskFilter(12f, BlurMaskFilter.Blur.NORMAL)
  canvas.drawCircle(thumbX, thumbY, thumbDiameter / 2 + 4f, paint)
  paint.maskFilter = null

  // Fill
  paint.style = Paint.Style.FILL
  paint.color = fillColor.toArgb()
  canvas.drawCircle(thumbX, thumbY, thumbDiameter / 2, paint)

  // Stroke
  paint.style = Paint.Style.STROKE
  paint.strokeWidth = Sizing.RangeBar.thumbStrokePx
  paint.color = Colors.bgPrimary.toArgb()
  canvas.drawCircle(thumbX, thumbY, thumbDiameter / 2, paint)

  return bmp
}

@Composable
fun RangeBarView(bounds: WidgetPriceBounds, status: WidgetStatus) {
  val bitmap = remember(bounds, status) { render(bounds, status) }
  Image(
    provider = ImageProvider(bitmap),
    contentDescription = null,
    modifier = GlanceModifier.fillMaxWidth().height(Sizing.RangeBar.thumb),
  )
}
