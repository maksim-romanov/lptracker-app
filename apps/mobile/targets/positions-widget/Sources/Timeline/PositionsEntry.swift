import WidgetKit

struct PositionsEntry: TimelineEntry, Sendable {
  let date: Date
  let position: WidgetPosition?
  let snapshotAge: TimeInterval?

  var isStale: Bool {
    guard let age = snapshotAge else { return true }
    return age > 60 * 60
  }
}

extension PositionsEntry {
  static let placeholder = PositionsEntry(
    date: .now,
    position: nil,
    snapshotAge: nil
  )
}
