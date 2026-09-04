import { Button } from "../../components/Button/Button";
import { TextInput } from "../../components/form/TextInput/TextInput";
import { Icon } from "../../components/Icon/Icon";

const ICON_BUTTON = "size-8 shrink-0 rounded-full border-transparent p-0 text-on-surface-variant hover:text-on-surface";

const WalletRowTemplate = () => (
  <template data-wallet-target="rowTemplate">
    <li class="flex items-center gap-3 rounded-sm p-2 hover:bg-surface-hover">
      <span aria-hidden="true" data-wallet-row="dot" class="wallet-dot size-8 shrink-0 rounded-full" />

      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="flex items-center gap-1 px-1">
          {/* biome-ignore lint/a11y/useValidAnchor: template slot — wallet_controller sets href per row */}
          {/* biome-ignore lint/a11y/useAnchorContent: template slot — wallet_controller sets the address text per row */}
          <a
            data-wallet-row="address"
            target="_blank"
            rel="noopener noreferrer"
            class="min-w-0 truncate font-mono text-figure hover:text-primary-text"
          />
          <Button data-wallet-row="copy" data-action="wallet#copyAddress" class={ICON_BUTTON}>
            <Icon name="copy" size={16} />
          </Button>
        </span>

        <input
          type="text"
          data-wallet-row="label"
          data-action="change->wallet#rename"
          autocomplete="off"
          spellcheck={false}
          class="min-w-0 rounded-xs border border-transparent bg-transparent px-1 py-0.5 text-body-small text-on-surface-variant placeholder:text-on-surface-muted hover:border-outline-variant focus:border-outline"
        />
      </span>

      <Button
        data-wallet-row="remove"
        data-action="wallet#removeWallet"
        class={`${ICON_BUTTON} hover:bg-error-container hover:text-on-error-container`}
      >
        <Icon name="trash" size={16} />
      </Button>
    </li>
  </template>
);

const Group = ({ name, target }: { name: string; target: string }) => (
  <section data-wallet-target={`${target}Group`} hidden class="flex flex-col gap-1">
    <h3 class="px-1 text-body-small text-on-surface-variant">{name}</h3>
    <ul data-wallet-target={`${target}List`} class="flex flex-col" />
  </section>
);

export const WalletConnect = () => (
  <>
    <WalletRowTemplate />

    <div class="flex flex-col gap-5">
      <Group name="Connected" target="connected" />
      <Group name="Watching" target="watched" />
      <p data-wallet-target="empty" class="px-1 text-body text-on-surface-variant">
        No wallets yet. Connect one to sign, or paste an address to watch it.
      </p>
    </div>

    <div class="mt-auto flex flex-col gap-4 border-outline-variant border-t pt-4">
      <Button
        data-action="wallet#connectWallet"
        class="flex items-center justify-center gap-2 rounded-full border-transparent bg-primary px-4 py-2.5 text-button text-on-primary"
      >
        <Icon name="wallet" size={16} />
        Connect a wallet
      </Button>

      <form data-action="submit->wallet#addManual" class="flex flex-col gap-2">
        <label for="watch-address" class="text-body-small text-on-surface-variant">
          Or watch an address — nothing is signed
        </label>
        <span class="flex gap-2">
          <TextInput
            id="watch-address"
            name="address"
            data-wallet-target="addressInput"
            placeholder="0x…"
            autocomplete="off"
            spellcheck={false}
            required
            pattern="^0x[a-fA-F0-9]{40}$"
            class="min-w-0 flex-1 rounded-full px-4"
          />
          <Button type="submit" class="rounded-full px-4 text-button">
            Watch
          </Button>
        </span>
      </form>
    </div>
  </>
);
