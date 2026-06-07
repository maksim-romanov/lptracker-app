import { Store } from "core/domain/base/store";
import type { MembershipRepository } from "membership/data/membership.repository";
import { MEMBERSHIP_REPOSITORY } from "membership/di/tokens";
import { EMembership, Membership } from "membership/domain/entities/membership.entity";
import { action, makeObservable, observable } from "mobx";
import { inject, singleton } from "tsyringe";

@singleton()
export class MembershipStore extends Store {
  @observable current: Membership = Membership.byId(EMembership.FREE);

  constructor(@inject(MEMBERSHIP_REPOSITORY) private readonly repo: MembershipRepository) {
    super();
    makeObservable(this);
    this.hydrate();
  }

  @action
  hydrate(): void {
    this.current = this.repo.getCurrent();
  }

  canAddWallet(currentCount: number): boolean {
    return this.current.canAddWallet(currentCount);
  }
}
