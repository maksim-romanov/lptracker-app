import type { ChainId } from "core/config/chains";
import { UseCase } from "core/domain/base";
import { OpenExternalLinkUseCase } from "core/linking";
import { inject, injectable } from "tsyringe";

const CHAIN_SLUGS: Record<ChainId, string> = {
  1: "ethereum",
  8453: "base",
  42161: "arbitrum",
};

type TInput = {
  chainId: ChainId;
  positionId: string;
};

@injectable()
export class OpenOnUniswapUseCase extends UseCase<void, TInput> {
  constructor(@inject(OpenExternalLinkUseCase) private readonly openExternalLink: OpenExternalLinkUseCase) {
    super();
  }

  async execute(input: TInput): Promise<void> {
    const chainSlug = CHAIN_SLUGS[input.chainId];

    try {
      if (!chainSlug) {
        this.alert.error("Unsupported chain");
        return;
      }

      const url = `https://app.uniswap.org/positions/v3/${chainSlug}/${input.positionId}`;

      await this.openExternalLink.execute({ url });
    } catch {
      this.alert.error("Failed to open position on Uniswap");
    }
  }
}
