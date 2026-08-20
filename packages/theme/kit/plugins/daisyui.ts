import type { TokensPlugin } from "../core";
import type { Resolved } from "../tree";

export interface DaisyuiThemeBlock {
  name: string;
  colorScheme: "light" | "dark";
  default?: boolean;
  prefersdark?: boolean;
  colors: Record<string, string>;
  extra?: Record<string, string>;
}

export interface DaisyuiOptions<T> {
  outFile: string;
  headerComments: string[];
  themes(tree: Resolved<T>): DaisyuiThemeBlock[];
}

const declarationLines = (declarations: Record<string, string>): string[] =>
  Object.entries(declarations).map(([property, value]) => `  ${property}: ${value};`);

const renderThemeBlock = (block: DaisyuiThemeBlock): string =>
  [
    '@plugin "daisyui/theme" {',
    `  name: "${block.name}";`,
    `  default: ${block.default ?? false};`,
    `  prefersdark: ${block.prefersdark ?? false};`,
    `  color-scheme: ${block.colorScheme};`,
    "",
    ...declarationLines(block.colors),
    ...(block.extra ? ["", ...declarationLines(block.extra)] : []),
    "}",
  ].join("\n");

export function daisyuiTheme<T>(options: DaisyuiOptions<T>): TokensPlugin<T> {
  return {
    name: "daisyui-theme",
    files: (tree) => [
      {
        path: options.outFile,
        contents: [...options.headerComments, "", options.themes(tree).map(renderThemeBlock).join("\n\n"), ""].join("\n"),
      },
    ],
  };
}
