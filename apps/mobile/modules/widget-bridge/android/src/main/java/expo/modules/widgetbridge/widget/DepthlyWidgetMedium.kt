package expo.modules.widgetbridge.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Box
import androidx.glance.layout.fillMaxSize
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.widget.deeplink.WidgetDeepLink
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.ui.MediumPositionView

class DepthlyWidgetMedium : GlanceAppWidget() {
  override val sizeMode = SizeMode.Single

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val resolution = resolveDisplay(context, id)
    provideContent {
      val deepLinkAction = resolution.displayed?.ref?.let { ref ->
        actionStartActivity(WidgetDeepLink.openPositionIntent(context, ref))
      }
      Box(
        modifier = GlanceModifier
          .fillMaxSize()
          .background(ColorProvider(Colors.bgPrimary)),
      ) {
        MediumPositionView(
          position = resolution.displayed,
          reason = resolution.reason,
          deepLinkAction = deepLinkAction,
        )
      }
    }
  }
}
