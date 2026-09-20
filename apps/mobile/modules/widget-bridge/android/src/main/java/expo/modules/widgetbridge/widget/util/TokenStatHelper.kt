package expo.modules.widgetbridge.widget.util

import expo.modules.widgetbridge.widget.data.WidgetToken

object TokenStatHelper {
  /** Shown where an owed figure would be when the read was unavailable. A word, not a glyph:
   *  the dash beside it means nothing owed, and this must not read as an amount either. */
  const val UNREAD_LABEL = "Unknown"

  fun owedString(symbol: String?, owed: List<WidgetToken>): String? {
    if (symbol == null) return null
    val token = owed.firstOrNull { it.symbol == symbol } ?: return null
    if (token.formatted == "0") return null
    return "+${token.formatted}"
  }
}
