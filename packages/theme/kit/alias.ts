type NonDollarKeys<T> = Exclude<keyof T & string, `$${string}`>;

/** Dot-joined paths of T that end at a `{ $value }` leaf, skipping `$`-metadata. */
export type TokenReferencePath<T> = T extends object
  ? {
      [K in NonDollarKeys<T>]: T[K] extends object ? ("$value" extends keyof T[K] ? K : `${K}.${TokenReferencePath<T[K]>}`) : never;
    }[NonDollarKeys<T>]
  : never;

/**
 * Typed builder for DTCG alias values: the path is validated by the compiler
 * against the given token tree (with autocomplete), verified again at runtime,
 * and emitted as a standard `{path.to.token}` reference — so the relationship
 * survives as data for any DTCG consumer.
 */
export function tokenAlias<T extends object>(tokens: T) {
  return (path: TokenReferencePath<T>): { $value: string } => {
    let node: unknown = tokens;
    for (const segment of (path as string).split(".")) {
      node = (node as Record<string, unknown> | undefined)?.[segment];
    }
    if (!node || typeof node !== "object" || !("$value" in node)) {
      throw new Error(`tokenAlias: "${path}" does not resolve to a token`);
    }
    return { $value: `{${path}}` };
  };
}
