import React from "react";

import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { WalletsStore } from "wallets/presentation/wallets.store";

import { OpenOnUniswapUseCase } from "../../application/usecase/open-on-uniswap.usecase";
import type { Props } from "./PositionCard";
import { PositionMenu } from "./PositionMenu";

export const withMenu = <T extends Props>(Component: React.ComponentType<T>) => {
  const openOnUniswap = container.resolve(OpenOnUniswapUseCase);

  return observer((props: T) => {
    const { position } = props;
    const walletsStore = container.resolve(WalletsStore);
    const followingStore = container.resolve(FollowingStore);
    const walletId = walletsStore.activeWalletId;

    const handleOpenUniswap = React.useCallback(
      () => openOnUniswap.execute({ chainId: position.chainId, positionId: position.data.id }),
      [position.chainId, position.data.id],
    );

    const handleToggleFollow = React.useCallback(
      () => walletId && followingStore.toggle(walletId, position),
      [followingStore, walletId, position],
    );

    return (
      <PositionMenu isFollowing={walletId ? followingStore.isFollowing(walletId, position) : false} onToggleFollow={handleToggleFollow} onOpenUniswap={handleOpenUniswap}>
        <Component {...props} />
      </PositionMenu>
    );
  });
};
