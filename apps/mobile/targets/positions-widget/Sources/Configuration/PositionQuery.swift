import AppIntents

struct PositionQuery: EntityStringQuery {
  func entities(for identifiers: [PositionEntity.ID]) async throws -> [PositionEntity] {
    loadEntities().filter { identifiers.contains($0.id) }
  }

  func entities(matching string: String) async throws -> [PositionEntity] {
    let needle = string.lowercased()
    return loadEntities().filter {
      $0.displayPair.lowercased().contains(needle)
        || $0.subtitle.lowercased().contains(needle)
    }
  }

  func suggestedEntities() async throws -> [PositionEntity] {
    loadEntities()
  }

  func defaultResult() async -> PositionEntity? {
    loadEntities().first
  }

  private func loadEntities() -> [PositionEntity] {
    guard let snapshot = SnapshotStore.shared.load() else { return [] }
    return snapshot.positions.map(PositionEntity.init(from:))
  }
}
