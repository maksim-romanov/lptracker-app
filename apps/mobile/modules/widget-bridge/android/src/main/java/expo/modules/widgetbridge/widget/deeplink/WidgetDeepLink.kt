package expo.modules.widgetbridge.widget.deeplink

import android.content.Context
import android.content.Intent
import android.net.Uri

object WidgetDeepLink {
  const val SCHEME = "depthly"

  fun openPositionIntent(context: Context, ref: String): Intent {
    val encoded = Uri.encode(ref)
    return Intent(Intent.ACTION_VIEW, Uri.parse("$SCHEME:///positions/$encoded")).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
  }
}
