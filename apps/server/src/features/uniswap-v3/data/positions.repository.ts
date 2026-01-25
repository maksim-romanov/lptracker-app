import { ok } from "neverthrow";
import { injectable } from "tsyringe";

import { BaseRepository } from "./base/base.repository";
import { GraphQLPositionDto } from "./dto/graphql-position.dto";
import { graphql } from "./gql";

@injectable()
export class PositionsRepository extends BaseRepository {
  async getWalletPositions(
    owner: string,
    pagination: { first: number; skip: number } = { first: 10, skip: 0 },
    filters: { closed: boolean } = { closed: false },
  ) {
    const result = await this.gql.request(getWalletPositionsQuery, { owner, ...pagination, ...filters });
    const positions = result.positions.map((p) => GraphQLPositionDto.fromGraphQL(p));
    return ok(positions);
  }
}

const getWalletPositionsQuery = graphql(`
  query WalletPositions(
    $owner: Bytes!
    $first: Int!
    $skip: Int!
    $orderBy: Position_orderBy
    $orderDirection: OrderDirection
    $closed: Boolean!
  ) {
    positions(
      where: { owner: $owner, closed: $closed }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      liquidity
      tickLower
      tickUpper
      pool {
        id
        feeTier
        currentTick
        sqrtPriceX96
        token0 { id symbol decimals }
        token1 { id symbol decimals }
      }
    }
  }
`);
