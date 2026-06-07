import { StablesService } from "features/stables/app/stables.service";
import { buildTokenIconUrl } from "shared/adapters/tokens-data.urls";
import { buildTokenRef, type TokenMeta, type TokenMetaInput, type TokensMap } from "shared/contracts";
import { inject, injectable } from "tsyringe";

@injectable()
export class TokensMapBuilder {
  private readonly metas = new Map<string, TokenMeta>();

  constructor(@inject(StablesService) private readonly stables: StablesService) {}

  add(inputs: TokenMetaInput[]): void {
    for (const input of inputs) {
      const key = buildTokenRef(input.chainId, input.address);
      if (this.metas.has(key)) continue;
      this.metas.set(key, {
        symbol: input.symbol,
        decimals: input.decimals,
        iconUrl: buildTokenIconUrl(input.chainId, input.address),
        displayDecimals: this.stables.isStable(input.chainId, input.address) ? 2 : undefined,
      });
    }
  }

  build(): TokensMap {
    return Object.fromEntries(this.metas) as TokensMap;
  }
}
