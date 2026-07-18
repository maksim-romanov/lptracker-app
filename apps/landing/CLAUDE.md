# CLAUDE.md — apps/landing

11ty static site with a custom esbuild pipeline (`scripts/build-assets.ts`) — deliberately not Vite. Only workspace dependency is `packages/typescript-config`; does not import `packages/theme` despite the name overlap.

## Commands

```bash
bun run dev     # eleventy --serve
bun run build
bun run lint / lint:fix
```
