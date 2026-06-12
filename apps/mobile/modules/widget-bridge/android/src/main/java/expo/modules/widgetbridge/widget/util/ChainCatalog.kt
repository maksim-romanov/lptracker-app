package expo.modules.widgetbridge.widget.util

object ChainCatalog {
  fun name(chainId: Int): String = when (chainId) {
    1 -> "Ethereum"
    8453 -> "Base"
    42161 -> "Arbitrum"
    10 -> "Optimism"
    137 -> "Polygon"
    56 -> "BNB Chain"
    43114 -> "Avalanche"
    else -> "Chain $chainId"
  }

  fun shortName(chainId: Int): String = when (chainId) {
    1 -> "ETH"
    8453 -> "Base"
    42161 -> "ARB"
    10 -> "OP"
    137 -> "POL"
    56 -> "BNB"
    43114 -> "AVAX"
    else -> chainId.toString()
  }
}
