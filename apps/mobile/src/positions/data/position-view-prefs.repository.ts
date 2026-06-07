import { Repository } from "core/domain/base/repository";
import { createMMKV } from "react-native-mmkv";
import { injectable } from "tsyringe";

export const POSITION_VIEW_PREFS_INVERTED_KEY = "positionViewPrefs:inverted:v1";

@injectable()
export class PositionViewPrefsRepository extends Repository {
  private readonly storage = createMMKV({ id: "position-view-prefs" });

  getInvertedRefs(): string[] {
    const raw = this.storage.getString(POSITION_VIEW_PREFS_INVERTED_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      this.logger.warn("PositionViewPrefsRepository: malformed payload, resetting");
      this.storage.remove(POSITION_VIEW_PREFS_INVERTED_KEY);
      return [];
    }
  }

  setInverted(ref: string, inverted: boolean): void {
    const refs = new Set(this.getInvertedRefs());
    if (inverted) refs.add(ref);
    else refs.delete(ref);
    this.storage.set(POSITION_VIEW_PREFS_INVERTED_KEY, JSON.stringify([...refs]));
  }
}
