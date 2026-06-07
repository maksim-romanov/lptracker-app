import type { TStableEntry } from "./stables-set";

export interface AsyncStablesProvider {
  readonly name: string;
  resolve(): Promise<TStableEntry[]>;
}
