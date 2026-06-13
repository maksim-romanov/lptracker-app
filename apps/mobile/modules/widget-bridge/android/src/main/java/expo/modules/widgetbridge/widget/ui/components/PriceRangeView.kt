package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.glance.GlanceModifier
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.text.TextAlign
import expo.modules.widgetbridge.widget.data.WidgetTickRange
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography
import expo.modules.widgetbridge.widget.util.PriceMath

val WidgetTickRange.lowerLabel: String
  get() = PriceMath.format(PriceMath.tickToPrice(tickLower, decimalsDelta))
val WidgetTickRange.upperLabel: String
  get() = PriceMath.format(PriceMath.tickToPrice(tickUpper, decimalsDelta))
val WidgetTickRange.currentLabel: String
  get() = PriceMath.format(PriceMath.tickToPrice(currentTick, decimalsDelta))

@Composable
fun PriceRangeView(range: WidgetTickRange) {
  Column(modifier = GlanceModifier.fillMaxWidth()) {
    Row(modifier = GlanceModifier.fillMaxWidth()) {
      Text(
        text = range.lowerLabel,
        style = Typography.withColor(Typography.labelMd, Colors.textMuted),
        maxLines = 1,
      )
      Spacer(GlanceModifier.defaultWeight())
      Text(
        text = range.upperLabel,
        style = Typography.withColor(Typography.labelMd, Colors.textMuted),
        maxLines = 1,
      )
    }
    Spacer(GlanceModifier.height(Spacing.xs))
    RangeBarView(range)
    Spacer(GlanceModifier.height(Spacing.xs))
    Text(
      text = range.currentLabel,
      style = Typography.withColor(Typography.valueXxxs, Colors.textPrimary).copy(textAlign = TextAlign.Center),
      maxLines = 1,
      modifier = GlanceModifier.fillMaxWidth(),
    )
  }
}
