import Foundation

struct WidgetTickRange: Codable, Sendable, Hashable {
  let tickLower: Int
  let tickUpper: Int
  let currentTick: Int
  let decimalsDelta: Int

  var lowerLabel: String {
    PriceMath.format(PriceMath.tickToPrice(tick: tickLower, decimalsDelta: decimalsDelta))
  }

  var upperLabel: String {
    PriceMath.format(PriceMath.tickToPrice(tick: tickUpper, decimalsDelta: decimalsDelta))
  }

  var currentLabel: String {
    PriceMath.format(PriceMath.tickToPrice(tick: currentTick, decimalsDelta: decimalsDelta))
  }
}

struct UniswapV3Payload: Codable, Sendable, Hashable {
  let feeTierLabel: String
  let nftTokenId: String
  let range: WidgetTickRange?
}
