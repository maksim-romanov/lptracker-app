import { err, ok } from "neverthrow";
import { injectable } from "tsyringe";

import { GetPositionUseCase as UniswapV3GetPositionUseCase } from "../features/uniswap-v3/app/get-position.usecase";
import { getContainer } from "../features/uniswap-v3/di/containers";
import { UNISWAP_V3_PROTOCOL } from "../features/uniswap-v3/domain/constants/protocol";
import type { SupportedChainId } from "../features/uniswap-v3/presentation/schemas/request.schemas";

@injectable()
export class GetPositionUseCase {
  async execute(chainId: SupportedChainId, id: string) {
    const result = await getContainer(chainId).resolve(UniswapV3GetPositionUseCase).execute(id);

    if (result.isErr()) return err(result.error);

    return ok({ protocol: UNISWAP_V3_PROTOCOL, chainId, data: result.value });
  }
}
