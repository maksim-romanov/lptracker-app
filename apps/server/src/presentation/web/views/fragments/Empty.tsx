import { IconInbox, IconWallet } from "../Icons";

export const Empty = ({ reason }: { reason: "no-wallets" | "no-positions" }) => (
  <output class="board-empty" data-reason={reason}>
    {reason === "no-wallets" ? <IconWallet size={28} class="board-empty__icon" /> : <IconInbox size={28} class="board-empty__icon" />}
    <p>{reason === "no-wallets" ? "Add a wallet to see its Uniswap V3 positions." : "No positions for these wallets."}</p>
  </output>
);
