import CoreGraphics

/// Widget-container-level metrics — geometry that lives outside of any
/// single view but governs how all of them sit inside the system
/// container.
enum WidgetMetrics {
  /// Padding applied around the entire widget content. Apple's default
  /// `defaultWidgetContentMargins` is asymmetric (≈11pt top/bottom,
  /// 16pt horizontal) which makes side gutters feel disproportionately
  /// wider than the head/foot. We disable system margins via
  /// `.contentMarginsDisabled()` and apply a single symmetric pad here.
  enum ContentMargin {
    static let all: CGFloat = 16
  }
}
