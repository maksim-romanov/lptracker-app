import { Store } from "core/domain/base/store";
import { action, makeObservable, observable } from "mobx";
import type { PositionViewPrefsRepository } from "positions/data/position-view-prefs.repository";
import { POSITION_VIEW_PREFS_REPOSITORY } from "positions/di/tokens";
import { inject, singleton } from "tsyringe";

@singleton()
export class PositionViewPrefsStore extends Store {
  readonly invertedRefs = observable.set<string>();

  constructor(@inject(POSITION_VIEW_PREFS_REPOSITORY) private readonly repo: PositionViewPrefsRepository) {
    super();
    makeObservable(this);
  }

  @action
  hydrate(): void {
    this.invertedRefs.replace(this.repo.getInvertedRefs());
  }

  isInverted(ref: string): boolean {
    return this.invertedRefs.has(ref);
  }

  @action
  toggleInverted(ref: string): boolean {
    const next = !this.invertedRefs.has(ref);
    if (next) this.invertedRefs.add(ref);
    else this.invertedRefs.delete(ref);
    this.repo.setInverted(ref, next);
    return next;
  }

  @action
  pruneInverted(validRefs: ReadonlySet<string>): void {
    if (this.invertedRefs.size === 0) return;
    const kept = this.repo.pruneInverted(validRefs);
    this.invertedRefs.replace(kept);
  }
}
