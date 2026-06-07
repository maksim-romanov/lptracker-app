import { container } from "tsyringe";

import { StablesService } from "../app/stables.service";
import { StablesTokensDataClient } from "../data/stables-tokens-data.client";
import { STABLES_SERVICE } from "./tokens";

export function register() {
  container.registerSingleton(StablesTokensDataClient);
  container.registerSingleton(StablesService);
  container.register(STABLES_SERVICE, { useToken: StablesService });
}
