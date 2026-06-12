package expo.modules.widgetbridge.widget.actions

import android.content.Context
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.action.ActionCallback
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.appwidget.updateAll
import expo.modules.widgetbridge.widget.DepthlyWidgetMedium
import expo.modules.widgetbridge.widget.DepthlyWidgetSmall
import expo.modules.widgetbridge.widget.data.InvertedStore
import expo.modules.widgetbridge.widget.data.POSITION_REF_KEY

val INVERSION_TICK = intPreferencesKey("inversionTick")

class ToggleInversionAction : ActionCallback {
  override suspend fun onAction(
    context: Context,
    glanceId: GlanceId,
    parameters: ActionParameters,
  ) {
    val ref = parameters[POSITION_REF_KEY] ?: return
    InvertedStore(context).toggle(ref)

    // Bump a per-widget tick across every widget instance so Glance's
    // state diffing recognises a change and recomposes. The file-based
    // InvertedStore mutation alone is invisible to Glance state tracking.
    val mgr = GlanceAppWidgetManager(context)
    val ids = mgr.getGlanceIds(DepthlyWidgetSmall::class.java) +
      mgr.getGlanceIds(DepthlyWidgetMedium::class.java)
    for (gid in ids) {
      updateAppWidgetState(context, gid) { prefs ->
        prefs.toMutablePreferences().apply {
          this[INVERSION_TICK] = ((this[INVERSION_TICK] ?: 0) + 1)
        }
      }
    }

    DepthlyWidgetSmall().updateAll(context)
    DepthlyWidgetMedium().updateAll(context)
  }
}
