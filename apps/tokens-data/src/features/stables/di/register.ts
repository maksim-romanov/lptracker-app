import { container } from "tsyringe";

import { StablesCache } from "../data/stables.cache";
import { STABLES_SERVICE } from "./tokens";

export function register() {
  container.register(STABLES_SERVICE, { useToken: StablesCache });
}
