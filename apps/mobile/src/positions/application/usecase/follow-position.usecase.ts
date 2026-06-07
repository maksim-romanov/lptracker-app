import { UseCase } from "core/domain/base/usecase";
import type { FollowingRepository } from "positions/data/following.repository";
import { FOLLOWING_REPOSITORY } from "positions/di/tokens";
import { inject, injectable } from "tsyringe";

@injectable()
export class FollowPositionUseCase extends UseCase<void, string> {
  constructor(@inject(FOLLOWING_REPOSITORY) private readonly repo: FollowingRepository) {
    super();
  }

  async execute(ref: string): Promise<void> {
    this.repo.follow(ref);
  }
}
