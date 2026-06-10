import Foundation

struct WidgetTickRange: Codable, Sendable, Hashable {
  let tickLower: Int
  let tickUpper: Int
  let currentTick: Int
}

struct UniswapV3Payload: Codable, Sendable, Hashable {
  let feeTierLabel: String
  let nftTokenId: String
  let range: WidgetTickRange?
}
