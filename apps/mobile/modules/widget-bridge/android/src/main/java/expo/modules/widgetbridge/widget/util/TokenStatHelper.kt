package expo.modules.widgetbridge.widget.util

import expo.modules.widgetbridge.widget.data.WidgetToken

object TokenStatHelper {
  fun feeString(symbol: String?, fees: List<WidgetToken>): String? {
    if (symbol == null) return null
    val token = fees.firstOrNull { it.symbol == symbol } ?: return null
    if (token.formatted == "0") return null
    return "+${token.formatted}"
  }
}
