import { Application } from "@hotwired/stimulus";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/html-vite";

import RangeController from "../src/presentation/web/client/controllers/range_controller";
import "../src/presentation/web/styles/app.css";

const app = Application.start();
app.register("range", RangeController);

const withThemeSurface: Decorator = (story) => {
  const container = document.createElement("div");
  container.className = "bg-surface text-on-surface";
  container.style.padding = "1rem";
  container.append(story());
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
