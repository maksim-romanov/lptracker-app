package expo.modules.widgetbridge.widget.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import androidx.glance.text.FontFamily
import androidx.glance.text.FontWeight
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

object Typography {
  private val satoshiBlack = FontFamily("satoshi_black")
  private val satoshiBold = FontFamily("satoshi_bold")
  private val satoshiMedium = FontFamily("satoshi_medium")

  val pairLg = TextStyle(fontFamily = satoshiBlack, fontWeight = FontWeight.Bold, fontSize = 32.sp)
  val pairMd = TextStyle(fontFamily = satoshiBlack, fontWeight = FontWeight.Bold, fontSize = 21.sp)
  val pairSm = TextStyle(fontFamily = satoshiBlack, fontWeight = FontWeight.Bold, fontSize = 16.sp)

  val valueLg = TextStyle(fontFamily = satoshiBold, fontWeight = FontWeight.Bold, fontSize = 20.sp)
  val valueMd = TextStyle(fontFamily = satoshiBold, fontWeight = FontWeight.Bold, fontSize = 18.sp)
  val valueSm = TextStyle(fontFamily = satoshiBold, fontWeight = FontWeight.Bold, fontSize = 16.sp)
  val valueXs = TextStyle(fontFamily = satoshiBold, fontWeight = FontWeight.Bold, fontSize = 14.sp)
  val valueXxs = TextStyle(fontFamily = satoshiBold, fontWeight = FontWeight.Bold, fontSize = 13.sp)
  val valueXxxs = TextStyle(fontFamily = satoshiBold, fontWeight = FontWeight.Bold, fontSize = 12.sp)

  val suffixLg = TextStyle(fontFamily = satoshiMedium, fontWeight = FontWeight.Medium, fontSize = 12.sp)
  val suffixMd = TextStyle(fontFamily = satoshiMedium, fontWeight = FontWeight.Medium, fontSize = 10.sp)
  val suffixSm = TextStyle(fontFamily = satoshiMedium, fontWeight = FontWeight.Medium, fontSize = 9.sp)

  val labelLg = TextStyle(fontFamily = satoshiMedium, fontWeight = FontWeight.Medium, fontSize = 12.sp)
  val labelMd = TextStyle(fontFamily = satoshiMedium, fontWeight = FontWeight.Medium, fontSize = 11.sp)
  val labelSm = TextStyle(fontFamily = satoshiMedium, fontWeight = FontWeight.Medium, fontSize = 10.sp)

  fun withColor(style: TextStyle, color: Color): TextStyle =
    style.copy(color = ColorProvider(color))
}
