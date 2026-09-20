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
import expo.modules.widgetbridge.widget.data.WidgetPriceBounds
import expo.modules.widgetbridge.widget.data.WidgetStatus
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography

@Composable
fun PriceRangeView(bounds: WidgetPriceBounds, status: WidgetStatus) {
  Column(modifier = GlanceModifier.fillMaxWidth()) {
    Row(modifier = GlanceModifier.fillMaxWidth()) {
      Text(
        text = bounds.lowerLabel,
        style = Typography.withColor(Typography.labelMd, Colors.textMuted),
        maxLines = 1,
      )
      Spacer(GlanceModifier.defaultWeight())
      Text(
        text = bounds.upperLabel,
        style = Typography.withColor(Typography.labelMd, Colors.textMuted),
        maxLines = 1,
      )
    }
    Spacer(GlanceModifier.height(Spacing.xs))
    RangeBarView(bounds, status)
    Spacer(GlanceModifier.height(Spacing.xs))
    Text(
      text = bounds.currentLabel,
      style = Typography.withColor(Typography.valueXxxs, Colors.textPrimary).copy(textAlign = TextAlign.Center),
      maxLines = 1,
      modifier = GlanceModifier.fillMaxWidth(),
    )
  }
}
