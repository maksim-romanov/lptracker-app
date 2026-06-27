import { CollectionStore } from "./collection.store";

// Client-side per-position preferences, keyed by position ref. Add new flags
// (e.g. `following`) as fields here — no new store needed.
interface IPositionPrefs {
  inverted: boolean;
}

const EMPTY: IPositionPrefs = { inverted: false };

class PositionPrefsStore extends CollectionStore {
  private prefs = new Map<string, IPositionPrefs>();

  constructor() {
    super("positionPrefs");
  }

  protected load(raw: string | null): void {
    this.prefs = new Map(Object.entries(this.parse<Record<string, IPositionPrefs>>(raw, {})));
  }

  protected dump(): string {
    return JSON.stringify(Object.fromEntries(this.prefs));
  }

  private of(ref: string): IPositionPrefs {
    return this.prefs.get(ref) ?? EMPTY;
  }

  private update(ref: string, patch: Partial<IPositionPrefs>): void {
    const next = { ...this.of(ref), ...patch };
    // Drop the ref entirely once no flag is set, so storage stays lean.
    if (Object.values(next).some(Boolean)) this.prefs.set(ref, next);
    else this.prefs.delete(ref);
    this.persist();
  }

  // Flip inverted and report the new state ("1" inverted / "0" normal).
  toggleInverted(ref: string): boolean {
    const inverted = !this.of(ref).inverted;
    this.update(ref, { inverted });
    return inverted;
  }

  serializeInverted(): string {
    return [...this.prefs]
      .filter(([, prefs]) => prefs.inverted)
      .map(([ref]) => ref)
      .join(",");
  }
}

export const positionPrefs = new PositionPrefsStore();
