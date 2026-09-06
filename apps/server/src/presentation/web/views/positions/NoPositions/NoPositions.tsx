import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import { Placeholder } from "../../components/Placeholder/Placeholder";

export const NoPositions = () => (
  <Placeholder icon={<Icon name="inbox" size={28} />} title="No positions found">
    <p class="text-body-small text-on-surface-variant">The wallets you're tracking don't hold any open positions.</p>
    <Button
      data-action="wallet#openSidebar"
      aria-haspopup="dialog"
      class="rounded-full border-transparent bg-primary px-5 py-2 text-button text-on-primary"
    >
      Track another wallet
    </Button>
  </Placeholder>
);
