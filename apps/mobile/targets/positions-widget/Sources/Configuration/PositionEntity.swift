import Foundation

struct PositionEntity: Identifiable, Hashable, Sendable {
  let id: String
  let displayPair: String
  let subtitle: String

  init(from position: WidgetPosition) {
    self.id = position.ref
    self.displayPair =
      "\(position.pair.sym0)/\(position.pair.sym1) · \(extensionLabel(position.widgetExtension))"
    self.subtitle = "\(position.protocolLabel) · \(ChainCatalog.name(for: position.chainId))"
  }
}

private func extensionLabel(_ ext: WidgetExtension) -> String {
  switch ext {
  case .uniswapV3(let payload): return payload.feeTierLabel
  case .unknown: return "—"
  }
}
