package expo.modules.widgetbridge.widget.theme

import androidx.compose.ui.unit.dp

object Sizing {
  object RangeBar {
    val track = 14.dp
    val thumb = 24.dp
    // Bitmap-space pixel stroke around the thumb circle (RangeBarView renders
    // into a 600x48 px bitmap; this is in those pixel units, not dp).
    const val thumbStrokePx = 7f
    val thumbShadowRadius = 6.dp
  }

  object ReverseButton {
    val small = 18.dp
    val medium = 20.dp
    val smallIcon = 9.dp
    val mediumIcon = 10.dp
  }

  object Tag {
    val dotSmall = 5.dp
    val dotLarge = 6.dp
  }

  object Divider {
    val thin = 1.dp
  }

  object Icon {
    val emptyState = 22.dp
  }

  object WidgetMetrics {
    val contentMargin = 16.dp
  }
}
