import { container } from "core/di/container";

import { queryClient } from "../query-client";
import { QUERY_CLIENT } from "./tokens";

export function register() {
  container.register(QUERY_CLIENT, { useValue: queryClient });
}
