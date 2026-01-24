import { container } from "./container";
import { GRAPHQL_CLIENT } from "./tokens";
import { gqlClient } from "../lib/graphql";

export function registerGlobalDependencies() {
	container.register(GRAPHQL_CLIENT, { useValue: gqlClient });
}
