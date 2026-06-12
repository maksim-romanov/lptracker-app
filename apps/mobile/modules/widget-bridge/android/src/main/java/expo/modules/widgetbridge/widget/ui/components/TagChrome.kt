package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.padding
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.widget.theme.Sizing
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography

data class TagSize(
  val labelStyle: TextStyle,
  val dotSize: Dp,
  val horizontalPadding: Dp,
  val verticalPadding: Dp,
  val internalSpacing: Dp,
) {
  companion object {
    val Large = TagSize(
      labelStyle = Typography.labelMd,
      dotSize = Sizing.Tag.dotLarge,
      horizontalPadding = Spacing.md,
      verticalPadding = Spacing.xxs,
      internalSpacing = Spacing.xs,
    )
    val Compact = TagSize(
      labelStyle = Typography.labelSm,
      dotSize = Sizing.Tag.dotSmall,
      horizontalPadding = Spacing.sm,
      verticalPadding = Spacing.xxs,
      internalSpacing = Spacing.xs,
    )
  }
}

fun GlanceModifier.tagChrome(size: TagSize, background: Color): GlanceModifier =
  this
    .background(ColorProvider(background))
    .cornerRadius(999.dp)
    .padding(horizontal = size.horizontalPadding, vertical = size.verticalPadding)
