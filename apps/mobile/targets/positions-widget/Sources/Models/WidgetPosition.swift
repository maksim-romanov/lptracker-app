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
}
