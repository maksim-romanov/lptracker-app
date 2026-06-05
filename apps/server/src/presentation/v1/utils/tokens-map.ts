import { buildTokenRef, type TokenMeta, type TokensMap } from "shared/contracts";
import { buildTokenMetaIconUrl, type MapperTokenMetaInput } from "uniswap-v3/presentation/mappers/position.mapper";

export class TokensMapBuilder {
  private readonly metas = new Map<string, TokenMeta>();

  add(inputs: MapperTokenMetaInput[]): void {
    for (const input of inputs) {
      const key = buildTokenRef(input.chainId, input.address);
      if (this.metas.has(key)) continue;
      this.metas.set(key, {
        symbol: input.symbol,
        decimals: input.decimals,
        iconUrl: buildTokenMetaIconUrl(input.chainId, input.address),
      });
    }
  }

  build(): TokensMap {
    return Object.fromEntries(this.metas) as TokensMap;
  }
}
