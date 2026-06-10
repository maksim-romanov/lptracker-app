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
    let next = Date.now.addingTimeInterval(60 * 60)
    return Timeline(entries: [entry], policy: .after(next))
  }

  private func buildEntry(for configuration: SelectPositionIntent) -> PositionsEntry {
    let snapshot = SnapshotStore.shared.load()
    let configuredRef = configuration.position?.id
    let base: WidgetPosition? = {
      if let configuredRef {
        return snapshot?.positions.first { $0.ref == configuredRef }
      }
      return snapshot?.positions.first
    }()
    let position = base.map { p in
      InvertedStore.shared.isInverted(ref: p.ref) ? p.inverted() : p
    }
    let age = snapshot.map { Date.now.timeIntervalSince($0.writtenAt) }
    let reason: EmptyReason? = {
      if position != nil { return nil }
      return configuredRef == nil ? .notConfigured : .configuredMissing
    }()
    return PositionsEntry(date: .now, position: position, snapshotAge: age, emptyReason: reason)
  }
}
