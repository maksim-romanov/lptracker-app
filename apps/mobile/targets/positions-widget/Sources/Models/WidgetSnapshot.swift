import Foundation

struct WidgetSnapshot: Codable, Sendable, Hashable {
  let v: Int
  let writtenAt: Date
  let positions: [WidgetPosition]

  enum CodingKeys: String, CodingKey {
    case v, writtenAt, positions
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    self.v = try container.decode(Int.self, forKey: .v)
    let writtenAtMillis = try container.decode(Int64.self, forKey: .writtenAt)
    self.writtenAt = Date(timeIntervalSince1970: TimeInterval(writtenAtMillis) / 1000)
    self.positions = try container.decode([WidgetPosition].self, forKey: .positions)
  }

  func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: CodingKeys.self)
    try container.encode(v, forKey: .v)
    try container.encode(Int64(writtenAt.timeIntervalSince1970 * 1000), forKey: .writtenAt)
    try container.encode(positions, forKey: .positions)
  }
}
