import { useMutation } from "@tanstack/react-query";
import { container } from "core/di/container";
import { ToggleFollowingUseCase } from "positions/application/usecases/toggle-following.usecase";

export function useFollow(ref: string) {
  return useMutation({
    mutationFn: (next: boolean) => container.resolve(ToggleFollowingUseCase).execute({ ref, next }),
  });
}
