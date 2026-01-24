import { container } from "../../di/container";
import { GRAPHQL_CLIENT } from "../../di/tokens";
import type { GraphQLClient } from "graphql-request";

export abstract class Repository {
	protected get gqlClient(): GraphQLClient {
		return container.resolve(GRAPHQL_CLIENT);
	}
}
