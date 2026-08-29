package expo.modules.widgetbridge.widget.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import androidx.glance.text.FontFamily
import androidx.glance.text.FontWeight
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

object Typography {
  // Names refer to res/font resources, which must stay lowercase with underscores.
  // Sans sets words, mono sets figures — the same split the app and the web use.
  private val sansSemiBold = FontFamily("ibm_plex_sans_semibold")
  private val sansMedium = FontFamily("ibm_plex_sans_medium")
  private val monoSemiBold = FontFamily("ibm_plex_mono_semibold")
  private val monoMedium = FontFamily("ibm_plex_mono_medium")

  val pairLg = TextStyle(fontFamily = sansSemiBold, fontWeight = FontWeight.Bold, fontSize = 32.sp)
  val pairMd = TextStyle(fontFamily = sansSemiBold, fontWeight = FontWeight.Bold, fontSize = 21.sp)
  val pairSm = TextStyle(fontFamily = sansSemiBold, fontWeight = FontWeight.Bold, fontSize = 16.sp)

  val valueLg = TextStyle(fontFamily = monoSemiBold, fontWeight = FontWeight.Bold, fontSize = 20.sp)
  val valueMd = TextStyle(fontFamily = monoSemiBold, fontWeight = FontWeight.Bold, fontSize = 18.sp)
  val valueSm = TextStyle(fontFamily = monoSemiBold, fontWeight = FontWeight.Bold, fontSize = 16.sp)
  val valueXs = TextStyle(fontFamily = monoMedium, fontWeight = FontWeight.Medium, fontSize = 14.sp)
  val valueXxs = TextStyle(fontFamily = monoMedium, fontWeight = FontWeight.Medium, fontSize = 13.sp)
  val valueXxxs = TextStyle(fontFamily = monoMedium, fontWeight = FontWeight.Medium, fontSize = 12.sp)

  val suffixLg = TextStyle(fontFamily = sansMedium, fontWeight = FontWeight.Medium, fontSize = 12.sp)
  val suffixMd = TextStyle(fontFamily = sansMedium, fontWeight = FontWeight.Medium, fontSize = 10.sp)
  val suffixSm = TextStyle(fontFamily = sansMedium, fontWeight = FontWeight.Medium, fontSize = 9.sp)

  val labelLg = TextStyle(fontFamily = sansMedium, fontWeight = FontWeight.Medium, fontSize = 12.sp)
  val labelMd = TextStyle(fontFamily = sansMedium, fontWeight = FontWeight.Medium, fontSize = 11.sp)
  val labelSm = TextStyle(fontFamily = sansMedium, fontWeight = FontWeight.Medium, fontSize = 10.sp)

  fun withColor(style: TextStyle, color: Color): TextStyle =
    style.copy(color = ColorProvider(color))
}
