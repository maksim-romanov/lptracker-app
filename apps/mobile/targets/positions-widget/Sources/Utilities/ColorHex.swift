import SwiftUI

extension Color {
  init(hex: String) {
    var cleaned = hex.trimmingCharacters(in: .whitespaces)
    if cleaned.hasPrefix("#") { cleaned.removeFirst() }
    var value: UInt64 = 0
    Scanner(string: cleaned).scanHexInt64(&value)

    let r, g, b: Double
    if cleaned.count == 6 {
      r = Double((value >> 16) & 0xFF) / 255
      g = Double((value >> 8) & 0xFF) / 255
      b = Double(value & 0xFF) / 255
    } else {
      r = 0; g = 0; b = 0
    }
    self = Color(red: r, green: g, blue: b)
  }
}
