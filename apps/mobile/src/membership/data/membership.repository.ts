import { config } from "core/config";
import { Repository } from "core/domain/base/repository";
import { Membership } from "membership/domain/entities/membership.entity";
import { injectable } from "tsyringe";

@injectable()
export class MembershipRepository extends Repository {
  getCurrent(): Membership {
    return Membership.byId(config.membership.current);
  }
}
