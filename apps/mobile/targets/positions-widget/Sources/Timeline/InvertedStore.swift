import Foundation
import OSLog

final class InvertedStore: Sendable {
  static let appGroup = "group.com.depthly.app.shared"
  static let filename = "widget-inverted.json"

  private let logger = Logger(subsystem: "com.depthly.app.widget", category: "inverted")
  private let writeLock = NSLock()

  static let shared = InvertedStore()

  private struct Payload: Codable {
    let refs: [String]
  }

  private func fileURL() -> URL? {
    FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: Self.appGroup)?
      .appendingPathComponent(Self.filename)
  }

  func loadRefs() -> Set<String> {
    guard let url = fileURL() else { return [] }
    let data: Data
    do {
      data = try Data(contentsOf: url)
    } catch CocoaError.fileReadNoSuchFile {
      return []
    } catch {
      logger.error("Inverted read failed: \(error.localizedDescription, privacy: .public)")
      return []
    }
    do {
      return Set(try JSONDecoder().decode(Payload.self, from: data).refs)
    } catch {
      logger.error("Inverted decode failed: \(error.localizedDescription, privacy: .public)")
      return []
    }
  }

  func toggle(ref: String) {
    writeLock.lock()
    defer { writeLock.unlock() }
    var refs = loadRefs()
    if refs.contains(ref) {
      refs.remove(ref)
    } else {
      refs.insert(ref)
    }
    write(refs: refs)
  }

  func isInverted(ref: String) -> Bool {
    loadRefs().contains(ref)
  }

  private func write(refs: Set<String>) {
    guard let url = fileURL() else {
      logger.warning("App Group container unavailable")
      return
    }
    let payload = Payload(refs: Array(refs))
    do {
      let data = try JSONEncoder().encode(payload)
      try data.write(to: url, options: .atomic)
    } catch {
      logger.error("Inverted write failed: \(error.localizedDescription, privacy: .public)")
    }
  }
}
