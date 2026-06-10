import SwiftUI

struct RangeBarView: View {
  let range: WidgetTickRange
  let trackHeight: CGFloat
  let thumbSize: CGFloat

  init(
    range: WidgetTickRange,
    trackHeight: CGFloat = Sizing.RangeBar.track,
    thumbSize: CGFloat = Sizing.RangeBar.thumb
  ) {
    self.range = range
    self.trackHeight = trackHeight
    self.thumbSize = thumbSize
  }

  private var bar: RangeMath.BarPositions {
    RangeMath.barPositions(
      currentTick: range.currentTick,
      tickLower: range.tickLower,
      tickUpper: range.tickUpper
    )
  }

  private var fill: Color {
    bar.inRange ? .statusInRange : .statusOutOfRange
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
    bar.inRange
      ? "Price \(range.currentLabel), in range \(range.lowerLabel) to \(range.upperLabel)"
      : "Price \(range.currentLabel), out of range. Bounds \(range.lowerLabel) to \(range.upperLabel)"
  }
}
