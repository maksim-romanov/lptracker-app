import { GraphQLClient } from "graphql-request";

import { GRAPH_API_URL } from "../constants";

export const gqlClient = new GraphQLClient(GRAPH_API_URL, {
	headers: { Authorization: `Bearer ${Bun.env.GRAPH_API_KEY}` },
});
