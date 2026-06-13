package expo.modules.widgetbridge.widget.data

import kotlinx.serialization.*
import kotlinx.serialization.json.*
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic

@Serializable
data class WidgetSnapshot(
  val v: Int,
  val writtenAt: Long,
  val positions: List<WidgetPosition>,
)

@Serializable
data class WidgetPosition(
  val ref: String,
  val chainId: Int,
  val protocol: String,
  val protocolLabel: String,
  val brandColor: String,
  val containerLabel: String,
  val status: WidgetStatus,
  val pair: WidgetPair,
  val principals: List<WidgetToken>,
  val fees: List<WidgetToken>,
  val extension: WidgetExtension,
) {
  val primaryPrincipal: WidgetToken? get() = principals.firstOrNull()
  val secondaryPrincipal: WidgetToken? get() = principals.getOrNull(1)

  fun inverted(): WidgetPosition = copy(
    pair = WidgetPair(pair.sym1, pair.sym0, pair.icon1, pair.icon0),
    principals = principals.reversed(),
    fees = fees.reversed(),
    extension = extension.inverted(),
  )
}

@Serializable
data class WidgetPair(val sym0: String, val sym1: String, val icon0: String, val icon1: String)

@Serializable
data class WidgetToken(val symbol: String, val iconUrl: String, val formatted: String)

@Serializable
enum class WidgetStatus {
  @SerialName("in-range") InRange,
  @SerialName("out-of-range") OutOfRange,
  @SerialName("closed") Closed,
}

@Serializable
@JsonClassDiscriminator("type")
sealed class WidgetExtension {
  abstract fun inverted(): WidgetExtension

  @Serializable @SerialName("uniswap-v3")
  data class UniswapV3(
    val feeTierLabel: String,
    val nftTokenId: String,
    val range: WidgetTickRange? = null,
  ) : WidgetExtension() {
    override fun inverted(): WidgetExtension {
      val r = range ?: return this
      return copy(range = WidgetTickRange(
        tickLower = -r.tickUpper,
        tickUpper = -r.tickLower,
        currentTick = -r.currentTick,
        decimalsDelta = -r.decimalsDelta,
      ))
    }
  }

  @Serializable
  data class Unknown(val raw: String = "unknown") : WidgetExtension() {
    override fun inverted(): WidgetExtension = this
  }
}

@Serializable
data class WidgetTickRange(
  val tickLower: Int,
  val tickUpper: Int,
  val currentTick: Int,
  val decimalsDelta: Int,
)

object SnapshotJson {
  val json: Json = Json {
    classDiscriminator = "type"
    ignoreUnknownKeys = true
    encodeDefaults = true
    serializersModule = SerializersModule {
      polymorphic(WidgetExtension::class) {
        defaultDeserializer { WidgetExtension.Unknown.serializer() }
      }
    }
  }
}
