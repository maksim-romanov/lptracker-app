package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.glance.GlanceModifier
import androidx.glance.layout.Alignment
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.width
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography

@Composable
fun PairRow(
  sym0: String,
  sym1: String,
  positionRef: String,
  pairStyle: TextStyle,
  kind: ReverseButtonKind,
) {
  // Pair text takes remaining width with ellipsis so the ReverseButton
  // (fixed-size, drawn last) is never pushed off-screen on a narrow widget.
  Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = GlanceModifier.fillMaxWidth(),
  ) {
    Text(
      text = "$sym0/$sym1",
      style = Typography.withColor(pairStyle, Colors.textPrimary),
      maxLines = 1,
      modifier = GlanceModifier.defaultWeight(),
    )
    Spacer(GlanceModifier.width(Spacing.sm))
    ReverseButton(positionRef, kind)
  }
}
