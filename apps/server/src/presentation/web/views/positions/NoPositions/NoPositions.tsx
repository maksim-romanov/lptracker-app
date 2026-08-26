import { Icon } from "../../components/Icon/Icon";
import { Placeholder } from "../../components/Placeholder/Placeholder";

export const NoPositions = () => (
  <Placeholder icon={<Icon name="inbox" size={28} />}>
    <p>No positions for these wallets.</p>
  </Placeholder>
);
