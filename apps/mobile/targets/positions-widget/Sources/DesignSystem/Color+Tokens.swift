import SwiftUI

extension Color {
  static let bgPrimary    = Color("Background/Primary",   bundle: .main)
  static let bgSurface    = Color("Background/Surface",   bundle: .main)
  static let bgVariant    = Color("Background/Variant",   bundle: .main)
  static let textPrimary  = Color("Text/Primary",         bundle: .main)
  static let textMuted    = Color("Text/Muted",           bundle: .main)
  static let borderOutline = Color("Border/Outline",      bundle: .main)
  static let brandPrimary = Color("Brand/Primary",        bundle: .main)
  static let brandGlow    = Color("Brand/Glow",           bundle: .main)
  static let statusInRange    = Color("Status/InRange",     bundle: .main)
  static let statusOutOfRange = Color("Status/OutOfRange",  bundle: .main)
  static let statusError      = Color("Status/Error",       bundle: .main)

  static func chain(_ chainID: Int) -> Color {
    switch chainID {
    case 1:     return Color("Chains/Ethereum",  bundle: .main)
    case 8453:  return Color("Chains/Base",      bundle: .main)
    case 42161: return Color("Chains/Arbitrum",  bundle: .main)
    case 10:    return Color("Chains/Optimism",  bundle: .main)
    case 137:   return Color("Chains/Polygon",   bundle: .main)
    case 56:    return Color("Chains/Bnb",       bundle: .main)
    case 43114: return Color("Chains/Avalanche", bundle: .main)
    default:    return .textMuted
    }
  }
}
