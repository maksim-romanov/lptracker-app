import { Button } from "../../components/Button/Button";

// Answers "how many wallets am I looking at" without opening a panel. The entries are list
// items, not buttons: nothing filters by wallet yet, and a chip that looks pressable but only
// reopens the panel the button beside it already opens is an affordance that lies. They
// become buttons the day a filter exists behind them.
// One <ul> rather than a list plus a sibling button — `display: contents` would have kept the
// single flex row at the cost of the list's own semantics in the accessibility tree.
// Filled by wallet_controller from the client-side store: the server never learns a wallet's
// nickname, only the addresses the board is queried with.
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
