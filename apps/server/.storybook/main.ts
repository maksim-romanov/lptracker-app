import type { StorybookConfig } from "@storybook/html-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../src/presentation/web/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-themes"],
  // Icon.tsx references /static/icons/*.svg the way the app's own serveStatic middleware exposes
  // them — mirror that same URL prefix here so icon stories aren't just blank in Storybook.
  staticDirs: [{ from: "../src/static", to: "/static" }],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
    });
  },
};

export default config;
