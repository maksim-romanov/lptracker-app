/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query PositionForFees($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n\n      tickLower\n      tickUpper\n\n      liquidity\n\n      pool {\n        feeTier\n\n        currentTick\n        sqrtPriceX96\n\n        token0 {\n          id\n          symbol\n          decimals\n        }\n\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n": typeof types.PositionForFeesDocument,
    "\n  query Position($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n\n      tickLower\n      tickUpper\n\n      liquidity\n\n      pool {\n        feeTier\n\n        currentTick\n        sqrtPriceX96\n\n        token0 {\n          id\n          symbol\n          decimals\n        }\n\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n": typeof types.PositionDocument,
    "\n  query WalletPositions(\n    $owner: Bytes!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Position_orderBy\n    $orderDirection: OrderDirection\n    $closed: Boolean!\n  ) {\n    positions(\n      where: { owner: $owner, closed: $closed }\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      id\n      liquidity\n      tickLower\n      tickUpper\n      pool {\n        id\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 {\n          id\n          symbol\n          decimals\n        }\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n": typeof types.WalletPositionsDocument,
    "\n  query WalletPositions(\n    $owner: Bytes!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Position_orderBy\n    $orderDirection: OrderDirection\n    $closed: Boolean!\n  ) {\n    positions(\n      where: { owner: $owner, closed: $closed }\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      id\n      liquidity\n      tickLower\n      tickUpper\n      pool {\n        id\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 { id symbol decimals }\n        token1 { id symbol decimals }\n      }\n    }\n  }\n": typeof types.WalletPositionsDocument,
    "\n  query Position($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n      tickLower\n      tickUpper\n      liquidity\n      pool {\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 { id symbol decimals }\n        token1 { id symbol decimals }\n      }\n    }\n  }\n": typeof types.PositionDocument,
};
const documents: Documents = {
    "\n  query PositionForFees($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n\n      tickLower\n      tickUpper\n\n      liquidity\n\n      pool {\n        feeTier\n\n        currentTick\n        sqrtPriceX96\n\n        token0 {\n          id\n          symbol\n          decimals\n        }\n\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n": types.PositionForFeesDocument,
    "\n  query Position($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n\n      tickLower\n      tickUpper\n\n      liquidity\n\n      pool {\n        feeTier\n\n        currentTick\n        sqrtPriceX96\n\n        token0 {\n          id\n          symbol\n          decimals\n        }\n\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n": types.PositionDocument,
    "\n  query WalletPositions(\n    $owner: Bytes!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Position_orderBy\n    $orderDirection: OrderDirection\n    $closed: Boolean!\n  ) {\n    positions(\n      where: { owner: $owner, closed: $closed }\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      id\n      liquidity\n      tickLower\n      tickUpper\n      pool {\n        id\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 {\n          id\n          symbol\n          decimals\n        }\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n": types.WalletPositionsDocument,
    "\n  query WalletPositions(\n    $owner: Bytes!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Position_orderBy\n    $orderDirection: OrderDirection\n    $closed: Boolean!\n  ) {\n    positions(\n      where: { owner: $owner, closed: $closed }\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      id\n      liquidity\n      tickLower\n      tickUpper\n      pool {\n        id\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 { id symbol decimals }\n        token1 { id symbol decimals }\n      }\n    }\n  }\n": types.WalletPositionsDocument,
    "\n  query Position($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n      tickLower\n      tickUpper\n      liquidity\n      pool {\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 { id symbol decimals }\n        token1 { id symbol decimals }\n      }\n    }\n  }\n": types.PositionDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PositionForFees($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n\n      tickLower\n      tickUpper\n\n      liquidity\n\n      pool {\n        feeTier\n\n        currentTick\n        sqrtPriceX96\n\n        token0 {\n          id\n          symbol\n          decimals\n        }\n\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').PositionForFeesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Position($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n\n      tickLower\n      tickUpper\n\n      liquidity\n\n      pool {\n        feeTier\n\n        currentTick\n        sqrtPriceX96\n\n        token0 {\n          id\n          symbol\n          decimals\n        }\n\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').PositionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WalletPositions(\n    $owner: Bytes!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Position_orderBy\n    $orderDirection: OrderDirection\n    $closed: Boolean!\n  ) {\n    positions(\n      where: { owner: $owner, closed: $closed }\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      id\n      liquidity\n      tickLower\n      tickUpper\n      pool {\n        id\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 {\n          id\n          symbol\n          decimals\n        }\n        token1 {\n          id\n          symbol\n          decimals\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').WalletPositionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query WalletPositions(\n    $owner: Bytes!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Position_orderBy\n    $orderDirection: OrderDirection\n    $closed: Boolean!\n  ) {\n    positions(\n      where: { owner: $owner, closed: $closed }\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n    ) {\n      id\n      liquidity\n      tickLower\n      tickUpper\n      pool {\n        id\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 { id symbol decimals }\n        token1 { id symbol decimals }\n      }\n    }\n  }\n"): typeof import('./graphql').WalletPositionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Position($tokenId: ID!) {\n    position(id: $tokenId) {\n      id\n      tickLower\n      tickUpper\n      liquidity\n      pool {\n        feeTier\n        currentTick\n        sqrtPriceX96\n        token0 { id symbol decimals }\n        token1 { id symbol decimals }\n      }\n    }\n  }\n"): typeof import('./graphql').PositionDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
