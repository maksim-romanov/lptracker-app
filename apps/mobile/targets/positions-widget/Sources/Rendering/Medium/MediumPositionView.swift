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
    HStack(alignment: .top, spacing: 14) {
      leftColumn(position: position)
        .frame(maxWidth: .infinity, alignment: .leading)
      Rectangle()
        .fill(Color.textPrimary.opacity(0.08))
        .frame(width: 1)
      rightColumn(position: position)
        .frame(width: 105, alignment: .leading)
    }
  }

  // MARK: - Left (identity + range)

  @ViewBuilder
  private func leftColumn(position: WidgetPosition) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      pairRow(position: position)
      tagsRow(position: position)
      Spacer(minLength: 0)
      rangeBlock(position: position)
    }
  }

  @ViewBuilder
  private func pairRow(position: WidgetPosition) -> some View {
    HStack(alignment: .center, spacing: 8) {
      Text("\(position.pair.sym0)/\(position.pair.sym1)")
        .font(.satoshi(.black, size: 23))
        .foregroundStyle(Color.textPrimary)
        .lineLimit(1)
        .minimumScaleFactor(0.4)
      Spacer(minLength: 4)
      reverseButton(ref: position.ref)
    }
  }

  @ViewBuilder
  private func reverseButton(ref: String) -> some View {
    Button(intent: ToggleInversionIntent(ref: ref)) {
      Image(systemName: "arrow.left.arrow.right")
        .font(.system(size: 10, weight: .bold))
        .foregroundStyle(Color.textMuted)
        .frame(width: 20, height: 20)
        .background(Circle().fill(Color.textPrimary.opacity(0.06)))
    }
    .buttonStyle(.plain)
  }

  @ViewBuilder
  private func tagsRow(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension {
      HStack(spacing: 5) {
        ChainTag(chainID: position.chainId)
        MetaTag(text: payload.feeTierLabel)
        StatusTag(status: position.status)
        Spacer(minLength: 0)
      }
    }
  }

  @ViewBuilder
  private func rangeBlock(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension, let range = payload.range {
      let lower = priceLabel(range.tickLower, delta: range.decimalsDelta)
      let upper = priceLabel(range.tickUpper, delta: range.decimalsDelta)
      let current = priceLabel(range.currentTick, delta: range.decimalsDelta)
      VStack(alignment: .leading, spacing: 4) {
        HStack(spacing: 0) {
          Text(lower)
            .frame(maxWidth: .infinity, alignment: .leading)
          Text(upper)
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .font(.satoshi(.medium, size: 11))
        .foregroundStyle(Color.textMuted)
        .lineLimit(1)
        .minimumScaleFactor(0.7)

        RangeBarView(range: range, trackHeight: 8, thumbSize: 16)

        Text(current)
          .font(.satoshi(.bold, size: 12))
          .foregroundStyle(Color.textPrimary)
          .frame(maxWidth: .infinity, alignment: .center)
          .lineLimit(1)
          .minimumScaleFactor(0.7)
      }
    }
  }

  private func priceLabel(_ tick: Int, delta: Int) -> String {
    PriceMath.format(PriceMath.tickToPrice(tick: tick, decimalsDelta: delta))
  }

  // MARK: - Right (value + fees)

  @ViewBuilder
  private func rightColumn(position: WidgetPosition) -> some View {
    let t0sym = position.principals.first?.symbol
    let t1sym = position.principals.dropFirst().first?.symbol
    VStack(alignment: .leading, spacing: 10) {
      statBlock(
        label: "Value",
        accent: .textPrimary,
        primarySize: 20,
        secondarySize: 14,
        left: position.principals.first?.formatted,
        leftSymbol: t0sym,
        right: position.principals.dropFirst().first?.formatted,
        rightSymbol: t1sym
      )
      statBlock(
        label: "Fees",
        accent: .brandPrimary,
        primarySize: 16,
        secondarySize: 12,
        left: feeText(symbol: t0sym, fees: position.fees),
        leftSymbol: t0sym,
        right: feeText(symbol: t1sym, fees: position.fees),
        rightSymbol: t1sym
      )
      Spacer(minLength: 0)
    }
  }

  @ViewBuilder
  private func statBlock(
    label: String,
    accent: Color,
    primarySize: CGFloat,
    secondarySize: CGFloat,
    left: String?,
    leftSymbol: String?,
    right: String?,
    rightSymbol: String?
  ) -> some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(label)
        .font(.satoshi(.medium, size: 11))
        .foregroundStyle(Color.textMuted)
      statLine(value: left, symbol: leftSymbol, accent: accent, size: primarySize)
      statLine(value: right, symbol: rightSymbol, accent: accent, size: secondarySize)
    }
  }

  @ViewBuilder
  private func statLine(value: String?, symbol: String?, accent: Color, size: CGFloat) -> some View {
    let isEmpty = value == nil
    let text = value ?? "—"
    HStack(alignment: .firstTextBaseline, spacing: 3) {
      Text(text)
        .font(.satoshi(.bold, size: size))
        .foregroundStyle(isEmpty ? Color.textMuted.opacity(0.5) : accent)
      if let symbol, !isEmpty {
        Text(symbol)
          .font(.satoshi(.medium, size: max(9, size - 8)))
          .foregroundStyle(Color.textMuted)
      }
    }
    .lineLimit(1)
    .minimumScaleFactor(0.45)
  }

  private func feeText(symbol: String?, fees: [WidgetToken]) -> String? {
    guard let symbol else { return nil }
    return TokenStatHelper.feeString(for: symbol, in: fees)
  }
}
