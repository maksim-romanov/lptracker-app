package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.widget.data.WidgetStatus
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Typography

@Composable
fun StatusTag(status: WidgetStatus, size: TagSize = TagSize.Large) {
  val tint = when (status) {
    WidgetStatus.InRange -> Colors.statusInRange
    WidgetStatus.OutOfRange -> Colors.statusOutOfRange
    WidgetStatus.Closed -> Colors.textMuted
  }
  val label = when (status) {
    WidgetStatus.InRange -> "In range"
    WidgetStatus.OutOfRange -> "Out of range"
    WidgetStatus.Closed -> "Closed"
  }
  val backgroundOpacity = if (status == WidgetStatus.InRange) Opacity.surfaceTint else Opacity.surfaceTintStrong

  Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = GlanceModifier.tagChrome(
      size = size,
      background = tint.copy(alpha = backgroundOpacity),
    ),
  ) {
    Box(
      modifier = GlanceModifier
        .size(size.dotSize)
        .background(ColorProvider(tint))
        .cornerRadius(999.dp),
    ) {}
    Spacer(GlanceModifier.width(size.internalSpacing))
    Text(
      text = label,
      style = Typography.withColor(size.labelStyle, tint),
      maxLines = 1,
    )
  }
}
