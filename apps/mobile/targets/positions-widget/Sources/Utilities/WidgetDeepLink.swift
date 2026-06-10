import Foundation

enum WidgetDeepLink {
  static let scheme = "depthly"

  static func forPosition(ref: String) -> URL? {
    let encoded = ref.addingPercentEncoding(withAllowedCharacters: .alphanumerics) ?? ref
    return URL(string: "\(scheme):///positions/\(encoded)")
  }
}
