import SwiftUI
import WidgetKit

struct SmallPositionView: View {
  let entry: PositionsEntry

  var body: some View {
    if let position = entry.position {
      VStack(alignment: .leading, spacing: Spacing.sm) {
        PairHeaderView(
          pair: position.pair,
          protocolLabel: position.protocolLabel,
          brandColor: position.brandColor
        )
        Spacer()
        StatusBadgeView(status: position.status)
        Spacer()
        feeTier(for: position.widgetExtension)
      }
      .padding(Spacing.md)
    } else {
      EmptyStateView()
    }
  }

  @ViewBuilder
  private func feeTier(for ext: WidgetExtension) -> some View {
    switch ext {
    case .uniswapV3(let payload):
      TagPillView(text: payload.feeTierLabel, tone: .neutral)
    case .unknown:
      EmptyView()
    }
  }
}

struct EmptyStateView: View {
  var body: some View {
    VStack(spacing: Spacing.sm) {
      Image(systemName: "list.bullet.rectangle")
        .font(.system(size: 24))
        .foregroundStyle(Color.textMuted)
      Text("No position")
        .font(TypeScale.bodySmall)
        .foregroundStyle(Color.textMuted)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}
