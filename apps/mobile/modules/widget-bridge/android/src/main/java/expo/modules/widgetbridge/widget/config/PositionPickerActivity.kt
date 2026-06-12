package expo.modules.widgetbridge.widget.config

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.lifecycle.lifecycleScope
import expo.modules.widgetbridge.widget.DepthlyWidgetMedium
import expo.modules.widgetbridge.widget.DepthlyWidgetSmall
import expo.modules.widgetbridge.widget.POSITION_REF_PREF
import expo.modules.widgetbridge.widget.data.SnapshotStore
import expo.modules.widgetbridge.widget.deeplink.WidgetDeepLink
import kotlinx.coroutines.launch

class PositionPickerActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val appWidgetId = intent.extras?.getInt(
      AppWidgetManager.EXTRA_APPWIDGET_ID,
      AppWidgetManager.INVALID_APPWIDGET_ID,
    ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

    setResult(
      Activity.RESULT_CANCELED,
      Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId),
    )

    val snap = SnapshotStore(this).load()
    val items = snap?.positions?.map(PickerItem::from).orEmpty()

    setContent {
      PositionPickerScreen(
        items = items,
        onPick = { ref -> persistAndFinish(appWidgetId, ref) },
        onOpenApp = {
          startActivity(WidgetDeepLink.openPositionIntent(this, ""))
          finish()
        },
      )
    }
  }

  private fun persistAndFinish(appWidgetId: Int, ref: String) {
    lifecycleScope.launch {
      val glanceId =
        GlanceAppWidgetManager(this@PositionPickerActivity).getGlanceIdBy(appWidgetId)
      updateAppWidgetState(
        this@PositionPickerActivity,
        PreferencesGlanceStateDefinition,
        glanceId,
      ) { prefs ->
        prefs.toMutablePreferences().apply { this[POSITION_REF_PREF] = ref }
      }
      // We don't know which widget class owns this appWidgetId; call update on both.
      // The wrong one is a no-op (its receiver doesn't own this id).
      runCatching { DepthlyWidgetSmall().update(this@PositionPickerActivity, glanceId) }
      runCatching { DepthlyWidgetMedium().update(this@PositionPickerActivity, glanceId) }
      setResult(
        Activity.RESULT_OK,
        Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId),
      )
      finish()
    }
  }
}
