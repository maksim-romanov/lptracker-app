import SwiftUI

struct TokenStat: View {
  let symbol: String
  let principal: String
  let fee: String?
  let symbolSize: CGFloat
  let amountSize: CGFloat
  let feeSize: CGFloat
  let alignment: HorizontalAlignment

  init(
    symbol: String,
    principal: String,
    fee: String?,
    symbolSize: CGFloat,
    amountSize: CGFloat,
    feeSize: CGFloat,
    alignment: HorizontalAlignment = .leading
  ) {
    self.symbol = symbol
    self.principal = principal
    self.fee = fee
    self.symbolSize = symbolSize
    self.amountSize = amountSize
    self.feeSize = feeSize
    self.alignment = alignment
  }

  private var frameAlignment: Alignment {
    alignment == .leading ? .leading : .trailing
  }

  var body: some View {
    VStack(alignment: alignment, spacing: 2) {
      Text(symbol)
        .font(.satoshi(.black, size: symbolSize))
        .foregroundStyle(Color.textPrimary)
        .lineLimit(1)
        .minimumScaleFactor(0.4)

      Text(principal)
        .font(.satoshi(.bold, size: amountSize))
        .foregroundStyle(Color.textMuted)
        .lineLimit(1)
        .minimumScaleFactor(0.4)

      Text(fee ?? "—")
        .font(.satoshi(.medium, size: feeSize))
        .foregroundStyle(fee == nil ? Color.textMuted.opacity(0.5) : Color.brandPrimary)
        .lineLimit(1)
        .minimumScaleFactor(0.5)
    }
    .frame(maxWidth: .infinity, alignment: frameAlignment)
  }
}

enum TokenStatHelper {
  static func feeString(for symbol: String, in fees: [WidgetToken]) -> String? {
    guard let token = fees.first(where: { $0.symbol == symbol }) else { return nil }
    guard token.formatted != "0" else { return nil }
    return "+\(token.formatted)"
  }
}
