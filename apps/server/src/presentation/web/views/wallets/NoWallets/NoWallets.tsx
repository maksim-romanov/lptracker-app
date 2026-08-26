import { Icon } from "../../components/Icon/Icon";
import { Placeholder } from "../../components/Placeholder/Placeholder";

export const NoWallets = () => (
  <Placeholder icon={<Icon name="wallet" size={28} />}>
    <p>Connect a wallet to see your Uniswap V3 positions.</p>
  </Placeholder>
);
