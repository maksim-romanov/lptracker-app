import Foundation

enum ChainCatalog {
  static func name(for chainID: Int) -> String {
    switch chainID {
    case 1: return "Ethereum"
    case 8453: return "Base"
    case 42161: return "Arbitrum"
    case 10: return "Optimism"
    case 137: return "Polygon"
    case 56: return "BNB Chain"
    case 43114: return "Avalanche"
    default: return "Chain \(chainID)"
    }
  }

  static func shortName(for chainID: Int) -> String {
    switch chainID {
    case 1: return "ETH"
    case 8453: return "Base"
    case 42161: return "ARB"
    case 10: return "OP"
    case 137: return "MATIC"
    case 56: return "BNB"
    case 43114: return "AVAX"
    default: return "\(chainID)"
    }
  }
}
