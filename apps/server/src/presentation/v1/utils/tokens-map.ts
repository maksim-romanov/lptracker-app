import { buildTokenIconUrl } from "shared/adapters/tokens-data.urls";
import { buildTokenRef, type TokenMeta, type TokenMetaInput, type TokensMap } from "shared/contracts";

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
      });
    }
  }

  build(): TokensMap {
    return Object.fromEntries(this.metas) as TokensMap;
  }
}
