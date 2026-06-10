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
    VStack(alignment: .leading, spacing: 12) {
      pairRow(position: position)
      rangeSection(position: position)
      Spacer(minLength: 0)
      footer(position: position)
    }
  }

  @ViewBuilder
  private func rangeSection(position: WidgetPosition) -> some View {
    VStack(alignment: .leading, spacing: 10) {
      tagsRow(position: position)
      rangeBar(position: position)
    }
  }

  @ViewBuilder
  private func footer(position: WidgetPosition) -> some View {
    VStack(alignment: .leading, spacing: 6) {
      footerRow(
        label: "Value",
        left: position.principals.first?.formatted,
        right: position.principals.dropFirst().first?.formatted,
        accent: .textPrimary,
        size: 18
      )
      footerRow(
        label: "Fees",
        left: feeText(symbol: position.principals.first?.symbol, fees: position.fees),
        right: feeText(symbol: position.principals.dropFirst().first?.symbol, fees: position.fees),
        accent: .brandPrimary,
        size: 13
      )
    }
  }

  @ViewBuilder
  private func pairRow(position: WidgetPosition) -> some View {
    HStack(alignment: .center, spacing: 6) {
      Text("\(position.pair.sym0)/\(position.pair.sym1)")
        .font(.satoshi(.black, size: 36))
        .foregroundStyle(Color.textPrimary)
        .lineLimit(1)
        .minimumScaleFactor(0.4)
      Spacer(minLength: 0)
      reverseButton(ref: position.ref)
    }
  }

  @ViewBuilder
  private func reverseButton(ref: String) -> some View {
    Button(intent: ToggleInversionIntent(ref: ref)) {
      Image(systemName: "arrow.left.arrow.right")
        .font(.system(size: 9, weight: .bold))
        .foregroundStyle(Color.textMuted)
        .frame(width: 18, height: 18)
        .background(Circle().fill(Color.textPrimary.opacity(0.06)))
    }
    .buttonStyle(.plain)
  }

  @ViewBuilder
  private func tagsRow(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension {
      HStack(spacing: 5) {
        MetaTag(text: payload.feeTierLabel)
        StatusTag(status: position.status)
        Spacer(minLength: 0)
      }
    }
  }

  @ViewBuilder
  private func rangeBar(position: WidgetPosition) -> some View {
    if case .uniswapV3(let payload) = position.widgetExtension, let range = payload.range {
      RangeBarView(range: range, trackHeight: 8, thumbSize: 16)
    }
  }

  private func feeText(symbol: String?, fees: [WidgetToken]) -> String? {
    guard let symbol else { return nil }
    return TokenStatHelper.feeString(for: symbol, in: fees)
  }

  @ViewBuilder
  private func footerRow(
    label: String,
    left: String?,
    right: String?,
    accent: Color,
    size: CGFloat
  ) -> some View {
    HStack(alignment: .firstTextBaseline, spacing: 8) {
      Text(label)
        .font(.satoshi(.medium, size: 12))
        .foregroundStyle(Color.textMuted)
      Spacer(minLength: 0)
      Text(joinedValues(left, right))
        .font(.satoshi(.bold, size: size))
        .foregroundStyle(accent)
        .lineLimit(1)
        .minimumScaleFactor(0.4)
    }
  }

  private func joinedValues(_ left: String?, _ right: String?) -> String {
    let l = left ?? "—"
    let r = right ?? "—"
    return "\(l) / \(r)"
  }
}

struct MetaTag: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.satoshi(.medium, size: 11))
      .foregroundStyle(Color.textMuted)
      .padding(.horizontal, 7)
      .padding(.vertical, 3)
      .background(Capsule().fill(Color.textPrimary.opacity(0.06)))
  }
}

struct StatusTag: View {
  let status: WidgetStatus

  private var tint: Color {
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
      Circle().fill(tint).frame(width: 6, height: 6)
      Text(text)
        .font(.satoshi(.medium, size: 11))
        .foregroundStyle(tint)
    }
    .padding(.horizontal, 7)
    .padding(.vertical, 3)
    .background(Capsule().fill(tint.opacity(0.12)))
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
