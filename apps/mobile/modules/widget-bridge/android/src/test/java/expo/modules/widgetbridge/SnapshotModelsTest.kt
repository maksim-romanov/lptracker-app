package expo.modules.widgetbridge

import expo.modules.widgetbridge.widget.data.*
import org.junit.Test
import org.junit.Assert.*

class SnapshotModelsTest {

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
            "range": {"tickLower":-2000,"tickUpper":1000,"currentTick":50,"decimalsDelta":-12}
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
    assertEquals(-2000, ext.range?.tickLower)
  }

  @Test fun invertsPair() {
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(sample)
    val inv = snap.positions[0].inverted()
    assertEquals("ETH", inv.pair.sym0)
    assertEquals("USDC", inv.pair.sym1)
    assertEquals("ETH", inv.principals[0].symbol)
    val ext = inv.extension as WidgetExtension.UniswapV3
    assertEquals(-1000, ext.range?.tickLower)
    assertEquals(2000, ext.range?.tickUpper)
    assertEquals(-50, ext.range?.currentTick)
    assertEquals(12, ext.range?.decimalsDelta)
  }

  @Test fun unknownExtensionRoundTrips() {
    val unknownJson = sample.replace("\"uniswap-v3\"", "\"uniswap-v4\"")
    val snap = SnapshotJson.json.decodeFromString<WidgetSnapshot>(unknownJson)
    assertTrue(snap.positions[0].extension is WidgetExtension.Unknown)
  }
}
