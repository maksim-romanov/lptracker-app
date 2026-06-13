package expo.modules.widgetbridge.widget

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.state.getAppWidgetState
import androidx.glance.background
import androidx.glance.layout.Box
import androidx.glance.layout.fillMaxSize
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.widget.data.InvertedStore
import expo.modules.widgetbridge.widget.data.SnapshotStore
import expo.modules.widgetbridge.widget.data.WidgetPosition
import expo.modules.widgetbridge.widget.deeplink.WidgetDeepLink
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.ui.EmptyReason
import expo.modules.widgetbridge.widget.ui.SmallPositionView

val POSITION_REF_PREF = stringPreferencesKey("positionRef")

class DepthlyWidgetSmall : GlanceAppWidget() {
  override val sizeMode = SizeMode.Single

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val resolution = resolveDisplay(context, id)
    provideContent {
      // No outer body clickable: in RemoteViews / Glance a root-level
      // PendingIntent eats clicks on nested clickables (e.g. ReverseButton).
      // Deep-link is delegated to non-button sub-areas instead, as a sibling
      // click handler rather than an ancestor of the button.
      val deepLinkAction = resolution.displayed?.ref?.let { ref ->
        actionStartActivity(WidgetDeepLink.openPositionIntent(context, ref))
      }
      Box(
        modifier = GlanceModifier
          .fillMaxSize()
          .background(ColorProvider(Colors.bgPrimary)),
      ) {
        SmallPositionView(
          position = resolution.displayed,
          reason = resolution.reason,
          deepLinkAction = deepLinkAction,
        )
      }
    }
  }
}

internal data class ResolvedWidgetState(
  val displayed: WidgetPosition?,
  val reason: EmptyReason?,
)

/**
 * All blocking I/O happens here in the suspend [provideGlance] context.
 * `provideContent` receives ready-to-render values — no `runBlocking`,
 * no file reads inside the @Composable body.
 *
 * Resolution rules (mirror iOS PositionsProvider):
 * - explicit ref + match → use it
 * - explicit ref + miss + snapshot has positions → ConfiguredMissing
 * - no ref + snapshot has positions → first followed position (default)
 * - empty/missing snapshot → NotConfigured
 */
internal suspend fun resolveDisplay(context: Context, id: GlanceId): ResolvedWidgetState {
  val snap = SnapshotStore(context).load()
  val prefs: Preferences = getAppWidgetState(context, PreferencesGlanceStateDefinition, id)
  val ref = prefs[POSITION_REF_PREF]
  val resolved: WidgetPosition? = when {
    ref != null -> snap?.positions?.firstOrNull { it.ref == ref }
    else -> snap?.positions?.firstOrNull()
  }
  val displayed: WidgetPosition? = resolved?.let { p ->
    if (InvertedStore(context).isInverted(p.ref)) p.inverted() else p
  }
  val reason: EmptyReason? = when {
    displayed != null -> null
    ref != null && snap != null && snap.positions.isNotEmpty() -> EmptyReason.ConfiguredMissing
    else -> EmptyReason.NotConfigured
  }
  return ResolvedWidgetState(displayed, reason)
}
