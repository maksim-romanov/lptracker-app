import SwiftUI
import WidgetKit

struct SmallPositionView: View {
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
    VStack(alignment: .center, spacing: 10) {
      pairRow(position: position)
      rangeBar(position: position)
      amountsRow(position: position)
      feesRow(position: position)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
  }

  @ViewBuilder
  private func pairRow(position: WidgetPosition) -> some View {
    HStack(spacing: 6) {
      PairIconsView(pair: position.pair, iconSize: 22)
      Text("\(position.pair.sym0)/\(position.pair.sym1)")
        .font(.satoshi(.black, size: 17))
        .foregroundStyle(Color.textPrimary)
        .lineLimit(1)
        .minimumScaleFactor(0.4)
    }
  }

  @ViewBuilder
  private func rangeBar(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension, let range = payload.range {
      RangeBarView(range: range, trackHeight: 6, thumbSize: 14)
    }
  }

  @ViewBuilder
  private func amountsRow(position: WidgetPosition) -> some View {
    HStack(alignment: .firstTextBaseline, spacing: Spacing.sm) {
      amountCell(token: position.principals.first, alignment: .leading)
      amountCell(token: position.principals.dropFirst().first, alignment: .trailing)
    }
  }

  @ViewBuilder
  private func amountCell(token: WidgetToken?, alignment: HorizontalAlignment) -> some View {
    let frameAlignment: Alignment = alignment == .leading ? .leading : .trailing
    Text(token.map { "\($0.formatted) \($0.symbol)" } ?? "—")
      .font(.satoshi(.bold, size: 14))
      .foregroundStyle(Color.textPrimary)
      .lineLimit(1)
      .minimumScaleFactor(0.4)
      .frame(maxWidth: .infinity, alignment: frameAlignment)
  }

  @ViewBuilder
  private func feesRow(position: WidgetPosition) -> some View {
    HStack(alignment: .firstTextBaseline, spacing: Spacing.sm) {
      feeCell(
        principal: position.principals.first,
        fees: position.fees,
        alignment: .leading
      )
      feeCell(
        principal: position.principals.dropFirst().first,
        fees: position.fees,
        alignment: .trailing
      )
    }
  }

  @ViewBuilder
  private func feeCell(
    principal: WidgetToken?,
    fees: [WidgetToken],
    alignment: HorizontalAlignment
  ) -> some View {
    let frameAlignment: Alignment = alignment == .leading ? .leading : .trailing
    let feeStr = principal.flatMap { TokenStatHelper.feeString(for: $0.symbol, in: fees) }
    Text(feeStr ?? "—")
      .font(.satoshi(.medium, size: 11))
      .foregroundStyle(feeStr == nil ? Color.textMuted.opacity(0.5) : Color.brandPrimary)
      .lineLimit(1)
      .minimumScaleFactor(0.5)
      .frame(maxWidth: .infinity, alignment: frameAlignment)
  }
}

struct EmptyStateView: View {
  var body: some View {
    VStack(spacing: Spacing.sm) {
      Image(systemName: "rectangle.on.rectangle.angled")
        .font(.system(size: 22, weight: .medium))
        .foregroundStyle(Color.textMuted)
      Text("Tap and hold to pick a position")
        .font(.satoshi(.medium, size: 11))
        .foregroundStyle(Color.textMuted)
        .multilineTextAlignment(.center)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .padding(Spacing.md)
  }
}
