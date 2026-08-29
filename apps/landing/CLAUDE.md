# CLAUDE.md — apps/landing

11ty static site with a custom esbuild pipeline (`scripts/build-assets.ts`) — deliberately not Vite.

Colour and spacing are the landing's own (OKLCH tokens in `src/assets/css/tokens.css`), deliberately separate from `packages/theme`. It takes only the shared **fonts** from there: `@depthly/theme/css/fonts-landing.css` is generated, and the two IBM Plex faces land in `src/assets/fonts/` via that package's codegen. Both are gitignored — run `bun run codegen` from the repo root before building.

## Commands

```bash
bun run dev     # eleventy --serve
bun run build
bun run lint / lint:fix
```
