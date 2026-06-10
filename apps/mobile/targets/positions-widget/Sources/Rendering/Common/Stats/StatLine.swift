import SwiftUI

/// One value-symbol pair on a single baseline-aligned line.
/// Used inside `StatBlock` to render primary/secondary stat lines.
struct StatLine: View {
  let amount: TokenAmount
  let valueFont: Font
  let symbolFont: Font
  let valueColor: Color

  var body: some View {
    let isEmpty = amount.value == nil
    let text = amount.value ?? "—"
    HStack(alignment: .firstTextBaseline, spacing: Spacing.xs) {
      Text(text)
        .font(valueFont)
        .foregroundStyle(isEmpty ? Color.textMuted.opacity(Opacity.textPlaceholder) : valueColor)
      if let symbol = amount.symbol, !isEmpty {
        Text(symbol)
          .font(symbolFont)
          .foregroundStyle(Color.textMuted)
      }
    }
    .singleLineFit(TextScale.aggressive)
  }
}
