import StyleDictionary from "style-dictionary";
import type { Config } from "style-dictionary/types";

import { type Resolved, resolveTree } from "./tree";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export interface GeneratedFile {
  path: string;
  /** Binary for plugins that distribute assets rather than emit source. */
  contents: string | Uint8Array;
}

export interface TokensPlugin<T> {
  name: string;
  /**
   * Directories this plugin fully owns. Emptied before its files are written, so renaming an
   * output cannot leave an orphan behind — which nobody would notice, since these directories
   * are gitignored on the receiving side.
   */
  cleanDirs?(tree: Resolved<T>): string[];
  files(tree: Resolved<T>): GeneratedFile[];
}

export interface TokensConfig<T extends object> {
  tokens: T;
  plugins: TokensPlugin<T>[];
}

export function defineTokens<T extends object>(config: TokensConfig<T>): TokensConfig<T> {
  return config;
}

export async function build<T extends object>(config: TokensConfig<T>): Promise<void> {
  const styleDictionary = new StyleDictionary({
    tokens: config.tokens,
    hooks: {
      transforms: {
        // Style Dictionary's default token name (last path segment) collides across
        // groups; plugins read the resolved tree by path, so the name is only an id.
        "kit/name-by-path": {
          type: "name",
          transform: (token) => token.path.join("."),
        },
      },
    },
    platforms: {
      resolved: { transforms: ["kit/name-by-path"] },
    },
  } as Config);

  const dictionary = await styleDictionary.getPlatformTokens("resolved");
  const tree = resolveTree(dictionary.tokens) as Resolved<T>;

  for (const plugin of config.plugins) {
    for (const dir of plugin.cleanDirs?.(tree) ?? []) {
      await rm(dir, { recursive: true, force: true });
    }
    for (const file of plugin.files(tree)) {
      await mkdir(dirname(file.path), { recursive: true });
      await writeFile(file.path, file.contents);
      console.log(`✔︎ ${file.path}`);
    }
  }
}
