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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "987654",
          range: WidgetTickRange(
            tickLower: 354000,
            tickUpper: 355000,
            currentTick: 354550,
            decimalsDelta: -12
          )
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "112233",
          range: WidgetTickRange(tickLower: 156400, tickUpper: 157400, currentTick: 158250, decimalsDelta: -2)
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "555444",
          range: WidgetTickRange(
            tickLower: 268900,
            tickUpper: 269900,
            currentTick: 268940,
            decimalsDelta: -12
          )
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "10001",
          range: nil
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.01%",
          nftTokenId: "778812",
          range: WidgetTickRange(tickLower: -50, tickUpper: 50, currentTick: 10, decimalsDelta: 0)
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "446623",
          range: WidgetTickRange(
            tickLower: 349500,
            tickUpper: 359500,
            currentTick: 355700,
            decimalsDelta: -12
          )
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "990012",
          range: WidgetTickRange(
            tickLower: 334500,
            tickUpper: 374500,
            currentTick: 351000,
            decimalsDelta: -12
          )
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.05%",
          nftTokenId: "771188",
          range: WidgetTickRange(tickLower: 156400, tickUpper: 157400, currentTick: 162400, decimalsDelta: -2)
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
      widgetExtension: .uniswapV3(
        UniswapV3Payload(
          feeTierLabel: "0.30%",
          nftTokenId: "552231",
          range: WidgetTickRange(
            tickLower: 268900,
            tickUpper: 269900,
            currentTick: 263900,
            decimalsDelta: -12
          )
        )
      )
    )
  }
#endif
