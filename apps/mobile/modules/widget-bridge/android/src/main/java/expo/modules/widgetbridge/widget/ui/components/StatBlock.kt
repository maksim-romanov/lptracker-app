package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.glance.layout.Column
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Typography

enum class Density(
  val primary: TextStyle,
  val secondary: TextStyle,
  val primarySymbol: TextStyle,
  val secondarySymbol: TextStyle,
) {
  Display(Typography.valueLg, Typography.valueXs, Typography.suffixLg, Typography.suffixMd),
  Compact(Typography.valueSm, Typography.valueXxxs, Typography.suffixSm, Typography.suffixSm),
}

@Composable
fun StatBlock(
  label: String,
  accent: Color,
  primary: TokenAmount,
  secondary: TokenAmount,
  density: Density,
  /** Replaces both figures when there is no amount to show and the dash would misreport why. */
  unknownLabel: String? = null,
) {
  Column {
    Text(
      text = label,
      style = Typography.withColor(Typography.labelMd, Colors.textMuted),
      maxLines = 1,
    )
    if (unknownLabel != null) {
      Text(
        text = unknownLabel,
        style = Typography.withColor(Typography.labelLg, Colors.textMuted),
        maxLines = 1,
      )
    } else {
      StatLine(primary, density.primary, density.primarySymbol, accent)
      StatLine(secondary, density.secondary, density.secondarySymbol, accent)
    }
  }
}
