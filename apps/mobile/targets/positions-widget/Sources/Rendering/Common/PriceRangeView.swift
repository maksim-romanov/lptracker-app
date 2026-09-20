import SwiftUI

/// Composite view for a position's price range: lower / upper bound labels at
/// the corners, the range bar in the middle, and the current price centred
/// underneath. Every label arrives formatted in the snapshot.
struct PriceRangeView: View {
  let bounds: WidgetPriceBounds
  let status: WidgetStatus

  var body: some View {
    VStack(alignment: .leading, spacing: Spacing.xs) {
      HStack(spacing: 0) {
        Text(bounds.lowerLabel)
          .font(TypeScale.labelMd)
          .foregroundStyle(Color.textMuted)
          .frame(maxWidth: .infinity, alignment: .leading)
        Text(bounds.upperLabel)
          .font(TypeScale.labelMd)
          .foregroundStyle(Color.textMuted)
          .frame(maxWidth: .infinity, alignment: .trailing)
      }
      .singleLineFit(TextScale.moderate)

      RangeBarView(bounds: bounds, status: status)

      Text(bounds.currentLabel)
        .widgetStyle(TypeScale.valueXxxs, scale: TextScale.moderate)
        .frame(maxWidth: .infinity, alignment: .center)
    }
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(
      "Price range \(bounds.lowerLabel) to \(bounds.upperLabel), current \(bounds.currentLabel)"
    )
  }
}
