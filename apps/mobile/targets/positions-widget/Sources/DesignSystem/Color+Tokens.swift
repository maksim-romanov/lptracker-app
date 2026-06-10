import SwiftUI

extension Color {
  static let bgPrimary = Color("bgPrimary", bundle: .main)
  static let bgSurface = Color("bgSurface", bundle: .main)
  static let bgVariant = Color("bgVariant", bundle: .main)
  static let textPrimary = Color("textPrimary", bundle: .main)
  static let textMuted = Color("textMuted", bundle: .main)
  static let borderOutline = Color("borderOutline", bundle: .main)
  static let brandPrimary = Color("brandPrimary", bundle: .main)
  static let brandGlow = Color("brandGlow", bundle: .main)
  static let statusInRange = Color("statusInRange", bundle: .main)
  static let statusOutOfRange = Color("statusOutOfRange", bundle: .main)
  static let statusError = Color("statusError", bundle: .main)

  static func chain(_ chainID: Int) -> Color {
    switch chainID {
    case 1: return Color("chainEthereum", bundle: .main)
    case 8453: return Color("chainBase", bundle: .main)
    case 42161: return Color("chainArbitrum", bundle: .main)
    case 10: return Color("chainOptimism", bundle: .main)
    case 137: return Color("chainPolygon", bundle: .main)
    case 56: return Color("chainBnb", bundle: .main)
    case 43114: return Color("chainAvalanche", bundle: .main)
    default: return .textMuted
    }
  }
}
