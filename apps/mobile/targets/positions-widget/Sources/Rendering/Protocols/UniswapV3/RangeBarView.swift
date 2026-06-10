import SwiftUI

struct RangeBarView: View {
  let range: WidgetTickRange
  let trackHeight: CGFloat
  let thumbSize: CGFloat

  init(range: WidgetTickRange, trackHeight: CGFloat = 6, thumbSize: CGFloat = 12) {
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
          .fill(Color.textPrimary.opacity(0.12))
          .frame(height: trackHeight)
          .frame(maxWidth: .infinity, alignment: .leading)

        Capsule()
          .fill(fill.opacity(0.9))
          .frame(
            width: max(0, geo.size.width * positions.liquidityWidthPct),
            height: trackHeight
          )
          .offset(x: geo.size.width * positions.liquidityLeftPct)

        Circle()
          .fill(fill)
          .frame(width: thumbSize, height: thumbSize)
          .overlay(Circle().stroke(Color.bgPrimary, lineWidth: 2))
          .offset(x: geo.size.width * positions.thumbPct - thumbSize / 2)
      }
      .frame(height: max(thumbSize, trackHeight), alignment: .center)
    }
    .frame(height: max(thumbSize, trackHeight))
  }
}
