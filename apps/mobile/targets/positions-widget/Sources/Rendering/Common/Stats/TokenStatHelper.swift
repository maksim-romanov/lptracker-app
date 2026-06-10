import Foundation

enum TokenStatHelper {
  static func feeString(for symbol: String, in fees: [WidgetToken]) -> String? {
    guard let token = fees.first(where: { $0.symbol == symbol }) else { return nil }
    guard token.formatted != "0" else { return nil }
    return "+\(token.formatted)"
  }
}
