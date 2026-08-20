export type TokenValue = string | number;
export type ResolvedNode = TokenValue | { [key: string]: ResolvedNode };

type NonDollarKeys<T> = Exclude<keyof T & string, `$${string}`>;

/**
 * Maps a DTCG token source tree to the shape plugins receive at build time:
 * `{ $value }` leaves become their (alias-resolved) values, `$`-prefixed
 * metadata disappears. Keeps literal keys, so plugin specs get autocomplete.
 */
export type Resolved<T> = T extends { $value: infer V }
  ? V extends TokenValue
    ? V
    : never
  : T extends object
    ? { [K in NonDollarKeys<T>]: Resolved<T[K]> }
    : never;

export function resolveTree(node: unknown): ResolvedNode {
  if (typeof node === "string" || typeof node === "number") return node;
  if (node && typeof node === "object") {
    if ("$value" in node) return resolveTree((node as { $value: unknown }).$value);
    const resolved: { [key: string]: ResolvedNode } = {};
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$")) continue;
      resolved[key] = resolveTree(child);
    }
    return resolved;
  }
  throw new Error(`Unexpected token node: ${JSON.stringify(node)}`);
}
