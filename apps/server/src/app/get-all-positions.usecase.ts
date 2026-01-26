import { ok } from "neverthrow";
import { inject, injectable } from "tsyringe";

import { GetWalletPositionsUseCase } from "../features/uniswap-v3/app/get-wallet-positions.usecase";
import type { WrappedPosition } from "../presentation/schemas/response.schemas";

export interface GetAllPositionsParams {
  owner: string;
  chainIds?: number[];
  pagination?: { limit: number; offset: number };
  filters?: { closed: boolean };
}

@injectable()
export class GetAllPositionsUseCase {
  constructor(
    @inject(GetWalletPositionsUseCase)
    private readonly uniswapV3: GetWalletPositionsUseCase,
    // Add other protocol use cases here as they are implemented
  ) {}

  async execute(params: GetAllPositionsParams) {
    const results = await Promise.all([
      this.uniswapV3.execute(params),
      // Add other protocol use cases here as they are implemented
    ]);

    const allPositions: WrappedPosition[] = results.filter((result) => result.isOk()).flatMap((result) => result.value);

    return ok(allPositions);
  }
}
