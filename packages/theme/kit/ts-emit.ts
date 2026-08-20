import type { ResolvedNode } from "./tree";

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const INDENT = "  ";

export function tsKey(key: string): string {
  return IDENTIFIER.test(key) ? key : JSON.stringify(key);
}

/**
 * `inlineFromDepth` renders objects nested at that depth (and deeper) on a
 * single line — e.g. `1` keeps the top level as a block but inlines each entry.
 */
export function tsLiteral(value: ResolvedNode, indentLevel = 0, inlineFromDepth = Number.POSITIVE_INFINITY, depth = 0): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return String(value);

  const entries = Object.entries(value);
  if (depth >= inlineFromDepth) {
    return `{ ${entries.map(([key, child]) => `${tsKey(key)}: ${tsLiteral(child, 0, inlineFromDepth, depth + 1)}`).join(", ")} }`;
  }
  return [
    "{",
    ...entries.map(
      ([key, child]) => `${INDENT.repeat(indentLevel + 1)}${tsKey(key)}: ${tsLiteral(child, indentLevel + 1, inlineFromDepth, depth + 1)},`,
    ),
    `${INDENT.repeat(indentLevel)}}`,
  ].join("\n");
}

export function constExport(
  name: string,
  value: ResolvedNode,
  options: { type?: string; asConst?: boolean; inlineFromDepth?: number } = {},
): string {
  const annotation = options.type ? `: ${options.type}` : "";
  const suffix = options.asConst ? " as const" : "";
  return `export const ${name}${annotation} = ${tsLiteral(value, 0, options.inlineFromDepth)}${suffix};`;
}

export function typeAlias(name: string, definition: string): string {
  return `export type ${name} = ${definition};`;
}

export function stringUnion(values: string[]): string {
  return values.map((value) => JSON.stringify(value)).join(" | ");
}

export function objectType(fields: Array<readonly [name: string, type: string]>): string {
  return ["{", ...fields.map(([field, type]) => `${INDENT}${tsKey(field)}: ${type};`), "}"].join("\n");
}

export function tsFile(header: string, statements: string[]): string {
  return [header, "", statements.join("\n\n"), ""].join("\n");
}
