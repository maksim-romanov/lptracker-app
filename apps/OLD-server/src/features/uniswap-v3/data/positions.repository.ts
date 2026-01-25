import { err, ok, type Result } from "neverthrow";
import { injectable } from "tsyringe";

import { graphql } from "../../../gql";
import type {
  OrderDirection,
  Position_OrderBy,
  PositionQuery,
  PositionQueryVariables,
  WalletPositionsQuery,
  WalletPositionsQueryVariables,
} from "../../../gql/graphql";
import { Repository } from "../../../shared/base/repository";
import { PositionError, PositionErrorCode } from "../domain/errors/position.error";
import { GraphQLPositionDto } from "./dto/graphql-position.dto";

const getPositionByIdQuery = graphql(`
  query Position($tokenId: ID!) {
    position(id: $tokenId) {
      id
      tickLower
      tickUpper
      liquidity
      pool {
        feeTier
        currentTick
        sqrtPriceX96
        token0 { id symbol decimals }
        token1 { id symbol decimals }
      }
    }
  }
`);

@injectable()
export class PositionsRepository extends Repository {
  async getWalletPositions(
    owner: string,
    pagination: { first: number; skip: number },
    filters: { closed: boolean; orderBy: Position_OrderBy; orderDirection: OrderDirection },
  ): Promise<Result<GraphQLPositionDto[], PositionError>> {
    try {
      const variables: WalletPositionsQueryVariables = {
        owner,
        first: pagination.first,
        skip: pagination.skip,
        orderBy: filters.orderBy,
        orderDirection: filters.orderDirection,
        closed: filters.closed,
      };

      const result = await this.gqlClient.request<WalletPositionsQuery, WalletPositionsQueryVariables>(getWalletPositionsQuery, variables);

      if (!result.positions) {
        return ok([]);
      }

      const dtos = result.positions.map((p) => GraphQLPositionDto.fromGraphQL(p));
      return ok(dtos);
    } catch (error) {
      return err(new PositionError(PositionErrorCode.GRAPHQL_ERROR, undefined, { error }));
    }
  }

  async getPositionById(tokenId: string): Promise<Result<GraphQLPositionDto | null, PositionError>> {
    try {
      const result = await this.gqlClient.request<PositionQuery, PositionQueryVariables>(getPositionByIdQuery, { tokenId });

      if (!result.position) {
        return ok(null);
      }

      const dto = GraphQLPositionDto.fromGraphQL(result.position);
      return ok(dto);
    } catch (error) {
      return err(new PositionError(PositionErrorCode.GRAPHQL_ERROR, undefined, { error }));
    }
  }
}
