import SwiftUI

enum TagTone {
  case neutral, success, warning

  var fg: Color {
    switch self {
    case .neutral: return .textMuted
    case .success: return .statusInRange
    case .warning: return .statusOutOfRange
    }
  }

  var bg: Color { fg.opacity(0.12) }
  var border: Color { fg }
}

struct TagPillView: View {
  let text: String
  let tone: TagTone

  var body: some View {
    Text(text)
      .font(TypeScale.label)
      .foregroundStyle(tone.fg)
      .padding(.horizontal, Spacing.md)
      .padding(.vertical, 3)
      .background(tone.bg)
      .overlay(Capsule().stroke(tone.border, lineWidth: 1))
      .clipShape(Capsule())
  }
}
