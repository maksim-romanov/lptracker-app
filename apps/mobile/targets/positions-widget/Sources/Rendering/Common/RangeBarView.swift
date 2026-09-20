import SwiftUI

struct RangeBarView: View {
  let bounds: WidgetPriceBounds
  let status: WidgetStatus
  let trackHeight: CGFloat
  let thumbSize: CGFloat

  init(
    bounds: WidgetPriceBounds,
    status: WidgetStatus,
    trackHeight: CGFloat = Sizing.RangeBar.track,
    thumbSize: CGFloat = Sizing.RangeBar.thumb
  ) {
    self.bounds = bounds
    self.status = status
    self.trackHeight = trackHeight
    self.thumbSize = thumbSize
  }

  private var bar: RangeMath.BarPositions {
    RangeMath.barPositions(
      lower: bounds.lowerPrice,
      upper: bounds.upperPrice,
      current: bounds.currentPrice
    )
  }

  // The thumb sits at the current price whatever the status, so a position that holds nothing
  // can still land inside its old bounds. Only a status that holds liquidity earns a live tint.
  private var holdsLiquidity: Bool {
    switch status {
    case .inRange, .outOfRange: return true
    case .drained, .closed, .unknown: return false
    }
  }

  private var fill: Color {
    guard holdsLiquidity else { return .textMuted }
    return bar.inRange ? .statusInRange : .statusOutOfRange
  }

  var body: some View {
    let positions = bar
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        Capsule()
          .fill(Color.textPrimary.opacity(Opacity.strokeStrong))
          .frame(height: trackHeight)
          .frame(maxWidth: .infinity, alignment: .leading)

        Capsule()
          .fill(
            LinearGradient(
              colors: [fill.opacity(Opacity.gradientStart), fill],
              startPoint: .leading,
              endPoint: .trailing
            )
          )
          .frame(
            width: max(0, geo.size.width * positions.liquidityWidthPct),
            height: trackHeight
          )
          .offset(x: geo.size.width * positions.liquidityLeftPct)

        Circle()
          .fill(fill)
          .frame(width: thumbSize, height: thumbSize)
          .overlay(Circle().stroke(Color.bgPrimary, lineWidth: Sizing.RangeBar.thumbStroke))
          .shadow(color: fill.opacity(Opacity.glow), radius: Sizing.RangeBar.thumbShadowRadius, x: 0, y: 0)
          .offset(x: geo.size.width * positions.thumbPct - thumbSize / 2)
      }
      .frame(height: max(thumbSize, trackHeight), alignment: .center)
    }
    .frame(height: max(thumbSize, trackHeight))
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(accessibilityDescription)
  }

  private var accessibilityDescription: String {
    "Price \(bounds.currentLabel), \(stateDescription). Bounds \(bounds.lowerLabel) to \(bounds.upperLabel)"
  }

  private var stateDescription: String {
    switch status {
    case .inRange, .outOfRange: return bar.inRange ? "in range" : "out of range"
    case .drained: return "fees to claim"
    case .closed: return "closed"
    case .unknown: return "unknown state"
    }
  }
}
