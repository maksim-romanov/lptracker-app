package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.glance.GlanceModifier
import androidx.glance.text.Text
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Typography

@Composable
fun MetaTag(text: String, size: TagSize = TagSize.Large) {
  Text(
    text = text,
    style = Typography.withColor(size.labelStyle, Colors.textMuted),
    maxLines = 1,
    modifier = GlanceModifier.tagChrome(
      size = size,
      background = Colors.textPrimary.copy(alpha = Opacity.strokeSubtle),
    ),
  )
}
