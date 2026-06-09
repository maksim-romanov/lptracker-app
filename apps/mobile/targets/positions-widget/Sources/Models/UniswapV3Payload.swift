import Foundation

struct UniswapV3Payload: Codable, Sendable, Hashable {
  let feeTierLabel: String
  let nftTokenId: String
}
