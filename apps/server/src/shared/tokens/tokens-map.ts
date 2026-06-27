import { buildTokenIconUrl } from "shared/adapters/tokens-data.urls";
import { buildTokenRef, type TokenMeta, type TokenMetaInput, type TokensMap } from "shared/contracts";

const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT", "DAI", "FRAX", "TUSD", "BUSD", "USDP", "LUSD", "PYUSD", "USDE", "GUSD", "FDUSD", "USDD"]);

const displayDecimalsForSymbol = (symbol: string): number | undefined => (STABLECOIN_SYMBOLS.has(symbol.toUpperCase()) ? 2 : undefined);

export class TokensMapBuilder {
  private readonly metas = new Map<string, TokenMeta>();

  add(inputs: TokenMetaInput[]): void {
    for (const input of inputs) {
      const key = buildTokenRef(input.chainId, input.address);
      if (this.metas.has(key)) continue;
      this.metas.set(key, {
        symbol: input.symbol,
        decimals: input.decimals,
        iconUrl: buildTokenIconUrl(input.chainId, input.address),
        displayDecimals: displayDecimalsForSymbol(input.symbol),
      });
    }
  }

  build(): TokensMap {
    return Object.fromEntries(this.metas) as TokensMap;
  }
}
