import Foundation
import OSLog

final class SnapshotStore: Sendable {
  static let appGroup = "group.com.depthly.app.shared"
  static let filename = "widget-snapshot.json"

  private let logger = Logger(subsystem: "com.depthly.app.widget", category: "snapshot")

  static let shared = SnapshotStore()

  func load() -> WidgetSnapshot? {
    guard
      let container = FileManager.default.containerURL(
        forSecurityApplicationGroupIdentifier: Self.appGroup
      )
    else {
      logger.warning("App Group container unavailable")
      return nil
    }
    let url = container.appendingPathComponent(Self.filename)
    let data: Data
    do {
      data = try Data(contentsOf: url)
    } catch CocoaError.fileReadNoSuchFile {
      logger.notice("No snapshot file at \(url.lastPathComponent, privacy: .public)")
      return nil
    } catch {
      logger.error("Snapshot read failed: \(error.localizedDescription, privacy: .public)")
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
