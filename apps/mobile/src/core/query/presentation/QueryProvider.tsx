import type { PropsWithChildren } from "react";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { container } from "core/di/container";

import { QUERY_CLIENT } from "../di/tokens";

export function QueryProvider({ children }: PropsWithChildren) {
  const client = container.resolve<QueryClient>(QUERY_CLIENT);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
