import { cn, type TIntrinsic } from "../../../utils/cn";

type Props = TIntrinsic<"input">;

export const TextInput = ({ class: className, ...rest }: Props) => (
  <input class={cn("rounded-sm border border-outline px-3 py-2", className)} {...rest} />
);
