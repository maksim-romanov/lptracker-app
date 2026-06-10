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
    VStack(alignment: .leading, spacing: 8) {
      header(position: position)

      rangeBlock(position: position)

      Spacer(minLength: 0)

      HStack(alignment: .top, spacing: Spacing.lg) {
        AmountsBlock(title: "Position", tokens: position.principals)
          .frame(maxWidth: .infinity, alignment: .leading)
        AmountsBlock(title: "Unclaimed fees", tokens: position.fees, accent: .brandPrimary, prefix: "+")
          .frame(maxWidth: .infinity, alignment: .leading)
      }
    }
    .padding(Spacing.md)
  }

  @ViewBuilder
  private func header(position: WidgetPosition) -> some View {
    HStack(spacing: Spacing.sm) {
      PairHeaderView(
        pair: position.pair,
        protocolLabel: position.protocolLabel,
        brandColor: position.brandColor,
        iconSize: 26,
        showProtocol: false
      )
      Spacer(minLength: 0)
      HStack(spacing: 6) {
        Circle()
          .fill(Color.chain(position.chainId))
          .frame(width: 8, height: 8)
        Text(position.protocolLabel)
          .font(.satoshi(.medium, size: 11))
          .foregroundStyle(Color(hex: position.brandColor))
          .lineLimit(1)
        if case .uniswapV3(let payload) = position.widgetExtension {
          Text("·")
            .font(.satoshi(.regular, size: 11))
            .foregroundStyle(Color.textMuted)
          Text(payload.feeTierLabel)
            .font(.satoshi(.medium, size: 11))
            .foregroundStyle(Color.textMuted)
        }
      }
    }
  }

  @ViewBuilder
  private func rangeBlock(position: WidgetPosition) -> some View {
    switch position.widgetExtension {
    case .uniswapV3(let payload):
      VStack(alignment: .leading, spacing: 4) {
        if let range = payload.range {
          RangeBarView(range: range, trackHeight: 5, thumbSize: 11)
        }
        StatusLabel(status: position.status)
      }
    case .unknown:
      Text("Unsupported protocol")
        .font(.satoshi(.medium, size: 11))
        .foregroundStyle(Color.textMuted)
    }
  }
}
