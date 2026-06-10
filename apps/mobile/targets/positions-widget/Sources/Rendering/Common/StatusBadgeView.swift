import SwiftUI

struct StatusBadgeView: View {
  let status: WidgetStatus

  var body: some View {
    TagPillView(text: text, tone: tone)
      .glow(status == .outOfRange ? Shadows.strong : Shadows.subtle)
  }

  private var text: String {
    switch status {
    case .inRange: return "In range"
    case .outOfRange: return "Out of range"
    case .closed: return "Closed"
    }
  }

  private var tone: TagTone {
    switch status {
    case .inRange: return .success
    case .outOfRange: return .warning
    case .closed: return .neutral
    }
  }
}
