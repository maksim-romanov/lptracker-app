import Foundation

enum PriceMath {
  static func tickToPrice(tick: Int, decimalsDelta: Int) -> Double {
    let infinityThreshold = 800_000
    if tick >= infinityThreshold { return .infinity }
    if tick <= -infinityThreshold { return 0 }
    return exp(Double(tick) * log(1.0001) + Double(decimalsDelta) * log(10))
  }

  static func format(_ value: Double) -> String {
    guard value.isFinite else { return "∞" }
    if value <= 0 { return "0" }
    if value >= 1e15 { return "∞" }
    let abs = Swift.abs(value)
    if abs >= 1e6 { return compact(value) }
    if abs >= 1000 { return decimal(value, fractionDigits: 0) }
    if abs >= 1 { return decimal(value, fractionDigits: 2) }
    if abs >= 0.01 { return decimal(value, fractionDigits: 4) }
    if abs >= 1e-6 { return decimal(value, fractionDigits: 6) }
    return String(format: "%.2e", value)
  }

  private static func compact(_ value: Double) -> String {
    let abs = Swift.abs(value)
    if abs >= 1e12 { return "\(decimal(value / 1e12, fractionDigits: 2))T" }
    if abs >= 1e9 { return "\(decimal(value / 1e9, fractionDigits: 2))B" }
    if abs >= 1e6 { return "\(decimal(value / 1e6, fractionDigits: 2))M" }
    return decimal(value, fractionDigits: 0)
  }

  private static func decimal(_ value: Double, fractionDigits: Int) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    formatter.minimumFractionDigits = 0
    formatter.maximumFractionDigits = fractionDigits
    formatter.usesGroupingSeparator = false
    return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
  }
}
