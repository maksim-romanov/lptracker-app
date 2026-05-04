import type React from "react";

import { container } from "core/di/container";
import { observer } from "mobx-react-lite";
import { FollowingStore } from "positions/presentation/stores/following.store";
import { WalletsStore } from "wallets/presentation/wallets.store";

import type { Props } from "./PositionCard";

export const withFollowing = <T extends Props>(Component: React.ComponentType<T>) => {
  return observer((props: Omit<T, "isFollowing"> & { isFollowing?: boolean }) => {
    const { position } = props;
    const walletId = container.resolve(WalletsStore).activeWalletId;
    const following = container.resolve(FollowingStore);

    const isFollowing = walletId ? following.isFollowing(walletId, position) : false;
    return <Component {...(props as T)} isFollowing={props.isFollowing ?? isFollowing} />;
  });
};
