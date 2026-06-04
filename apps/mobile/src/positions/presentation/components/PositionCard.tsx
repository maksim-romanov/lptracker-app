import {
  type TPositionVM as TUniswapV3PositionVM,
  PositionCard as UniswapV3PositionCard,
} from "features/uniswap-v3/presentation/components/PositionCard";

export type TPositionVM = TUniswapV3PositionVM;

type TProps = {
  position: TPositionVM;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

export const PositionCard = (props: TProps) => {
  switch (props.position.protocol) {
    case "uniswap-v3":
      return <UniswapV3PositionCard {...props} position={props.position} />;
  }
};
