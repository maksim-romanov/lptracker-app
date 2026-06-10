import SwiftUI

struct EmptyStateView: View {
  let reason: EmptyReason

  private var icon: String {
    switch reason {
    case .notConfigured: return "rectangle.on.rectangle.angled"
    case .configuredMissing: return "exclamationmark.triangle"
    }
  }

  private var message: String {
    switch reason {
    case .notConfigured: return "Long-press to pick a position"
    case .configuredMissing: return "This position is no longer available. Long-press to pick another."
    }
  }

  var body: some View {
    VStack(spacing: Spacing.md) {
      Image(systemName: icon)
        .font(.system(size: Sizing.Icon.emptyState, weight: .medium))
        .foregroundStyle(Color.textMuted)
        .accessibilityHidden(true)
      Text(message)
        .font(TypeScale.labelMd)
        .foregroundStyle(Color.textMuted)
        .multilineTextAlignment(.center)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(Spacing.lg)
  }
}
