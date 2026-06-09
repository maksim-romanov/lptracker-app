import SwiftUI
import WidgetKit

@main
struct PositionsWidgetBundle: WidgetBundle {
  var body: some Widget {
    PlaceholderWidget()
  }
}

struct PlaceholderWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "depthly.position.placeholder", provider: PlaceholderProvider()) { _ in
      Text("Depthly")
        .containerBackground(.background, for: .widget)
    }
    .configurationDisplayName("Depthly Position")
    .description("Coming soon.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

struct PlaceholderEntry: TimelineEntry {
  let date: Date
}

struct PlaceholderProvider: TimelineProvider {
  func placeholder(in context: Context) -> PlaceholderEntry {
    PlaceholderEntry(date: .now)
  }
  func getSnapshot(in context: Context, completion: @escaping (PlaceholderEntry) -> Void) {
    completion(PlaceholderEntry(date: .now))
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<PlaceholderEntry>) -> Void) {
    completion(Timeline(entries: [PlaceholderEntry(date: .now)], policy: .never))
  }
}
