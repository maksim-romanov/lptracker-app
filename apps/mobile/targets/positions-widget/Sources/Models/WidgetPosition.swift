import Foundation

enum WidgetStatus: String, Codable, Sendable, Hashable {
  case inRange = "in-range"
  case outOfRange = "out-of-range"
  case drained
  case closed
  case unknown

  // A state this build does not recognize must not throw: SnapshotStore turns any decode error
  // into a nil snapshot, so one unknown string would blank every installed widget.
  init(from decoder: Decoder) throws {
    let raw = try decoder.singleValueContainer().decode(String.self)
    self = WidgetStatus(rawValue: raw) ?? .unknown
  }
}

/// `feeAccrual.mode` as the contract spells it. Kept as a string rather than an enum: a mode
/// this build was not compiled against has to stay itself, not collapse into "unknown", which
/// says the amount was never read.
enum FeeAccrualMode {
  static let unknown = "unknown"
}

struct WidgetPosition: Codable, Sendable, Hashable, Identifiable {
  let ref: String
  let chainId: Int
  let protocolLabel: String
  let status: WidgetStatus
  let pair: WidgetPair
  let principals: [WidgetToken]
  /// What a claim would pay out, not fee income: Uniswap credits withdrawn principal into the
  /// same balance. Still keyed `fees` on the wire: this binary declares the key non-optional.
  let fees: [WidgetToken]
  let feeMode: String?
  let widgetExtension: WidgetExtension

  var id: String { ref }

  // The key is absent in a snapshot written before it existed, and that writer only ever wrote
  // amounts it had read.
  var owedWasRead: Bool { feeMode == nil || feeMode != FeeAccrualMode.unknown }

  var primaryPrincipal: WidgetToken? { principals.first }
  var secondaryPrincipal: WidgetToken? { principals.dropFirst().first }

  private enum CodingKeys: String, CodingKey {
    case ref, chainId, protocolLabel, status, pair, principals, fees, feeMode
    case widgetExtension = "extension"
  }

  func inverted() -> WidgetPosition {
    WidgetPosition(
      ref: ref,
      chainId: chainId,
      protocolLabel: protocolLabel,
      status: status,
      pair: WidgetPair(sym0: pair.sym1, sym1: pair.sym0, icon0: pair.icon1, icon1: pair.icon0),
      principals: Array(principals.reversed()),
      fees: Array(fees.reversed()),
      feeMode: feeMode,
      widgetExtension: widgetExtension.inverted()
    )
  }
}
