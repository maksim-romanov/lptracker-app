import SwiftUI

/// Composite view for a Uniswap V3 position's price range: lower / upper
/// bound labels at the corners, the range bar in the middle, and the
/// current price centred underneath. All three values derive from
/// `WidgetTickRange` via `PriceMath`.
struct PriceRangeView: View {
  let range: WidgetTickRange

  var body: some View {
    VStack(alignment: .leading, spacing: Spacing.xs) {
      HStack(spacing: 0) {
        Text(range.lowerLabel)
          .font(TypeScale.labelMd)
          .foregroundStyle(Color.textMuted)
          .frame(maxWidth: .infinity, alignment: .leading)
        Text(range.upperLabel)
          .font(TypeScale.labelMd)
          .foregroundStyle(Color.textMuted)
          .frame(maxWidth: .infinity, alignment: .trailing)
      }
      .singleLineFit(TextScale.moderate)

      RangeBarView(range: range)

      Text(range.currentLabel)
        .widgetStyle(TypeScale.valueXxxs, scale: TextScale.moderate)
        .frame(maxWidth: .infinity, alignment: .center)
    }
    .accessibilityElement(children: .ignore)
    .accessibilityLabel(
      "Price range \(range.lowerLabel) to \(range.upperLabel), current \(range.currentLabel)"
    )
  }
}
