import { Button } from "../../components/Button/Button";
import { Icon } from "../../components/Icon/Icon";
import { Placeholder } from "../../components/Placeholder/Placeholder";

export const NoWallets = () => (
  <Placeholder icon={<Icon name="wallet" size={28} />} title="Track your first wallet">
    <p class="text-body-small text-on-surface-variant">Paste an address and Depthly starts tracking. Nothing is signed.</p>
    <Button
      data-action="wallet#openSidebar"
      aria-haspopup="dialog"
      class="rounded-full border-transparent bg-primary px-5 py-2 text-button text-on-primary"
    >
      Paste address
    </Button>
  </Placeholder>
);
