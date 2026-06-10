import { requireOptionalNativeModule } from "expo";

type WidgetBridgeNative = {
  writeSnapshot(json: string): Promise<void>;
  reload(kind: string | null): Promise<void>;
};

const native = requireOptionalNativeModule<WidgetBridgeNative>("WidgetBridge");

export function writeSnapshot(json: string): Promise<void> {
  return native?.writeSnapshot(json) ?? Promise.resolve();
}

export function reload(kind: string | null): Promise<void> {
  return native?.reload(kind) ?? Promise.resolve();
}
