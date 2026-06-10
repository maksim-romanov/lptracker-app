import SwiftUI
import WidgetKit

struct MediumPositionView: View {
  let entry: PositionsEntry

  var body: some View {
    if let position = entry.position {
      content(position: position)
    } else {
      EmptyStateView()
    }
  }

  @ViewBuilder
  private func content(position: WidgetPosition) -> some View {
    VStack(alignment: .leading, spacing: 10) {
      header(position: position)
      rangeBar(position: position)
      Spacer(minLength: 0)
      tokens(position: position)
    }
  }

  @ViewBuilder
  private func header(position: WidgetPosition) -> some View {
    HStack(alignment: .center, spacing: Spacing.md) {
      PairIconsView(pair: position.pair, iconSize: 26)
      Text("\(position.pair.sym0) / \(position.pair.sym1)")
        .font(.satoshi(.black, size: 20))
        .foregroundStyle(Color.textPrimary)
        .lineLimit(1)
        .minimumScaleFactor(0.55)
      Spacer(minLength: 0)
      StatusPill(status: position.status, size: .medium)
    }
  }

  @ViewBuilder
  private func rangeBar(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension, let range = payload.range {
      RangeBarView(range: range, trackHeight: 9, thumbSize: 18)
    }
  }

  @ViewBuilder
  private func tokens(position: WidgetPosition) -> some View {
    HStack(alignment: .top, spacing: Spacing.lg) {
      tokenStat(
        index: 0,
        principals: position.principals,
        fees: position.fees,
        alignment: .leading
      )
      Rectangle()
        .fill(Color.textPrimary.opacity(0.08))
        .frame(width: 1)
      tokenStat(
        index: 1,
        principals: position.principals,
        fees: position.fees,
        alignment: .trailing
      )
    }
  }

  @ViewBuilder
  private func tokenStat(
    index: Int,
    principals: [WidgetToken],
    fees: [WidgetToken],
    alignment: HorizontalAlignment
  ) -> some View {
    if index < principals.count {
      let token = principals[index]
      TokenStat(
        symbol: token.symbol,
        principal: token.formatted,
        fee: TokenStatHelper.feeString(for: token.symbol, in: fees),
        symbolSize: 28,
        amountSize: 22,
        feeSize: 14,
        alignment: alignment
      )
    }
  }
}
