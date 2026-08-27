import { Button } from "../../components/Button/Button";
import { TextInput } from "../../components/form/TextInput/TextInput";
import { Icon } from "../../components/Icon/Icon";

export const WalletConnect = () => (
  <>
    <h2>Connect a wallet</h2>

    <Button data-action="wallet#connectWallet" class="flex items-center gap-2 p-3">
      <Icon name="wallet" size={18} />
      Connect Wallet
    </Button>

    <div class="flex items-center gap-2 text-sm">
      <span class="h-px flex-1 bg-outline" />
      or
      <span class="h-px flex-1 bg-outline" />
    </div>

    <form data-action="submit->wallet#addManual" class="flex gap-2">
      <TextInput
        name="address"
        data-wallet-target="addressInput"
        placeholder="0x… wallet address"
        autocomplete="off"
        spellcheck={false}
        required
        pattern="^0x[a-fA-F0-9]{40}$"
        aria-label="Wallet address"
        class="min-w-0 flex-1"
      />
      <Button type="submit" aria-label="Add address" class="p-2">
        <Icon name="plus" size={20} />
      </Button>
    </form>
  </>
);
