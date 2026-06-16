import { KINDS, type KindMotion } from "./kinds";

const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : n.toString());

export function generateKindsGLSL(): string {
  const entries = Object.entries(KINDS).sort(([, a], [, b]) => a.id - b.id);
  const maxId = entries[entries.length - 1]?.[1].id ?? 0;
  const pad = Math.max(...entries.map(([name]) => name.length));

  const defines = entries.map(([name, cfg]) => `#define KIND_${name.padEnd(pad)} ${cfg.id}.0`);

  // `(k)` must be glued to the macro name — the C preprocessor treats
  // whitespace before `(` as parameter-less, silently breaking IS_FOO(x).
  const masks = entries.map(([name, cfg]) => {
    const lo = cfg.id - 0.5;
    const hi = cfg.id + 0.5;
    if (cfg.id === 0) return `#define IS_${name}(k) ((k) < ${f(hi)})`;
    if (cfg.id === maxId) return `#define IS_${name}(k) ((k) >= ${f(lo)})`;
    return `#define IS_${name}(k) ((k) >= ${f(lo)} && (k) < ${f(hi)})`;
  });

  const spreadBranches = entries
    .filter(([, cfg]) => cfg.spreadMul !== 1.0)
    .map(([name, cfg]) => `  if (IS_${name}(kind)) return ${cfg.spreadMul.toFixed(2)};`);

  const restBranches = entries
    .filter(([, cfg]) => cfg.restSize.type !== "passthrough")
    .map(([name, cfg]) => {
      if (cfg.restSize.type === "fixed") {
        return `  if (IS_${name}(kind)) return ${cfg.restSize.value.toFixed(2)};`;
      }
      if (cfg.restSize.type === "hashRange") {
        const { min, max } = cfg.restSize;
        return `  if (IS_${name}(kind)) return mix(${min.toFixed(2)}, ${max.toFixed(2)}, h);`;
      }
      return "";
    });

  const motionGroups: Record<KindMotion, string[]> = { brownian: [], drift: [], orbit: [] };
  for (const [name, cfg] of entries) motionGroups[cfg.motion].push(name);
  const motionMacros = (Object.keys(motionGroups) as KindMotion[]).map((motion) => {
    const names = motionGroups[motion];
    const body = names.length === 0 ? "(false)" : names.map((n) => `IS_${n}(k)`).join(" || ");
    return `#define IS_MOTION_${motion.toUpperCase()}(k) (${body})`;
  });

  return [
    "// AUTO-GENERATED from kinds.ts. Do not edit — change the table and rebuild.",
    "",
    ...defines,
    "",
    ...masks,
    "",
    `#define IS_SPECIAL(k) ((k) >= ${f(1.5)})`,
    "",
    ...motionMacros,
    "",
    "float kindSpreadMul(float kind) {",
    ...spreadBranches,
    "  return 1.0;",
    "}",
    "",
    "// Returns -1.0 to fall back to sizeScale. `h` is a per-particle hash.",
    "float kindRestSize(float kind, float h) {",
    ...restBranches,
    "  return -1.0;",
    "}",
    "",
  ].join("\n");
}
