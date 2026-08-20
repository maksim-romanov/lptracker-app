import type { TokensPlugin } from "../core";
import type { Resolved } from "../tree";

export interface CssVariablesThemeBlock {
  selector: string;
  declarations: Record<string, string>;
  media?: string;
}

export interface CssVariablesOptions<T> {
  outFile: string;
  headerComments: string[];
  blocks(tree: Resolved<T>): CssVariablesThemeBlock[];
}

const declarationLines = (declarations: Record<string, string>, indent: string): string[] =>
  Object.entries(declarations).map(([property, value]) => `${indent}${property}: ${value};`);

const renderRule = (block: CssVariablesThemeBlock, indent: string): string =>
  [`${indent}${block.selector} {`, ...declarationLines(block.declarations, `${indent}  `), `${indent}}`].join("\n");

const renderBlock = (block: CssVariablesThemeBlock): string =>
  block.media ? [`@media ${block.media} {`, renderRule(block, "  "), "}"].join("\n") : renderRule(block, "");

export function cssVariablesTheme<T>(options: CssVariablesOptions<T>): TokensPlugin<T> {
  return {
    name: "css-variables-theme",
    files: (tree) => [
      {
        path: options.outFile,
        contents: [...options.headerComments, "", options.blocks(tree).map(renderBlock).join("\n\n"), ""].join("\n"),
      },
    ],
  };
}
