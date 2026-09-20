import SwiftUI

struct StatusTag: View {
  let status: WidgetStatus
  var size: TagSize = .large

  private var tint: Color {
    switch status {
    case .inRange: return .statusInRange
    case .outOfRange: return .statusOutOfRange
    case .drained: return .brandPrimary
    case .closed, .unknown: return .textMuted
    }
  }

  private var text: String {
    switch status {
    case .inRange: return "In range"
    case .outOfRange: return "Out of range"
    // Not "Closed": the liquidity is gone but the money is not, and one transaction collects it.
    case .drained: return "Fees to claim"
    case .closed: return "Closed"
    case .unknown: return "Unknown state"
    }
  }

  private var backgroundOpacity: CGFloat {
    status == .inRange ? Opacity.surfaceTint : Opacity.surfaceTintStrong
  }

  var body: some View {
    HStack(spacing: size.internalSpacing) {
      Circle()
        .fill(tint)
        .frame(width: size.dotSize, height: size.dotSize)
      Text(text)
        .font(size.labelFont)
        .foregroundStyle(tint)
        .lineLimit(1)
        .fixedSize(horizontal: true, vertical: false)
    }
    .tagChrome(size: size, background: tint.opacity(backgroundOpacity))
  }
}
