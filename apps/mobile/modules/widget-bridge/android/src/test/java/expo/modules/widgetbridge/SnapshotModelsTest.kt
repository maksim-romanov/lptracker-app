package expo.modules.widgetbridge

import expo.modules.widgetbridge.widget.data.*
import org.junit.Test
import org.junit.Assert.*

class SnapshotModelsTest {

  // Field names and values are the ones widget-snapshot.builder.test.ts pins for the emitted
  // extension, so a wire change that lands in one place fails visibly in the other.
  private val sample = """
    {
      "v": 1,
      "writtenAt": 1717180800000,
      "positions": [
        {
          "ref": "uniswap-v3:1:12345",
          "chainId": 1,
          "protocol": "uniswap-v3",
          "protocolLabel": "Uniswap V3",
          "brandColor": "#FF007A",
          "containerLabel": "Uniswap V3 NFT",
          "status": "in-range",
          "pair": {"sym0":"USDC","sym1":"ETH","icon0":"https://x/u.png","icon1":"https://x/e.png"},
          "principals": [
            {"symbol":"USDC","iconUrl":"https://x/u.png","formatted":"1000"},
            {"symbol":"ETH","iconUrl":"https://x/e.png","formatted":"0.5"}
          ],
          "fees": [
            {"symbol":"USDC","iconUrl":"https://x/u.png","formatted":"0.42"},
            {"symbol":"ETH","iconUrl":"https://x/e.png","formatted":"0"}
          ],
          "extension": {
            "type": "uniswap-v3",
            "feeTierLabel": "0.3%",
            "nftTokenId": "999",
            "priceRange": {
              "quoted": {
                "lower":"1600","upper":"2500","current":"2000",
                "lowerLabel":"1600","upperLabel":"2500","currentLabel":"2000"
              },
              "inverted": {
                "lower":"0.0004","upper":"0.000625","current":"0.0005",
                "lowerLabel":"0.0004","upperLabel":"0.000625","currentLabel":"0.0005"
              }
            }
          }
        }
      ]
    }
  """.trimIndent()

  @Test fun parsesSnapshot() {
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(sample)
    assertEquals(1, snap.v)
    assertEquals(1717180800000L, snap.writtenAt)
    assertEquals(1, snap.positions.size)
    val p = snap.positions[0]
    assertEquals("uniswap-v3:1:12345", p.ref)
    assertEquals(WidgetStatus.InRange, p.status)
    val ext = p.extension as WidgetExtension.UniswapV3
    assertEquals("0.3%", ext.feeTierLabel)
    assertEquals("1600", ext.priceRange?.quoted?.lower)
    assertEquals("2500", ext.priceRange?.quoted?.upperLabel)
    assertEquals(2000.0, ext.priceRange?.quoted?.currentPrice ?: 0.0, 1e-9)
  }

  @Test fun invertsPair() {
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(sample)
    val inv = snap.positions[0].inverted()
    assertEquals("ETH", inv.pair.sym0)
    assertEquals("USDC", inv.pair.sym1)
    assertEquals("ETH", inv.principals[0].symbol)
    // Both readings travel in the snapshot, so inverting swaps the pair rather than dividing.
    val ext = inv.extension as WidgetExtension.UniswapV3
    assertEquals("0.0004", ext.priceRange?.quoted?.lower)
    assertEquals("0.0005", ext.priceRange?.quoted?.currentLabel)
    assertEquals("1600", ext.priceRange?.inverted?.lower)
  }

  // An unbounded bound is null on the wire and stays a bound, not a missing value: the bar runs
  // it out to the end of the axis rather than refusing to draw.
  @Test fun unboundedBoundsDecodeAsNull() {
    val json = sample
      .replace("\"lower\":\"1600\"", "\"lower\":null")
      .replace("\"upper\":\"2500\"", "\"upper\":null")
    val ext = SnapshotJson.json.decodeFromString<WidgetSnapshot>(json).positions[0].extension as WidgetExtension.UniswapV3
    assertNull(ext.priceRange?.quoted?.lower)
    assertNull(ext.priceRange?.quoted?.lowerPrice)
    assertEquals("1600", ext.priceRange?.quoted?.lowerLabel)
  }

  // The key a widget binary older than the snapshot cannot find. It draws no bar; it must not
  // fail the decode and blank every position.
  @Test fun aSnapshotWithNoPriceRangeStillDecodes() {
    val json = sample.replace("\"priceRange\"", "\"rangeInSomeOlderShape\"")
    val position = SnapshotJson.json.decodeFromString<WidgetSnapshot>(json).positions[0]
    assertNull((position.extension as WidgetExtension.UniswapV3).priceRange)
    assertEquals("uniswap-v3:1:12345", position.ref)
  }

  @Test fun unknownExtensionRoundTrips() {
    val unknownJson = sample.replace("\"uniswap-v3\"", "\"uniswap-v4\"")
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(unknownJson)
    assertTrue(snap.positions[0].extension is WidgetExtension.Unknown)
  }

  // The whole snapshot must survive a status this build does not know. kotlinx throws on an
  // unmapped enum constant and SnapshotStore swallows that into a null snapshot, so without the
  // fallback one unrecognised string blanks every position on every installed widget.
  @Test fun unrecognisedStatusDoesNotFailTheSnapshot() {
    val json = sample.replace("\"status\": \"in-range\"", "\"status\": \"a-state-this-build-never-heard-of\"")
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(json)
    assertEquals(1, snap.positions.size)
    assertEquals(WidgetStatus.Unknown, snap.positions[0].status)
    assertEquals("USDC", snap.positions[0].pair.sym0)
  }

  @Test fun drainedDecodesAsItsOwnState() {
    val json = sample.replace("\"status\": \"in-range\"", "\"status\": \"drained\"")
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(json)
    assertEquals(WidgetStatus.Drained, snap.positions[0].status)
  }

  @Test fun feeModeDefaultsToReadWhenTheSnapshotPredatesTheKey() {
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(sample)
    assertNull(snap.positions[0].feeMode)
    assertTrue(snap.positions[0].owedWasRead)
  }

  @Test fun anUnreadFeeModeSurvivesDecodeAndInversion() {
    val json = sample.replace("\"status\": \"in-range\"", "\"feeMode\": \"unknown\", \"status\": \"in-range\"")
    val position = SnapshotJson.json.decodeFromString<WidgetSnapshot>(json).positions[0]
    assertFalse(position.owedWasRead)
    assertFalse(position.inverted().owedWasRead)
  }

  // A gauge-staked position and a compounding one must not read the same on the tile, so the
  // mode cannot be narrowed to "was it read" on the way in.
  @Test fun aModeThisBuildDoesNotKnowIsCarriedVerbatimAndCountsAsRead() {
    for (mode in listOf("claimable", "redirected", "compounded", "some-future-mode")) {
      val json = sample.replace("\"status\": \"in-range\"", "\"feeMode\": \"$mode\", \"status\": \"in-range\"")
      val position = SnapshotJson.json.decodeFromString<WidgetSnapshot>(json).positions[0]
      assertEquals(mode, position.feeMode)
      assertTrue(position.owedWasRead)
    }
  }
}
