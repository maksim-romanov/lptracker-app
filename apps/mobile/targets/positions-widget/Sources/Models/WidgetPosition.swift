import Foundation

enum WidgetStatus: String, Codable, Sendable, Hashable {
  case inRange = "in-range"
  case outOfRange = "out-of-range"
  case closed
}

struct WidgetPosition: Codable, Sendable, Hashable, Identifiable {
  let ref: String
  let chainId: Int
  let protocolSlug: String
  let protocolLabel: String
  let brandColor: String
  let containerLabel: String
  let status: WidgetStatus
  let pair: WidgetPair
  let principals: [WidgetToken]
  let fees: [WidgetToken]
  let widgetExtension: WidgetExtension

  var id: String { ref }

  private enum CodingKeys: String, CodingKey {
    case ref, chainId, protocolLabel, brandColor, containerLabel
    case status, pair, principals, fees
    case protocolSlug = "protocol"
    case widgetExtension = "extension"
  }

  func inverted() -> WidgetPosition {
    WidgetPosition(
      ref: ref,
      chainId: chainId,
      protocolSlug: protocolSlug,
      protocolLabel: protocolLabel,
      brandColor: brandColor,
      containerLabel: containerLabel,
      status: status,
      pair: WidgetPair(sym0: pair.sym1, sym1: pair.sym0, icon0: pair.icon1, icon1: pair.icon0),
      principals: Array(principals.reversed()),
      fees: Array(fees.reversed()),
      widgetExtension: widgetExtension.inverted()
    )
  }
}
