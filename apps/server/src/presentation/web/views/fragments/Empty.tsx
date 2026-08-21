import { IconInbox, IconWallet } from "../Icons";

export const Empty = ({ reason }: { reason: "no-wallets" | "no-positions" }) => (
  <output data-reason={reason} class="flex flex-col items-center gap-3 rounded-md border border-outline p-8 text-center">
    {reason === "no-wallets" ? <IconWallet size={28} /> : <IconInbox size={28} />}
    <p>{reason === "no-wallets" ? "Add a wallet to see its Uniswap V3 positions." : "No positions for these wallets."}</p>
  </output>
);
