import SwiftUI

struct RangeBarView: View {
  let status: WidgetStatus

  private var fill: Color {
    switch status {
    case .inRange: return .statusInRange
    case .outOfRange: return .statusOutOfRange
    case .closed: return .textMuted
    }
  }

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        Capsule()
          .fill(Color.textPrimary.opacity(0.05))
          .frame(height: 6)

        Capsule()
          .fill(fill.opacity(0.9))
          .frame(width: geo.size.width * 0.8, height: 6)
          .offset(x: geo.size.width * 0.1)

        Circle()
          .fill(fill)
          .frame(width: 14, height: 14)
          .overlay(Circle().stroke(Color.bgPrimary, lineWidth: 2))
          .shadow(color: fill.opacity(0.85), radius: 8, x: 0, y: 0)
          .offset(x: geo.size.width * 0.5 - 7)
      }
      .frame(height: 14, alignment: .center)
    }
    .frame(height: 14)
  }
}
