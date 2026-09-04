import { POSITIONS_LAYOUTS, type TPositionsLayout } from "../../positions-layout";
import { CollectionStore } from "./collection.store";

const isLayout = (value: unknown): value is TPositionsLayout => POSITIONS_LAYOUTS.includes(value as TPositionsLayout);

// `override: null` means "follow the viewport" — a real state, not an absent one, so an
// explicit choice isn't silently overridden by rotating a phone or resizing a window.
class LayoutPrefsStore extends CollectionStore {
  private override: TPositionsLayout | null = null;

  constructor() {
    super("positionsLayout");
  }

  protected load(raw: string | null): void {
    const parsed = this.parse<unknown>(raw, null);
    this.override = isLayout(parsed) ? parsed : null;
  }

  protected dump(): string {
    return JSON.stringify(this.override);
  }

  get(): TPositionsLayout | null {
    return this.override;
  }

  set(layout: TPositionsLayout): void {
    this.override = layout;
    this.persist();
  }
}

export const layoutPrefs = new LayoutPrefsStore();
