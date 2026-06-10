import SwiftUI

struct StatusPill: View {
  let status: WidgetStatus
  let size: Size

  enum Size { case small, medium }

  init(status: WidgetStatus, size: Size = .small) {
    self.status = status
    self.size = size
  }

  private var tint: Color {
    switch status {
    case .inRange: return .statusInRange
    case .outOfRange: return .statusOutOfRange
    case .closed: return .textMuted
    }
  }

  private var text: String {
    switch status {
    case .inRange: return "In range"
    case .outOfRange: return "Out of range"
    case .closed: return "Closed"
    }
  }

  private var textSize: CGFloat { size == .medium ? 12 : 10 }
  private var dotSize: CGFloat { size == .medium ? 6 : 5 }
  private var verticalPad: CGFloat { size == .medium ? 4 : 3 }
  private var horizontalPad: CGFloat { size == .medium ? 8 : 6 }

  var body: some View {
    HStack(spacing: 5) {
      Circle().fill(tint).frame(width: dotSize, height: dotSize)
      Text(text)
        .font(.satoshi(.medium, size: textSize))
        .foregroundStyle(tint)
        .lineLimit(1)
    }
    .padding(.horizontal, horizontalPad)
    .padding(.vertical, verticalPad)
    .background(
      Capsule().fill(tint.opacity(0.14))
    )
    .overlay(
      Capsule().strokeBorder(tint.opacity(0.28), lineWidth: 0.5)
    )
  }
}
