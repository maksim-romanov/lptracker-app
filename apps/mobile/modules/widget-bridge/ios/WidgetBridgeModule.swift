import ExpoModulesCore
import WidgetKit

public class WidgetBridgeModule: Module {
  private static let appGroup = "group.com.depthly.app.shared"
  private static let snapshotFilename = "widget-snapshot.json"

  public func definition() -> ModuleDefinition {
    Name("WidgetBridge")

    AsyncFunction("writeSnapshot") { (json: String) -> Void in
      guard let container = FileManager.default.containerURL(
        forSecurityApplicationGroupIdentifier: Self.appGroup
      ) else {
        throw Exception(name: "AppGroupUnavailable", description: "App Group container not found")
      }
      let url = container.appendingPathComponent(Self.snapshotFilename)
      guard let data = json.data(using: .utf8) else {
        throw Exception(name: "EncodingFailed", description: "Snapshot JSON is not UTF-8")
      }
      try data.write(to: url, options: .atomic)
    }

    AsyncFunction("reload") { (kind: String?) -> Void in
      if let kind = kind {
        WidgetCenter.shared.reloadTimelines(ofKind: kind)
      } else {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
