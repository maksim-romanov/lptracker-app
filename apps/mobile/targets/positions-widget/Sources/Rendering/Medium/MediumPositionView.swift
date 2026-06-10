import SwiftUI
import WidgetKit

struct MediumPositionView: View {
  let entry: PositionsEntry

  var body: some View {
    if let position = entry.position {
      HStack(alignment: .top, spacing: Spacing.md) {
        VStack(alignment: .leading, spacing: Spacing.sm) {
          PairHeaderView(
            pair: position.pair,
            protocolLabel: position.protocolLabel,
            brandColor: position.brandColor
          )
          HStack(spacing: Spacing.sm) {
            ChainBadgeView(chainID: position.chainId)
            StatusBadgeView(status: position.status)
          }
          Spacer()
          feesRow(fees: position.fees)
        }
        Spacer()
        tail(for: position.widgetExtension, status: position.status)
          .frame(maxWidth: 140)
      }
      .padding(Spacing.md)
    } else {
      EmptyStateView()
    }
  }

  @ViewBuilder
  private func tail(for ext: WidgetExtension, status: WidgetStatus) -> some View {
    switch ext {
    case .uniswapV3(let payload):
      UniswapV3TailView(payload: payload, status: status)
    case .unknown:
      Text("Unsupported")
        .font(TypeScale.bodySmall)
        .foregroundStyle(Color.textMuted)
    }
  }

  @ViewBuilder
  private func feesRow(fees: [WidgetToken]) -> some View {
    if fees.isEmpty {
      Text("No unclaimed fees")
        .font(TypeScale.bodySmall)
        .foregroundStyle(Color.textMuted)
    } else {
      VStack(alignment: .leading, spacing: 2) {
        Text("Unclaimed fees")
          .font(TypeScale.bodySmall)
          .foregroundStyle(Color.textMuted)
        Text(fees.map { "\($0.formatted) \($0.symbol)" }.joined(separator: " · "))
          .font(TypeScale.label)
          .foregroundStyle(Color.textPrimary)
      }
    }
  }
}
