import SwiftUI
import WidgetKit

struct SmallPositionView: View {
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
    VStack(alignment: .leading, spacing: Spacing.lg) {
      pairRow(position: position)
      rangeSection(position: position)
      Spacer(minLength: 0)
      footer(position: position)
    }
  }

  @ViewBuilder
  private func pairRow(position: WidgetPosition) -> some View {
    HStack(alignment: .center, spacing: Spacing.sm) {
      Text("\(position.pair.sym0)/\(position.pair.sym1)")
        .widgetStyle(TypeScale.pairLg, scale: TextScale.aggressive)
        .accessibilityLabel("\(position.pair.sym0) \(position.pair.sym1) pair")
      Spacer(minLength: 0)
      ReverseButton(ref: position.ref, kind: .small)
    }
  }

  @ViewBuilder
  private func rangeSection(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension {
      VStack(alignment: .leading, spacing: Spacing.md) {
        HStack(spacing: Spacing.xs) {
          ChainTag(chainID: position.chainId)
          MetaTag(text: payload.feeTierLabel)
          Spacer(minLength: 0)
        }
        .accessibilityElement(children: .combine)
        if let range = payload.range {
          RangeBarView(range: range)
        }
      }
    }
  }

  @ViewBuilder
  private func footer(position: WidgetPosition) -> some View {
    VStack(alignment: .leading, spacing: Spacing.sm) {
      InlineStatRow(
        label: "Value",
        left: position.primaryPrincipal?.formatted,
        right: position.secondaryPrincipal?.formatted,
        accent: .textPrimary,
        valueFont: TypeScale.valueMd
      )
      InlineStatRow(
        label: "Fees",
        left: feeText(symbol: position.primaryPrincipal?.symbol, fees: position.fees),
        right: feeText(symbol: position.secondaryPrincipal?.symbol, fees: position.fees),
        accent: .brandPrimary,
        valueFont: TypeScale.valueXxs
      )
    }
  }

  private func feeText(symbol: String?, fees: [WidgetToken]) -> String? {
    guard let symbol else { return nil }
    return TokenStatHelper.feeString(for: symbol, in: fees)
  }
}

#if DEBUG
  #Preview("Small — in range", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.inRange
  }

  #Preview("Small — out of range", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.outOfRange
  }

  #Preview("Small — edge left", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.edgeLeft
  }

  #Preview("Small — empty", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.empty
  }

  #Preview("Small — missing", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.missing
  }

  #Preview("Small — tight stable (±50)", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.tightStable
  }

  #Preview("Small — wide (±5000)", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.wideRange
  }

  #Preview("Small — very wide (±20000)", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.veryWide
  }

  #Preview("Small — far out above", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.farOutAbove
  }

  #Preview("Small — far out below", as: .systemSmall) {
    PositionsWidget()
  } timeline: {
    PositionsEntry.farOutBelow
  }
#endif
