import CoreGraphics

/// Spacing tokens on a 4pt grid with 2pt and 6pt half-steps for the
/// tighter rhythm of compact widget surfaces. Any literal value used
/// for `spacing:`/`padding(...)` in a view should map to one of these.
enum Spacing {
  static let xxs: CGFloat = 2
  static let xs: CGFloat = 4
  static let sm: CGFloat = 6
  static let md: CGFloat = 8
  static let lg: CGFloat = 12
  static let xl: CGFloat = 16
  static let xxl: CGFloat = 20
  static let xxxl: CGFloat = 24
}
