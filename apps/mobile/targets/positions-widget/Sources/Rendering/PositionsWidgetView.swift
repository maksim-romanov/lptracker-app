import SwiftUI
import WidgetKit

struct PositionsWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: PositionsEntry

  var body: some View {
    Group {
      switch family {
      case .systemSmall: SmallPositionView(entry: entry)
      case .systemMedium: MediumPositionView(entry: entry)
      default: SmallPositionView(entry: entry)
      }
    }
    .widgetURL(entry.position.flatMap { WidgetDeepLink.forPosition(ref: $0.ref) })
    .containerBackground(Color.bgPrimary, for: .widget)
  }
}
