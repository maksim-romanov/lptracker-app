package expo.modules.widgetbridge.widget.theme

import androidx.compose.ui.graphics.Color

/**
 * Semantic and chain colors mirrored from
 * `apps/mobile/targets/positions-widget/Assets.xcassets/`. Widget is always
 * dark, so values come from the dark-mode entry of each `.colorset`. The iOS
 * source uses `display-p3`; Android `Color(0xFFRRGGBB)` is sRGB, so the
 * numeric port lands slightly cooler on wide-gamut displays.
 */
object Colors {
  // bgPrimary.colorset (dark)
  val bgPrimary = Color(0xFF000000)
  // bgSurface.colorset (dark)
  val bgSurface = Color(0xFF16181C)
  // bgVariant.colorset (dark)
  val bgVariant = Color(0xFF202327)
  // textPrimary.colorset (dark)
  val textPrimary = Color(0xFFE7E9EA)
  // textMuted.colorset (dark)
  val textMuted = Color(0xFF8B8F95)
  // borderOutline.colorset (dark)
  val borderOutline = Color(0xFF4A4D52)
  // brandPrimary.colorset (dark)
  val brandPrimary = Color(0xFFFF007A)
  // brandGlow.colorset (dark)
  val brandGlow = Color(0xFFFF007A)
  // statusInRange.colorset (dark)
  val statusInRange = Color(0xFF00FFA1)
  // statusOutOfRange.colorset (dark)
  val statusOutOfRange = Color(0xFFFFD60A)
  // statusError.colorset (dark)
  val statusError = Color(0xFFF4212E)

  fun chain(chainId: Int): Color = when (chainId) {
    1 -> Color(0xFF627EEA)     // chainEthereum.colorset
    8453 -> Color(0xFF0052FF)  // chainBase.colorset
    42161 -> Color(0xFF28A0F0) // chainArbitrum.colorset
    10 -> Color(0xFFFF0420)    // chainOptimism.colorset
    137 -> Color(0xFF8247E5)   // chainPolygon.colorset
    56 -> Color(0xFFF3BA2F)    // chainBnb.colorset
    43114 -> Color(0xFFE84142) // chainAvalanche.colorset
    else -> textMuted
  }
}
