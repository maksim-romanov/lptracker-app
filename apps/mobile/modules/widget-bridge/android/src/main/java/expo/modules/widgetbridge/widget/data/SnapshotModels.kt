package expo.modules.widgetbridge.widget.data

import kotlinx.serialization.*
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
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
  // What a claim would pay out, not fee income: Uniswap credits withdrawn principal into the
  // same balance. Still keyed `fees` on the wire: this binary declares the key non-optional.
  val fees: List<WidgetToken>,
  val feeMode: String? = null,
  val extension: WidgetExtension,
) {
  val primaryPrincipal: WidgetToken? get() = principals.firstOrNull()
  val secondaryPrincipal: WidgetToken? get() = principals.getOrNull(1)

  // The key is absent in a snapshot written before it existed, and that writer only ever wrote
  // amounts it had read.
  val owedWasRead: Boolean get() = feeMode == null || feeMode != FeeAccrualMode.UNKNOWN

  fun inverted(): WidgetPosition = copy(
    pair = WidgetPair(pair.sym1, pair.sym0, pair.icon1, pair.icon0),
    principals = principals.reversed(),
    fees = fees.reversed(),
    extension = extension.inverted(),
  )
}

// `feeAccrual.mode` as the contract spells it. Kept as a string rather than an enum: a mode
// this build was not compiled against has to stay itself, not collapse into "unknown", which
// says the amount was never read.
object FeeAccrualMode {
  const val UNKNOWN = "unknown"
}

@Serializable
data class WidgetPair(val sym0: String, val sym1: String, val icon0: String, val icon1: String)

@Serializable
data class WidgetToken(val symbol: String, val iconUrl: String, val formatted: String)

@Serializable(with = WidgetStatusSerializer::class)
enum class WidgetStatus(val wire: String) {
  InRange("in-range"),
  OutOfRange("out-of-range"),
  Drained("drained"),
  Closed("closed"),
  Unknown("unknown"),
}

// A state this build does not recognise must not throw: kotlinx throws on an unmapped enum
// constant and SnapshotStore turns any decode error into a null snapshot, so one unknown string
// would blank every installed widget. Hand-written rather than left to `coerceInputValues`,
// which only coerces a property that carries a default — `WidgetPosition.status` does not.
object WidgetStatusSerializer : KSerializer<WidgetStatus> {
  override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("WidgetStatus", PrimitiveKind.STRING)

  override fun deserialize(decoder: Decoder): WidgetStatus {
    val raw = decoder.decodeString()
    return WidgetStatus.values().firstOrNull { it.wire == raw } ?: WidgetStatus.Unknown
  }

  override fun serialize(encoder: Encoder, value: WidgetStatus) = encoder.encodeString(value.wire)
}

@Serializable
@JsonClassDiscriminator("type")
sealed class WidgetExtension {
  abstract fun inverted(): WidgetExtension

  @Serializable @SerialName("uniswap-v3")
  data class UniswapV3(
    val feeTierLabel: String,
    val nftTokenId: String,
    // A binary older than the snapshot finds the key missing and draws no bar, rather than
    // failing to decode — which is why the contract's price range arrived as a new key.
    val priceRange: WidgetPriceRange? = null,
  ) : WidgetExtension() {
    override fun inverted(): WidgetExtension = copy(priceRange = priceRange?.flipped())
  }

  @Serializable
  data class Unknown(val raw: String = "unknown") : WidgetExtension() {
    override fun inverted(): WidgetExtension = this
  }
}

/// One reading of a position's price range: decimal strings as the contract emits them, and the
/// label the snapshot has already formatted for each. A null bound is unbounded, not missing.
@Serializable
data class WidgetPriceBounds(
  val lower: String? = null,
  val upper: String? = null,
  val current: String,
  val lowerLabel: String,
  val upperLabel: String,
  val currentLabel: String,
) {
  val lowerPrice: Double? get() = lower?.toDoubleOrNull()
  val upperPrice: Double? get() = upper?.toDoubleOrNull()
  val currentPrice: Double get() = current.toDoubleOrNull() ?: 0.0
}

@Serializable
data class WidgetPriceRange(val quoted: WidgetPriceBounds, val inverted: WidgetPriceBounds) {
  /// Both readings travel in the snapshot, so flipping the pair is a swap and never a division.
  fun flipped(): WidgetPriceRange = WidgetPriceRange(quoted = inverted, inverted = quoted)
}

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
