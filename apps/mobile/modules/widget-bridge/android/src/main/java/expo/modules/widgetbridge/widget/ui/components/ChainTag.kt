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
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Typography
import expo.modules.widgetbridge.widget.util.ChainCatalog

@Composable
fun ChainTag(chainId: Int, size: TagSize = TagSize.Large) {
  Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = GlanceModifier.tagChrome(
      size = size,
      background = Colors.textPrimary.copy(alpha = Opacity.strokeSubtle),
    ),
  ) {
    Box(
      modifier = GlanceModifier
        .size(size.dotSize)
        .background(ColorProvider(Colors.chain(chainId)))
        .cornerRadius(999.dp),
    ) {}
    Spacer(GlanceModifier.width(size.internalSpacing))
    Text(
      text = ChainCatalog.shortName(chainId),
      style = Typography.withColor(size.labelStyle, Colors.textMuted),
      maxLines = 1,
    )
  }
}
