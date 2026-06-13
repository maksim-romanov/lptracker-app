package expo.modules.widgetbridge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.widgetbridge.widget.DepthlyWidgetMedium
import expo.modules.widgetbridge.widget.DepthlyWidgetSmall
import expo.modules.widgetbridge.widget.data.SnapshotStore
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.runBlocking

class WidgetBridgeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WidgetBridge")

    AsyncFunction("writeSnapshot") { json: String ->
      val ctx = appContext.reactContext
        ?: throw IllegalStateException("reactContext unavailable")
      SnapshotStore(ctx).writeRaw(json)
    }

    AsyncFunction("reload") { _: String? ->
      val ctx = appContext.reactContext ?: return@AsyncFunction
      runBlocking {
        DepthlyWidgetSmall().updateAll(ctx)
        DepthlyWidgetMedium().updateAll(ctx)
      }
    }
  }
}
