import Foundation

enum TokenStatHelper {
  /// Shown where an owed figure would be when the read was unavailable. A word, not a glyph:
  /// the dash beside it means nothing owed, and this must not read as an amount either.
  static let unreadLabel = "Unknown"

  static func owedString(for symbol: String, in owed: [WidgetToken]) -> String? {
    guard let token = owed.first(where: { $0.symbol == symbol }) else { return nil }
    guard token.formatted != "0" else { return nil }
    return "+\(token.formatted)"
  }
}
