#if DEBUG
  import Foundation

  extension PositionsEntry {
    static let inRange = PositionsEntry(
      date: .now,
      position: .inRangePreview,
      snapshotAge: 30,
      emptyReason: nil
    )

    static let outOfRange = PositionsEntry(
      date: .now,
      position: .outOfRangePreview,
      snapshotAge: 120,
      emptyReason: nil
    )

    static let edgeLeft = PositionsEntry(
      date: .now,
      position: .edgeLeftPreview,
      snapshotAge: 60,
      emptyReason: nil
    )

    static let tightStable = PositionsEntry(
      date: .now,
      position: .tightStablePreview,
      snapshotAge: 30,
      emptyReason: nil
    )

    static let wideRange = PositionsEntry(
      date: .now,
      position: .wideRangePreview,
      snapshotAge: 30,
      emptyReason: nil
    )

    static let veryWide = PositionsEntry(
      date: .now,
      position: .veryWidePreview,
      snapshotAge: 30,
      emptyReason: nil
    )

    static let farOutAbove = PositionsEntry(
      date: .now,
      position: .farOutAbovePreview,
      snapshotAge: 30,
      emptyReason: nil
    )

    static let farOutBelow = PositionsEntry(
      date: .now,
      position: .farOutBelowPreview,
      snapshotAge: 30,
      emptyReason: nil
    )

    static let empty = PositionsEntry(
      date: .now,
      position: nil,
      snapshotAge: nil,
      emptyReason: .notConfigured
    )

    static let missing = PositionsEntry(
      date: .now,
      position: nil,
      snapshotAge: nil,
      emptyReason: .configuredMissing
    )
  }
#endif
