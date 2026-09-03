import { Button } from "../../components/Button/Button";
import { TextInput } from "../../components/form/TextInput/TextInput";
import { Icon } from "../../components/Icon/Icon";

// 32px rather than the 22px and 26px these two used to be: a row action is the smallest target
// in the panel, and WCAG 2.5.8 puts the floor at 24. They were also two different sizes sitting
// in the same row for no reason either of them could give.
const ICON_BUTTON = "size-8 shrink-0 rounded-full border-transparent p-0 text-on-surface-variant hover:text-on-surface";

// The row lives in the markup as a <template> rather than in the controller as createElement
// calls: this is what a wallet looks like, and it belongs where the rest of the views are.
// The controller clones it and fills the four fields.
const WalletRowTemplate = () => (
  <template data-wallet-target="rowTemplate">
    <li class="flex items-center gap-3 rounded-sm p-2 hover:bg-surface-hover">
      <span aria-hidden="true" data-wallet-row="dot" class="wallet-dot size-8 shrink-0 rounded-full" />

      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* The address leads, and the nickname sits under it. A wallet always has an address
            and usually has no nickname, so putting the field first made an empty placeholder
            the largest text in the row and every wallet appeared to be called "Add a nickname".
            The nickname is an annotation on an address, and it now reads as one.
            A link, like the chip in the hero and every address in the position panel — the
            controller fills href and the full-address tooltip, because only it knows which
            chains this wallet is tracked on. */}
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

        {/* Always an input, never a name that turns into one on click: there is no second
            mode to discover. */}
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

// Grouped by what a wallet can actually do — one signer, N read-only addresses — rather than
// one flat list with a badge doing all the work of explaining itself. "Connect" and "watch"
// are two distinct actions at the bottom, not one input trying to mean both.
// The panel is titled by the Sidebar chrome rather than by a heading of its own, so the name
// and the close button share one row instead of stacking into two.
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
