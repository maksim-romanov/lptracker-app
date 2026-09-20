import SwiftUI

/// One row in the Small widget footer — `Label   value₀ / value₁`.
/// Label on the left, joined values flush to the right.
struct InlineStatRow: View {
  let label: String
  let left: String?
  let right: String?
  let accent: Color
  let valueFont: Font
  /// Replaces both values when there is no amount to show and the dash would misreport why.
  var unknownLabel: String?

  var body: some View {
    HStack(alignment: .firstTextBaseline, spacing: Spacing.md) {
      Text(label)
        .font(TypeScale.labelLg)
        .foregroundStyle(Color.textMuted)
      Spacer(minLength: 0)
      if let unknownLabel {
        Text(unknownLabel)
          .font(TypeScale.labelLg)
          .foregroundStyle(Color.textMuted)
          .singleLineFit(TextScale.standard)
      } else {
        Text(joinedValues)
          .widgetStyle(valueFont, color: accent, scale: TextScale.aggressive)
      }
    }
  }

  private var joinedValues: String {
    let leftValue = left ?? "—"
    let rightValue = right ?? "—"
    return "\(leftValue) / \(rightValue)"
  }
}
