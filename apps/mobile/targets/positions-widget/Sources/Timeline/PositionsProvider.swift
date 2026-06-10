import AppIntents
import WidgetKit

struct PositionsProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> PositionsEntry { .placeholder }

  func snapshot(for configuration: SelectPositionIntent, in context: Context) async -> PositionsEntry {
    buildEntry(for: configuration)
  }

  func timeline(for configuration: SelectPositionIntent, in context: Context) async -> Timeline<
    PositionsEntry
  > {
    let entry = buildEntry(for: configuration)
    let next = Date.now.addingTimeInterval(15 * 60)
    return Timeline(entries: [entry], policy: .after(next))
  }

  private func buildEntry(for configuration: SelectPositionIntent) -> PositionsEntry {
    let snapshot = SnapshotStore.shared.load()
    let position =
      snapshot?.positions.first { $0.ref == configuration.position?.id }
      ?? snapshot?.positions.first
    let age = snapshot.map { Date.now.timeIntervalSince($0.writtenAt) }
    return PositionsEntry(date: .now, position: position, snapshotAge: age)
  }
}
