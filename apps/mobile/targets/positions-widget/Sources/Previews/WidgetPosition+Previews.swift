#if DEBUG
  import Foundation

  extension WidgetPosition {
    static let inRangePreview = WidgetPosition(
      ref: "uniswap-v3:1:42",
      chainId: 1,
      protocolLabel: "Uniswap V3",
      status: .inRange,
      pair: WidgetPair(sym0: "WETH", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.5234"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "1.85K")
      ],
      fees: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.0123"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "42.18")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "987654",
          priceRange: .inRangePreview
        )
      )
    )

    static let outOfRangePreview = WidgetPosition(
      ref: "uniswap-v3:1:43",
      chainId: 1,
      protocolLabel: "Uniswap V3",
      status: .outOfRange,
      pair: WidgetPair(sym0: "WBTC", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WBTC", iconUrl: "", formatted: "0"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "12.4K")
      ],
      fees: [
        WidgetToken(symbol: "WBTC", iconUrl: "", formatted: "0.0008"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "8.42")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "112233",
          priceRange: .outOfRangePreview
        )
      )
    )

    static let edgeLeftPreview = WidgetPosition(
      ref: "uniswap-v3:42161:71",
      chainId: 42161,
      protocolLabel: "Uniswap V3",
      status: .inRange,
      pair: WidgetPair(sym0: "ARB", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "ARB", iconUrl: "", formatted: "1.2K"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "342.5")
      ],
      fees: [
        WidgetToken(symbol: "ARB", iconUrl: "", formatted: "3.45"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "1.02")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "555444",
          priceRange: .edgeLeftPreview
        )
      )
    )

    // Liquidity withdrawn, the balance still there, and the last price still inside the old bounds —
    // the case where the bar would otherwise read as live.
    static let drainedPreview = WidgetPosition(
      ref: "uniswap-v3:1:8801",
      chainId: 1,
      protocolLabel: "Uniswap V3",
      status: .drained,
      pair: WidgetPair(sym0: "WETH", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "0")
      ],
      fees: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.0412"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "128.90")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "880199",
          priceRange: .inRangePreview
        )
      )
    )

    static let closedPreview = WidgetPosition(
      ref: "uniswap-v3:8453:9",
      chainId: 8453,
      protocolLabel: "Uniswap V3",
      status: .closed,
      pair: WidgetPair(sym0: "cbETH", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "cbETH", iconUrl: "", formatted: "0"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "0")
      ],
      fees: [
        WidgetToken(symbol: "cbETH", iconUrl: "", formatted: "0"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "0")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "10001",
          priceRange: nil
        )
      )
    )

    static let tightStablePreview = WidgetPosition(
      ref: "uniswap-v3:1:5511",
      chainId: 1,
      protocolLabel: "Uniswap V3",
      status: .inRange,
      pair: WidgetPair(sym0: "USDC", sym1: "USDT", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "1.50K"),
        WidgetToken(symbol: "USDT", iconUrl: "", formatted: "1.48K")
      ],
      fees: [
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "0.42"),
        WidgetToken(symbol: "USDT", iconUrl: "", formatted: "0.18")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.01%",
          nftTokenId: "778812",
          priceRange: .tightStablePreview
        )
      )
    )

    static let wideRangePreview = WidgetPosition(
      ref: "uniswap-v3:8453:1207",
      chainId: 8453,
      protocolLabel: "Uniswap V3",
      status: .inRange,
      pair: WidgetPair(sym0: "WETH", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.85"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "2.5K")
      ],
      fees: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.0089"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "65.40")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "446623",
          priceRange: .wideRangePreview
        )
      )
    )

    static let veryWidePreview = WidgetPosition(
      ref: "uniswap-v3:10:892",
      chainId: 10,
      protocolLabel: "Uniswap V3",
      status: .inRange,
      pair: WidgetPair(sym0: "WETH", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "1.20"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "920.5")
      ],
      fees: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.0012"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "4.20")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "990012",
          priceRange: .veryWidePreview
        )
      )
    )

    static let fullRangePreview = WidgetPosition(
      ref: "uniswap-v3:1:7788",
      chainId: 1,
      protocolLabel: "Uniswap V3",
      status: .inRange,
      pair: WidgetPair(sym0: "WETH", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "2.10"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "4.2K")
      ],
      fees: [
        WidgetToken(symbol: "WETH", iconUrl: "", formatted: "0.0450"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "88.10")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "223344",
          priceRange: .fullRangePreview
        )
      )
    )

    static let farOutAbovePreview = WidgetPosition(
      ref: "uniswap-v3:1:3344",
      chainId: 1,
      protocolLabel: "Uniswap V3",
      status: .outOfRange,
      pair: WidgetPair(sym0: "WBTC", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "WBTC", iconUrl: "", formatted: "0"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "8.4K")
      ],
      fees: [
        WidgetToken(symbol: "WBTC", iconUrl: "", formatted: "0.0002"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "12.10")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "771188",
          priceRange: .farOutAbovePreview
        )
      )
    )

    static let farOutBelowPreview = WidgetPosition(
      ref: "uniswap-v3:137:4421",
      chainId: 137,
      protocolLabel: "Uniswap V3",
      status: .outOfRange,
      pair: WidgetPair(sym0: "POL", sym1: "USDC", icon0: "", icon1: ""),
      principals: [
        WidgetToken(symbol: "POL", iconUrl: "", formatted: "10.5K"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "0")
      ],
      fees: [
        WidgetToken(symbol: "POL", iconUrl: "", formatted: "1.20"),
        WidgetToken(symbol: "USDC", iconUrl: "", formatted: "0")
      ],
      feeMode: "claimable",
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "552231",
          priceRange: .farOutBelowPreview
        )
      )
    )
  }
#endif
