import { type PropsWithChildren, useEffect } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { focusManager, type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { container } from "core/di/container";

import { QUERY_CLIENT } from "../di/tokens";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") focusManager.setFocused(status === "active");
}

export function QueryProvider({ children }: PropsWithChildren) {
  const client = container.resolve<QueryClient>(QUERY_CLIENT);

  useEffect(() => {
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
