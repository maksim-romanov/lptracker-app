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
  static func satoshi(
    _ weight: SatoshiWeight,
    size: CGFloat,
    relativeTo style: Font.TextStyle = .body
  ) -> Font {
    .custom(weight.fontName, size: size, relativeTo: style)
  }
}
