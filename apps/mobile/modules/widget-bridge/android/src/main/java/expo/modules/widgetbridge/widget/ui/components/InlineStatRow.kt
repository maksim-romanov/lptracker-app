package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.glance.GlanceModifier
import androidx.glance.layout.Alignment
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Typography

@Composable
fun InlineStatRow(
  label: String,
  left: String?,
  right: String?,
  valueStyle: TextStyle,
  accent: Color,
  /** Replaces both values when there is no amount to show and the dash would misreport why. */
  unknownLabel: String? = null,
) {
  val joined = "${left ?: "—"} / ${right ?: "—"}"
  Row(verticalAlignment = Alignment.Bottom, modifier = GlanceModifier.fillMaxWidth()) {
    Text(
      text = label,
      style = Typography.withColor(Typography.labelLg, Colors.textMuted),
      maxLines = 1,
    )
    Spacer(GlanceModifier.defaultWeight())
    Text(
      text = unknownLabel ?: joined,
      style = if (unknownLabel != null) {
        Typography.withColor(Typography.labelLg, Colors.textMuted)
      } else {
        Typography.withColor(valueStyle, accent)
      },
      maxLines = 1,
    )
  }
}
