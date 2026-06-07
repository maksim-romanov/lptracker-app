import { container } from "core/di/container";

import { MembershipRepository } from "../data/membership.repository";
import { MEMBERSHIP_REPOSITORY } from "./tokens";

export function register() {
  container.register(MEMBERSHIP_REPOSITORY, MembershipRepository);
}
