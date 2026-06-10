import SwiftUI

/// Visual size configuration shared by all tag-style pills
/// (chain, meta, status). Decouples each tag implementation from
/// the literal numbers controlling its dimensions.
struct TagSize {
  let labelFont: Font
  let dotSize: CGFloat
  let horizontalPadding: CGFloat
  let verticalPadding: CGFloat
  let internalSpacing: CGFloat

  static let compact = TagSize(
    labelFont: TypeScale.labelSm,
    dotSize: Sizing.Tag.dotSmall,
    horizontalPadding: Spacing.sm,
    verticalPadding: Spacing.xxs,
    internalSpacing: Spacing.xs
  )

  static let large = TagSize(
    labelFont: TypeScale.labelMd,
    dotSize: Sizing.Tag.dotLarge,
    horizontalPadding: Spacing.md,
    verticalPadding: Spacing.xxs,
    internalSpacing: Spacing.xs
  )
}

extension View {
  /// Wraps tag content in horizontal/vertical padding and a capsule
  /// background. Used by every tag pill so the chrome stays consistent.
  func tagChrome(size: TagSize, background: Color) -> some View {
    self
      .padding(.horizontal, size.horizontalPadding)
      .padding(.vertical, size.verticalPadding)
      .background(Capsule().fill(background))
  }
}
