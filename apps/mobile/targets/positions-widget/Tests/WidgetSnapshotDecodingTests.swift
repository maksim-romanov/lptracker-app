import Foundation
import Testing

@testable import PositionsWidget

@Suite("WidgetSnapshot decoding")
struct WidgetSnapshotDecodingTests {
  let decoder: JSONDecoder = {
    let d = JSONDecoder()
    return d
  }()

  @Test("decodes a snapshot with one uniswap-v3 position")
  func decodesUniswapV3() throws {
    let json = """
      {
        "v": 1,
        "writtenAt": 1717000000000,
        "positions": [{
          "ref": "uniswap-v3:1:12345",
          "chainId": 1,
          "protocol": "uniswap-v3",
          "protocolLabel": "Uniswap V3",
          "brandColor": "#FF007A",
          "containerLabel": "WETH/USDC 0.30%",
          "status": "in-range",
          "pair": { "sym0": "WETH", "sym1": "USDC", "icon0": "x", "icon1": "y" },
          "principals": [{ "symbol": "WETH", "iconUrl": "x", "formatted": "1.0" }],
          "fees": [],
          "extension": { "type": "uniswap-v3", "feeTierLabel": "0.30%", "nftTokenId": "12345" }
        }]
      }
      """.data(using: .utf8)!

    let snapshot = try decoder.decode(WidgetSnapshot.self, from: json)
    #expect(snapshot.v == 1)
    #expect(snapshot.positions.count == 1)
    let position = snapshot.positions[0]
    #expect(position.ref == "uniswap-v3:1:12345")
    #expect(position.status == .inRange)
    if case .uniswapV3(let payload) = position.widgetExtension {
      #expect(payload.feeTierLabel == "0.30%")
      #expect(payload.nftTokenId == "12345")
    } else {
      Issue.record("expected uniswapV3 case")
    }
  }

  @Test("falls back to unknown for unrecognized extension type")
  func unknownExtension() throws {
    let json = """
      {
        "v": 1, "writtenAt": 0, "positions": [{
          "ref": "future-protocol:1:1",
          "chainId": 1,
          "protocol": "future-protocol",
          "protocolLabel": "Future",
          "brandColor": "#000000",
          "containerLabel": "A/B",
          "status": "closed",
          "pair": { "sym0": "A", "sym1": "B", "icon0": "", "icon1": "" },
          "principals": [], "fees": [],
          "extension": { "type": "future-protocol", "feeTierLabel": "0%", "irrelevant": "field" }
        }]
      }
      """.data(using: .utf8)!

    let snapshot = try decoder.decode(WidgetSnapshot.self, from: json)
    if case .unknown(let raw) = snapshot.positions[0].widgetExtension {
      #expect(raw == "future-protocol")
    } else {
      Issue.record("expected unknown case")
    }
  }
}
