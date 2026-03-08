import type React from "react";

import { observer } from "mobx-react-lite";
import { useFollowing } from "positions/presentation/hooks/useFollowing";

import type { Props } from "./PositionCard";

export const withFollowing = <T extends Props>(Component: React.ComponentType<T>) => {
  return observer((props: Omit<T, "isFollowing"> & { isFollowing?: boolean }) => {
    const { position } = props;

    const positionId = `${position.chainId}:${position.data.id}`;
    const { isFollowing } = useFollowing(positionId);

    return <Component {...(props as T)} isFollowing={props.isFollowing ?? isFollowing} />;
  });
};
