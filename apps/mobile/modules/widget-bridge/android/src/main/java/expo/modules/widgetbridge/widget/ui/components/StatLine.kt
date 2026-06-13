package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.glance.GlanceModifier
import androidx.glance.layout.Alignment
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography

data class TokenAmount(val value: String?, val symbol: String?)

@Composable
fun StatLine(
  amount: TokenAmount,
  valueStyle: TextStyle,
  symbolStyle: TextStyle,
  valueColor: Color,
) {
  val isEmpty = amount.value == null
  val text = amount.value ?: "—"
  Row(verticalAlignment = Alignment.Bottom) {
    Text(
      text = text,
      style = Typography.withColor(
        valueStyle,
        if (isEmpty) Colors.textMuted.copy(alpha = Opacity.textPlaceholder) else valueColor,
      ),
      maxLines = 1,
    )
    if (amount.symbol != null && !isEmpty) {
      Spacer(GlanceModifier.width(Spacing.xs))
      Text(
        text = amount.symbol,
        style = Typography.withColor(symbolStyle, Colors.textMuted),
        maxLines = 1,
      )
    }
  }
}
