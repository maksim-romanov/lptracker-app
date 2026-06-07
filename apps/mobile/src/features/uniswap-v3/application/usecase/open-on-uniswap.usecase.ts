import { NETWORKS } from "@mars-909/catalog";
import { UseCase } from "core/domain/base";
import { OpenExternalLinkUseCase } from "core/linking";
import { inject, injectable } from "tsyringe";

export interface IOpenOnUniswapInput {
  readonly chainId: number;
  readonly nftTokenId: string;
}

const slugByChainId = new Map<number, string>(NETWORKS.map((n) => [n.chainId, n.slug]));

@injectable()
export class OpenOnUniswapUseCase extends UseCase<void, IOpenOnUniswapInput> {
  constructor(@inject(OpenExternalLinkUseCase) private readonly openExternalLink: OpenExternalLinkUseCase) {
    super();
  }

  async execute({ chainId, nftTokenId }: IOpenOnUniswapInput): Promise<void> {
    const slug = slugByChainId.get(chainId);

    try {
      if (!slug) {
        this.alert.error("Unsupported chain");
        return;
      }

      const url = `https://app.uniswap.org/positions/v3/${slug}/${nftTokenId}`;

      await this.openExternalLink.execute({ url });
    } catch {
      this.alert.error("Failed to open position on Uniswap");
    }
  }
}
