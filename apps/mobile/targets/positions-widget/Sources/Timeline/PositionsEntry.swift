import WidgetKit

enum EmptyReason: Sendable {
  case notConfigured
  case configuredMissing
}

struct PositionsEntry: TimelineEntry, Sendable {
  let date: Date
  let position: WidgetPosition?
  let snapshotAge: TimeInterval?
  let emptyReason: EmptyReason?

  var isStale: Bool {
    guard let age = snapshotAge else { return true }
    return age > 60 * 60
  }
}

extension PositionsEntry {
  static let placeholder = PositionsEntry(
    date: .now,
    position: nil,
    snapshotAge: nil,
    emptyReason: .notConfigured
  )
}
