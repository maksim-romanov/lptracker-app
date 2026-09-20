import SwiftUI

/// Vertical stat group with a header label and two stacked value lines
/// (primary above secondary). Used by the Medium widget's right column
/// for `Value` and `Owed` sections.
struct StatBlock: View {
  let label: String
  let accent: Color
  let primary: TokenAmount
  let secondary: TokenAmount
  let density: Density
  /// Replaces both figures when there is no amount to show and the dash would misreport why.
  var unknownLabel: String?

  enum Density {
    /// Display density — used for the headline `Value` block.
    case display
    /// Compact density — used for the secondary `Owed` block.
    case compact

    var primaryFont: Font {
      switch self {
      case .display: return TypeScale.valueLg
      case .compact: return TypeScale.valueSm
      }
    }

    var secondaryFont: Font {
      switch self {
      case .display: return TypeScale.valueXs
      case .compact: return TypeScale.valueXxxs
      }
    }

    var primarySymbolFont: Font {
      switch self {
      case .display: return TypeScale.suffixLg
      case .compact: return TypeScale.suffixSm
      }
    }

    var secondarySymbolFont: Font {
      switch self {
      case .display: return TypeScale.suffixMd
      case .compact: return TypeScale.suffixSm
      }
    }
  }

  var body: some View {
    VStack(alignment: .leading, spacing: Spacing.xxs) {
      Text(label)
        .font(TypeScale.labelMd)
        .foregroundStyle(Color.textMuted)
      if let unknownLabel {
        Text(unknownLabel)
          .font(TypeScale.labelLg)
          .foregroundStyle(Color.textMuted)
          .singleLineFit(TextScale.standard)
      } else {
        StatLine(
          amount: primary,
          valueFont: density.primaryFont,
          symbolFont: density.primarySymbolFont,
          valueColor: accent
        )
        StatLine(
          amount: secondary,
          valueFont: density.secondaryFont,
          symbolFont: density.secondarySymbolFont,
          valueColor: accent
        )
      }
    }
  }
}
