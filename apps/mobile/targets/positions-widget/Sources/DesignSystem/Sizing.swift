import CoreGraphics

/// Chrome dimensions that are neither spacing (gaps between elements)
/// nor typography. Anything that constrains a `frame`, sets a stroke
/// thickness, or sizes an icon belongs here.
enum Sizing {
  enum RangeBar {
    static let track: CGFloat = 8
    static let thumb: CGFloat = 16
    static let thumbStroke: CGFloat = 2.5
    static let thumbShadowRadius: CGFloat = 6
  }

  enum ReverseButton {
    static let small: CGFloat = 18
    static let medium: CGFloat = 20
    /// SF Symbol point size for the small widget reverse glyph.
    static let smallIconWeight: CGFloat = 9
    /// SF Symbol point size for the medium widget reverse glyph.
    static let mediumIconWeight: CGFloat = 10
  }

  enum Tag {
    static let dotSmall: CGFloat = 5
    static let dotLarge: CGFloat = 6
  }

  enum Divider {
    static let thin: CGFloat = 1
  }

  enum Icon {
    /// SF Symbol point size for the empty-state placeholder icon.
    static let emptyState: CGFloat = 22
  }
}
