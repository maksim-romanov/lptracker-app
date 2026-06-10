import SwiftUI
import WidgetKit

struct PositionsWidget: Widget {
  static let kind = "depthly.position"

  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: Self.kind,
      intent: SelectPositionIntent.self,
      provider: PositionsProvider()
    ) { entry in
      PositionsWidgetView(entry: entry)
    }
    .configurationDisplayName("Position")
    .description("Track a single LP position.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
