import { useFollowing } from "positions/presentation/hooks/useFollowing";

import { PositionMenu } from "./PositionMenu";
import type { Props } from "./PositionCard";

export const withMenu = <T extends Props>(Component: React.ComponentType<T>) => {
  return (props: T) => {
    const { position } = props;

    const positionId = `${position.chainId}:${position.data.id}`;
    const { isFollowing, toggle } = useFollowing(positionId);

    return (
      <PositionMenu isFollowing={isFollowing} onToggleFollow={toggle}>
        <Component {...props} />
      </PositionMenu>
    );
  };
};
