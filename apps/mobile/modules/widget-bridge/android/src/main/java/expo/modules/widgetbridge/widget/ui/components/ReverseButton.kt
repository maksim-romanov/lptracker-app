package expo.modules.widgetbridge.widget.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.ColorFilter
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.actionParametersOf
import androidx.glance.action.clickable
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.cornerRadius
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.size
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.R
import expo.modules.widgetbridge.widget.actions.ToggleInversionAction
import expo.modules.widgetbridge.widget.data.POSITION_REF_KEY
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Sizing

enum class ReverseButtonKind { Small, Medium }

@Composable
fun ReverseButton(positionRef: String, kind: ReverseButtonKind) {
  val visualDiameter = when (kind) {
    ReverseButtonKind.Small -> Sizing.ReverseButton.small
    ReverseButtonKind.Medium -> Sizing.ReverseButton.medium
  }
  // Outer Box gives a 32dp tap target — without it, taps on the tiny 18-20dp
  // visual circle bubble up to the widget body's deep-link clickable and the
  // app opens instead of toggling inversion.
  Box(
    modifier = GlanceModifier
      .size(TAP_TARGET)
      .clickable(
        actionRunCallback<ToggleInversionAction>(
          actionParametersOf(POSITION_REF_KEY to positionRef)
        )
      ),
    contentAlignment = Alignment.Center,
  ) {
    Image(
      provider = ImageProvider(R.drawable.ic_reverse),
      contentDescription = "Swap base and quote",
      colorFilter = ColorFilter.tint(ColorProvider(Colors.textMuted)),
      modifier = GlanceModifier
        .size(visualDiameter)
        .background(ColorProvider(Colors.textPrimary.copy(alpha = Opacity.strokeSubtle)))
        .cornerRadius(999.dp),
    )
  }
}

private val TAP_TARGET = 32.dp
