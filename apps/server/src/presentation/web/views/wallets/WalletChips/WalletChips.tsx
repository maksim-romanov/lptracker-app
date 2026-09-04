import { Button } from "../../components/Button/Button";

export const WalletChips = () => (
  <ul data-wallet-target="chips" aria-label="Tracked wallets" class="flex flex-wrap items-center gap-2">
    <li data-wallet-target="chipsEnd">
      <Button
        data-action="wallet#openSidebar"
        aria-haspopup="dialog"
        class="rounded-full border-dashed px-3 py-1 text-label text-on-surface-variant hover:text-on-surface"
      >
        + Add wallet
      </Button>
    </li>
  </ul>
);
