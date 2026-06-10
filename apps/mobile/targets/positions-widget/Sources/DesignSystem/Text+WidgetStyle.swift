import SwiftUI

extension Text {
  /// Apply a typographic role to a single-line, shrink-to-fit text.
  /// Centralises the four-modifier combo (`font` + `foregroundStyle` +
  /// `lineLimit(1)` + `minimumScaleFactor`) used throughout the widget.
  func widgetStyle(
    _ font: Font,
    color: Color = .textPrimary,
    scale: CGFloat = TextScale.standard
  ) -> some View {
    self
      .font(font)
      .foregroundStyle(color)
      .lineLimit(1)
      .minimumScaleFactor(scale)
  }
}

extension View {
  /// Convenience for the `.lineLimit(1) + .minimumScaleFactor(_)` pair
  /// used when the children are not directly `Text` (e.g. concatenated
  /// stacks of `Text` views in an `HStack`).
  func singleLineFit(_ scale: CGFloat = TextScale.standard) -> some View {
    self.lineLimit(1).minimumScaleFactor(scale)
  }
}
