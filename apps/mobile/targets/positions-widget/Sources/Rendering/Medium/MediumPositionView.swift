import SwiftUI
import WidgetKit

struct MediumPositionView: View {
  let entry: PositionsEntry

  var body: some View {
    if let position = entry.position {
      content(position: position)
    } else {
      EmptyStateView(reason: entry.emptyReason ?? .notConfigured)
    }
  }

  @ViewBuilder
  private func content(position: WidgetPosition) -> some View {
    HStack(alignment: .top, spacing: Spacing.xl) {
      leftColumn(position: position)
        .frame(maxWidth: .infinity, alignment: .leading)
      Rectangle()
        .fill(Color.textPrimary.opacity(Opacity.strokeMuted))
        .frame(width: Sizing.Divider.thin)
      rightColumn(position: position)
        .layoutPriority(1)
    }
  }

  // MARK: - Left (identity + range)

  @ViewBuilder
  private func leftColumn(position: WidgetPosition) -> some View {
    VStack(alignment: .leading, spacing: Spacing.md) {
      pairRow(position: position)
      tagsRow(position: position)
      Spacer(minLength: 0)
      if case .uniswapV3(let payload) = position.widgetExtension, let range = payload.range {
        PriceRangeView(range: range)
      }
    }
  }

  @ViewBuilder
  private func pairRow(position: WidgetPosition) -> some View {
    HStack(alignment: .center, spacing: Spacing.xs) {
      Text("\(position.pair.sym0)/\(position.pair.sym1)")
        .widgetStyle(TypeScale.pairMd, scale: TextScale.aggressive)
        .accessibilityLabel("\(position.pair.sym0) \(position.pair.sym1) pair")
      Spacer(minLength: Spacing.md)
      ReverseButton(ref: position.ref, kind: .medium)
    }
  }

  @ViewBuilder
  private func tagsRow(position: WidgetPosition) -> some View {
    HStack(spacing: Spacing.xs) {
      ChainTag(chainID: position.chainId)
      if case .uniswapV3(let payload) = position.widgetExtension {
        MetaTag(text: payload.feeTierLabel)
      }
      StatusTag(status: position.status)
      Spacer(minLength: 0)
    }
    .accessibilityElement(children: .combine)
  }

  // MARK: - Right (value + fees)

  @ViewBuilder
  private func rightColumn(position: WidgetPosition) -> some View {
    let primary = position.primaryPrincipal
    let secondary = position.secondaryPrincipal
    VStack(alignment: .leading, spacing: Spacing.lg) {
      StatBlock(
        label: "Value",
        accent: .textPrimary,
        primary: TokenAmount(value: primary?.formatted, symbol: primary?.symbol),
        secondary: TokenAmount(value: secondary?.formatted, symbol: secondary?.symbol),
        density: .display
      )
      StatBlock(
        label: "Fees",
        accent: .brandPrimary,
        primary: TokenAmount(
          value: feeText(symbol: primary?.symbol, fees: position.fees),
          symbol: primary?.symbol
        ),
        secondary: TokenAmount(
          value: feeText(symbol: secondary?.symbol, fees: position.fees),
          symbol: secondary?.symbol
        ),
        density: .compact
      )
      Spacer(minLength: 0)
    }
  }

  private func feeText(symbol: String?, fees: [WidgetToken]) -> String? {
    guard let symbol else { return nil }
    return TokenStatHelper.feeString(for: symbol, in: fees)
  }
}

#if DEBUG
  #Preview("Medium — in range", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.inRange
  }

  #Preview("Medium — out of range", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.outOfRange
  }

  #Preview("Medium — edge left", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.edgeLeft
  }

  #Preview("Medium — empty", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.empty
  }

  #Preview("Medium — missing", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.missing
  }

  #Preview("Medium — tight stable (±50)", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.tightStable
  }

  #Preview("Medium — wide (±5000)", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.wideRange
  }

  #Preview("Medium — very wide (±20000)", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.veryWide
  }

  #Preview("Medium — far out above", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.farOutAbove
  }

  #Preview("Medium — far out below", as: .systemMedium) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.farOutBelow
  }
#endif
