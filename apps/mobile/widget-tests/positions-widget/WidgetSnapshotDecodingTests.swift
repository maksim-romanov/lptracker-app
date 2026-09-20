import Foundation
import Testing

@testable import PositionsWidget

@Suite("WidgetSnapshot decoding")
struct WidgetSnapshotDecodingTests {
  let decoder = JSONDecoder()

  private func snapshot(extensionJSON: String) -> Data {
    """
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
        "extension": \(extensionJSON)
      }]
    }
    """.data(using: .utf8)!
  }

  private func payload(in snapshot: WidgetSnapshot) throws -> UniswapV3Payload {
    guard case .uniswapV3(let payload) = snapshot.positions[0].widgetExtension else {
      Issue.record("expected uniswapV3 case")
      throw DecodingError.dataCorrupted(.init(codingPath: [], debugDescription: "not uniswap-v3"))
    }
    return payload
  }

  @Test("decodes a uniswap-v3 position carrying a price range")
  func decodesPriceRange() throws {
    let json = snapshot(
      extensionJSON: """
        {
          "type": "uniswap-v3", "feeTierLabel": "0.30%", "nftTokenId": "12345",
          "priceRange": {
            "quoted": {
              "lower": "1900", "upper": "2100", "current": "2000",
              "lowerLabel": "1900", "upperLabel": "2100", "currentLabel": "2000"
            },
            "inverted": {
              "lower": "0.000476", "upper": "0.000526", "current": "0.0005",
              "lowerLabel": "0.000476", "upperLabel": "0.000526", "currentLabel": "0.0005"
            }
          }
        }
        """
    )

    let decoded = try decoder.decode(WidgetSnapshot.self, from: json)
    let payload = try payload(in: decoded)
    #expect(payload.feeTierLabel == "0.30%")
    #expect(payload.priceRange?.quoted.lower == "1900")
    #expect(payload.priceRange?.quoted.lowerPrice == 1900)
    #expect(payload.priceRange?.quoted.currentLabel == "2000")
    #expect(payload.priceRange?.inverted.upperLabel == "0.000526")
  }

  @Test("an unbounded bound decodes as nil rather than failing")
  func decodesUnboundedBound() throws {
    let json = snapshot(
      extensionJSON: """
        {
          "type": "uniswap-v3", "feeTierLabel": "0.30%", "nftTokenId": "12345",
          "priceRange": {
            "quoted": {
              "lower": null, "upper": null, "current": "2000",
              "lowerLabel": "0", "upperLabel": "∞", "currentLabel": "2000"
            },
            "inverted": {
              "lower": null, "upper": null, "current": "0.0005",
              "lowerLabel": "0", "upperLabel": "∞", "currentLabel": "0.0005"
            }
          }
        }
        """
    )

    let payload = try payload(in: try decoder.decode(WidgetSnapshot.self, from: json))
    #expect(payload.priceRange?.quoted.lower == nil)
    #expect(payload.priceRange?.quoted.lowerPrice == nil)
    #expect(payload.priceRange?.quoted.upperLabel == "∞")
  }

  /// A binary installed from the App Store keeps reading whatever snapshot the previous app
  /// version left in the shared container. A range it does not recognize has to leave the
  /// widget drawing the rest of the position, never fail the whole file.
  @Test("a snapshot written before the price range decodes with no range")
  func decodesLegacySnapshot() throws {
    let json = snapshot(
      extensionJSON: """
        {
          "type": "uniswap-v3", "feeTierLabel": "0.30%", "nftTokenId": "12345",
          "range": { "tickLower": -887220, "tickUpper": 887220, "currentTick": 0, "decimalsDelta": 12 }
        }
        """
    )

    let payload = try payload(in: try decoder.decode(WidgetSnapshot.self, from: json))
    #expect(payload.nftTokenId == "12345")
    #expect(payload.priceRange == nil)
  }

  @Test("falls back to unknown for unrecognized extension type")
  func unknownExtension() throws {
    let json = snapshot(
      extensionJSON: """
        { "type": "future-protocol", "feeTierLabel": "0%", "irrelevant": "field" }
        """
    )

    let decoded = try decoder.decode(WidgetSnapshot.self, from: json)
    if case .unknown(let raw) = decoded.positions[0].widgetExtension {
      #expect(raw == "future-protocol")
    } else {
      Issue.record("expected unknown case")
    }
  }

  @Test("flipping a position swaps the two readings of its range")
  func flipSwapsReadings() throws {
    let json = snapshot(
      extensionJSON: """
        {
          "type": "uniswap-v3", "feeTierLabel": "0.30%", "nftTokenId": "12345",
          "priceRange": {
            "quoted": {
              "lower": "1900", "upper": "2100", "current": "2000",
              "lowerLabel": "1900", "upperLabel": "2100", "currentLabel": "2000"
            },
            "inverted": {
              "lower": "0.000476", "upper": "0.000526", "current": "0.0005",
              "lowerLabel": "0.000476", "upperLabel": "0.000526", "currentLabel": "0.0005"
            }
          }
        }
        """
    )

    let decoded = try decoder.decode(WidgetSnapshot.self, from: json)
    let flipped = decoded.positions[0].inverted()
    guard case .uniswapV3(let payload) = flipped.widgetExtension else {
      Issue.record("expected uniswapV3 case")
      return
    }
    #expect(payload.priceRange?.quoted.currentLabel == "0.0005")
    #expect(payload.priceRange?.inverted.currentLabel == "2000")
  }
}
