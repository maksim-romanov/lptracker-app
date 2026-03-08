import React from "react";

import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { useFollowing } from "positions/presentation/hooks/useFollowing";

import { OpenOnUniswapUseCase } from "../../application/usecase/open-on-uniswap.usecase";
import type { Props } from "./PositionCard";
import { PositionMenu } from "./PositionMenu";

export const withMenu = <T extends Props>(Component: React.ComponentType<T>) => {
  const openOnUniswap = container.resolve(OpenOnUniswapUseCase);

  return observer((props: T) => {
    const { position } = props;

    const store = useFollowing();

    const handleOpenUniswap = React.useCallback(
      () => openOnUniswap.execute({ chainId: position.chainId, positionId: position.data.id }),
      [position.chainId, position.data.id],
    );

    const handleToggleFollow = React.useCallback(() => store.toggle(position), [store, position]);

    return (
      <PositionMenu isFollowing={store.isFollowing(position)} onToggleFollow={handleToggleFollow} onOpenUniswap={handleOpenUniswap}>
        <Component {...props} />
      </PositionMenu>
    );
  });
};
