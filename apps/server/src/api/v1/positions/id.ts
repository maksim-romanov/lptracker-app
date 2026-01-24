import { graphql } from "gql";
import type { PositionQuery, PositionQueryVariables } from "gql/graphql";
import { gqlClient } from "lib/graphql";

const getPositionQuery = graphql(`
  query Position($tokenId: ID!) {
    position(id: $tokenId) {
      id

      tickLower
      tickUpper

      pool {
        currentTick

        token0 {
          id
          symbol
          decimals
        }

        token1 {
          id
          symbol
          decimals
        }
      }
    }
  }
`);

export async function getPosition(tokenId: string): Promise<Response> {
  const result = await gqlClient.request<PositionQuery, PositionQueryVariables>(getPositionQuery, { tokenId });

  if (!result.position) {
    return Response.json({ error: "Position not found" }, { status: 404 });
  }

  return Response.json(result.position);
}
