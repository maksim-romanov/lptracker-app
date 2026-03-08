import { container } from "core/di/container";

import { LinkingService } from "../data/linking.service";
import { LINKING_SERVICE } from "./tokens";

export function register() {
  container.registerSingleton(LINKING_SERVICE, LinkingService);
}
