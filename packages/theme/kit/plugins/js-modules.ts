import type { TokensPlugin } from "../core";
import type { Resolved } from "../tree";
import { tsFile } from "../ts-emit";
import { join } from "node:path";

export interface JsModuleSpec<T> {
  header: string;
  statements(tree: Resolved<T>): string[];
}

export interface JsModulesOptions<T> {
  outDir: string;
  files: Record<string, JsModuleSpec<T>>;
}

export function jsModules<T>(options: JsModulesOptions<T>): TokensPlugin<T> {
  return {
    name: "js-modules",
    files: (tree) =>
      Object.entries(options.files).map(([filename, spec]) => ({
        path: join(options.outDir, filename),
        contents: tsFile(spec.header, spec.statements(tree)),
      })),
  };
}
