import Foundation

struct WidgetToken: Codable, Sendable, Hashable {
  let symbol: String
  let iconUrl: String
  let formatted: String
}

struct WidgetPair: Codable, Sendable, Hashable {
  let sym0: String
  let sym1: String
  let icon0: String
  let icon1: String
}
