import AppIntents
import SwiftUI

/// Circular button that toggles base/quote inversion for a position
/// through `ToggleInversionIntent`. Used in both the Small and Medium
/// widgets — sized by `Kind`.
struct ReverseButton: View {
  let ref: String
  let kind: Kind

  enum Kind {
    case small
    case medium

    var diameter: CGFloat {
      switch self {
      case .small: return Sizing.ReverseButton.small
      case .medium: return Sizing.ReverseButton.medium
      }
    }

    var iconWeight: CGFloat {
      switch self {
      case .small: return Sizing.ReverseButton.smallIconWeight
      case .medium: return Sizing.ReverseButton.mediumIconWeight
      }
    }
  }

  var body: some View {
    Button(intent: ToggleInversionIntent(ref: ref)) {
      Image(systemName: "arrow.left.arrow.right")
        .font(.system(size: kind.iconWeight, weight: .bold))
        .foregroundStyle(Color.textMuted)
        .frame(width: kind.diameter, height: kind.diameter)
        .background(Circle().fill(Color.textPrimary.opacity(Opacity.strokeSubtle)))
    }
    .buttonStyle(.plain)
    .accessibilityLabel("Swap base and quote")
  }
}
