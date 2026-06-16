import { ATLAS_COLS, TOKENS } from "./tokens";

export function generateTokensGLSL(): string {
  const rows = Math.ceil(TOKENS.length / ATLAS_COLS);
  const cellW = (1 / ATLAS_COLS).toFixed(6);
  const cellH = (1 / rows).toFixed(6);

  const lines: string[] = [
    "// AUTO-GENERATED from tokens.ts. Do not edit — change the table and rebuild.",
    "",
    `#define TOKEN_COUNT ${TOKENS.length}`,
    `#define TOKEN_CELL_W ${cellW}`,
    `#define TOKEN_CELL_H ${cellH}`,
    "",
    "vec3 tokenColor(float idx) {",
  ];

  TOKENS.forEach((token, i) => {
    const [r, g, b] = token.color;
    const guard = i === TOKENS.length - 1 ? "" : `if (idx < ${(i + 0.5).toFixed(1)}) `;
    lines.push(`  ${guard}return vec3(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}); // ${token.ticker}`);
  });

  lines.push("}", "");
  lines.push("vec2 tokenAtlasUV(float idx) {");

  TOKENS.forEach((token, i) => {
    const col = i % ATLAS_COLS;
    const row = Math.floor(i / ATLAS_COLS);
    const u = (col / ATLAS_COLS).toFixed(6);
    const v = (row / rows).toFixed(6);
    const guard = i === TOKENS.length - 1 ? "" : `if (idx < ${(i + 0.5).toFixed(1)}) `;
    lines.push(`  ${guard}return vec2(${u}, ${v}); // ${token.ticker}`);
  });

  lines.push("}", "");
  return lines.join("\n");
}
