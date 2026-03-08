import React from "react";

import { container } from "core/di/container";
import { useFollowing } from "positions/presentation/hooks/useFollowing";

import { OpenOnUniswapUseCase } from "../../application/usecase/open-on-uniswap.usecase";
import type { Props } from "./PositionCard";
import { PositionMenu } from "./PositionMenu";

export const withMenu = <T extends Props>(Component: React.ComponentType<T>) => {
  const openOnUniswap = container.resolve(OpenOnUniswapUseCase);

  return (props: T) => {
    const { position } = props;

    const positionId = `${position.chainId}:${position.data.id}`;
    const { isFollowing, toggle } = useFollowing(positionId);

    const handleOpenUniswap = React.useCallback(
      () => openOnUniswap.execute({ chainId: position.chainId, positionId: position.data.id }),
      [position.chainId, position.data.id],
    );

    return (
      <PositionMenu isFollowing={isFollowing} onToggleFollow={toggle} onOpenUniswap={handleOpenUniswap}>
        <Component {...props} />
      </PositionMenu>
    );
  };
};
