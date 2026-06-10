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
    VStack(alignment: .leading, spacing: 6) {
      header(position: position)

      rangeRow(position: position)

      Divider().background(Color.textPrimary.opacity(0.08))

      AmountsBlock(title: "Position", tokens: position.principals)

      AmountsBlock(title: "Fees", tokens: position.fees, accent: .brandPrimary, prefix: "+")
    }
    .padding(10)
  }

  @ViewBuilder
  private func header(position: WidgetPosition) -> some View {
    HStack(spacing: Spacing.sm) {
      PairHeaderView(
        pair: position.pair,
        protocolLabel: position.protocolLabel,
        brandColor: position.brandColor,
        iconSize: 20,
        showProtocol: false
      )
      Spacer(minLength: 0)
      Circle()
        .fill(Color.chain(position.chainId))
        .frame(width: 8, height: 8)
    }
  }

  @ViewBuilder
  private func rangeRow(position: WidgetPosition) -> some View {
    switch position.widgetExtension {
    case .uniswapV3(let payload):
      VStack(alignment: .leading, spacing: 4) {
        HStack(spacing: 6) {
          Text(payload.feeTierLabel)
            .font(.satoshi(.medium, size: 10))
            .foregroundStyle(Color.textMuted)
          Text("·")
            .font(.satoshi(.regular, size: 10))
            .foregroundStyle(Color.textMuted)
          StatusLabel(status: position.status)
        }
        if let range = payload.range {
          RangeBarView(range: range, trackHeight: 4, thumbSize: 9)
        }
      }
    case .unknown:
      Text(position.protocolLabel)
        .font(.satoshi(.medium, size: 11))
        .foregroundStyle(Color.textMuted)
    }
  }
}

struct StatusLabel: View {
  let status: WidgetStatus

  private var dot: Color {
    switch status {
    case .inRange: return .statusInRange
    case .outOfRange: return .statusOutOfRange
    case .closed: return .textMuted
    }
  }

  private var text: String {
    switch status {
    case .inRange: return "In range"
    case .outOfRange: return "Out of range"
    case .closed: return "Closed"
    }
  }

  var body: some View {
    HStack(spacing: 4) {
      Circle().fill(dot).frame(width: 6, height: 6)
      Text(text)
        .font(.satoshi(.medium, size: 10))
        .foregroundStyle(Color.textMuted)
        .lineLimit(1)
    }
  }
}

struct AmountsBlock: View {
  let title: String
  let tokens: [WidgetToken]
  var accent: Color = .textPrimary
  var prefix: String = ""

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(title)
        .font(.satoshi(.medium, size: 9))
        .foregroundStyle(Color.textMuted)
        .textCase(.uppercase)
        .tracking(0.5)

      if tokens.isEmpty {
        Text("—")
          .font(.satoshi(.medium, size: 12))
          .foregroundStyle(Color.textMuted)
      } else {
        ForEach(tokens, id: \.symbol) { token in
          HStack(spacing: 4) {
            Text(token.symbol)
              .font(.satoshi(.medium, size: 10))
              .foregroundStyle(Color.textMuted)
              .frame(width: 36, alignment: .leading)
            Text("\(prefix)\(token.formatted)")
              .font(.satoshi(.bold, size: 12))
              .foregroundStyle(accent)
              .lineLimit(1)
              .minimumScaleFactor(0.7)
          }
        }
      }
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
        .font(.satoshi(.medium, size: 13))
        .foregroundStyle(Color.textMuted)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}
