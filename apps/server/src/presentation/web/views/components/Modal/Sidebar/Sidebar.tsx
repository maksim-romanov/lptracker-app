import type { PropsWithChildren } from "hono/jsx";

import { Modal } from "../Modal/Modal";

type Props = PropsWithChildren<{ id: string; dataAttrs?: Record<string, string> }>;

export const Sidebar = ({ id, dataAttrs, children }: Props) => (
  <Modal id={id} class="sidebar" dataAttrs={dataAttrs} bodyClass="flex h-full w-full flex-col gap-4 p-4">
    {children}
  </Modal>
);
