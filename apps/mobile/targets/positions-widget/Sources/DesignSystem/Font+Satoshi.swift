import SwiftUI

enum SatoshiWeight {
  case regular, medium, bold, black

  var fontName: String {
    switch self {
    case .regular: return "Satoshi-Regular"
    case .medium: return "Satoshi-Medium"
    case .bold: return "Satoshi-Bold"
    case .black: return "Satoshi-Black"
    }
  }
}

extension Font {
  static func satoshi(_ weight: SatoshiWeight, size: CGFloat) -> Font {
    .custom(weight.fontName, size: size)
  }
}

enum TypeScale {
  static let title = Font.satoshi(.bold, size: 22)
  static let headline = Font.satoshi(.bold, size: 18)
  static let body = Font.satoshi(.regular, size: 16)
  static let bodySmall = Font.satoshi(.regular, size: 13)
  static let label = Font.satoshi(.medium, size: 14)
}
