import { Application } from "@hotwired/stimulus";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/html-vite";

import RangeController from "../src/presentation/web/client/controllers/range_controller";
import "../src/presentation/web/styles/app.css";
import "./preview.css";

const app = Application.start();
app.register("range", RangeController);

const withThemeSurface: Decorator = (story) => {
  const container = document.createElement("div");
  container.className = "bg-surface-dim text-on-surface";
  container.style.padding = "1rem";
  // `.append(string)` inserts a literal text node, not parsed HTML — unlike `.innerHTML =`.
  // Stories that `render()` a string (per @storybook/html-vite's `string | Node` contract)
  // would show up as escaped markup text instead of the actual component.
  const result = story();
  if (typeof result === "string") container.innerHTML = result;
  else container.append(result);
  return container;
};

const preview: Preview = {
  decorators: [
    withThemeSurface,
    withThemeByDataAttribute({
      themes: { light: "depthly-light", dark: "depthly-dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
};

export default preview;
