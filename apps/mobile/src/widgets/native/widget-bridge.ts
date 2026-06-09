type WidgetBridgeModule = {
  writeSnapshot(json: string): Promise<void>;
  reload(kind: string | null): Promise<void>;
};

const stub: WidgetBridgeModule = {
  async writeSnapshot() {},
  async reload() {},
};

export const writeSnapshot = (json: string) => stub.writeSnapshot(json);
export const reload = (kind: string | null) => stub.reload(kind);
