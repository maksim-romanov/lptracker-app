import Foundation

enum WidgetExtension: Codable, Sendable, Hashable {
  case uniswapV3(UniswapV3Payload)
  case unknown(String)

  private enum CodingKeys: String, CodingKey { case type }
  private enum Tag: String, Decodable {
    case uniswapV3 = "uniswap-v3"
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    let raw = try container.decode(String.self, forKey: .type)
    guard let tag = Tag(rawValue: raw) else {
      self = .unknown(raw)
      return
    }
    switch tag {
    case .uniswapV3:
      self = .uniswapV3(try UniswapV3Payload(from: decoder))
    }
  }

  func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    switch self {
    case .uniswapV3(let payload):
      try container.encode("uniswap-v3", forKey: .type)
      try payload.encode(to: encoder)
    case .unknown(let raw):
      try container.encode(raw, forKey: .type)
    }
  }

  func inverted() -> WidgetExtension {
    switch self {
    case .uniswapV3(let payload):
      guard let range = payload.range else { return self }
      let inv = WidgetTickRange(
        tickLower: -range.tickUpper,
        tickUpper: -range.tickLower,
        currentTick: -range.currentTick
      )
      return .uniswapV3(UniswapV3Payload(
        feeTierLabel: payload.feeTierLabel,
        nftTokenId: payload.nftTokenId,
        range: inv
      ))
    case .unknown:
      return self
    }
  }
}
