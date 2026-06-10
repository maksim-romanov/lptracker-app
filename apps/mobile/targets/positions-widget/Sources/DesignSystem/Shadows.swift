import SwiftUI

enum Shadows {
  struct Glow {
    let color: Color
    let radius: CGFloat
    let opacity: Double
  }

  static let subtle = Glow(color: .brandGlow, radius: 10, opacity: 0.30)
  static let strong = Glow(color: .brandGlow, radius: 14, opacity: 0.45)
  static let hero = Glow(color: .brandGlow, radius: 18, opacity: 0.55)
}

extension View {
  func glow(_ glow: Shadows.Glow) -> some View {
    self.shadow(color: glow.color.opacity(glow.opacity), radius: glow.radius, x: 0, y: 0)
  }
}
