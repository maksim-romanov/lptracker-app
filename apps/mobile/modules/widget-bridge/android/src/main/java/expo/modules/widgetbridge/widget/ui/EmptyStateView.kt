package expo.modules.widgetbridge.widget.ui

import androidx.compose.runtime.Composable
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.text.Text
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.R
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Sizing
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography

enum class EmptyReason { NotConfigured, ConfiguredMissing }

@Composable
fun EmptyStateView(reason: EmptyReason) {
  val (iconRes, message) = when (reason) {
    EmptyReason.NotConfigured ->
      R.drawable.ic_widgets to "Long-press to pick a position"
    EmptyReason.ConfiguredMissing ->
      R.drawable.ic_warning to "This position is no longer available. Long-press to pick another."
  }
  Column(
    modifier = GlanceModifier.fillMaxSize().padding(Spacing.lg),
    horizontalAlignment = Alignment.Horizontal.CenterHorizontally,
    verticalAlignment = Alignment.Vertical.CenterVertically,
  ) {
    Image(
      provider = ImageProvider(iconRes),
      contentDescription = null,
      colorFilter = ColorFilter.tint(ColorProvider(Colors.textMuted)),
      modifier = GlanceModifier.size(Sizing.Icon.emptyState),
    )
    Spacer(GlanceModifier.height(Spacing.md))
    Text(
      text = message,
      style = Typography.withColor(Typography.labelMd, Colors.textMuted),
      maxLines = 3,
    )
  }
}
