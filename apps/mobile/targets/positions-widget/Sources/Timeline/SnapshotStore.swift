import Foundation
import OSLog

enum SnapshotStoreError: Error {
  case appGroupUnavailable
  case fileMissing
}

final class SnapshotStore: Sendable {
  static let appGroup = "group.com.depthly.app.shared"
  static let filename = "widget-snapshot.json"

  private let logger = Logger(subsystem: "com.depthly.app.widget", category: "snapshot")

  static let shared = SnapshotStore()

  func load() -> WidgetSnapshot? {
    guard let container = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: Self.appGroup
    ) else {
      logger.warning("App Group container unavailable")
      return nil
    }
    let url = container.appendingPathComponent(Self.filename)
    guard let data = try? Data(contentsOf: url) else {
      logger.notice("No snapshot file at \(url.lastPathComponent, privacy: .public)")
      return nil
    }
    do {
      return try JSONDecoder().decode(WidgetSnapshot.self, from: data)
    } catch {
      logger.error("Snapshot decode failed: \(error.localizedDescription, privacy: .public)")
      return nil
    }
  }
}
