import { requireNativeModule } from "expo";

type WidgetBridgeNative = {
  writeSnapshot(json: string): Promise<void>;
  reload(kind: string | null): Promise<void>;
};

const native = requireNativeModule<WidgetBridgeNative>("WidgetBridge");

export function writeSnapshot(json: string): Promise<void> {
  return native.writeSnapshot(json);
}

export function reload(kind: string | null): Promise<void> {
  return native.reload(kind);
}
