# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.13-slim AS base

# --- pruner: emit a partial monorepo containing only server + its deps ---
FROM base AS pruner
WORKDIR /repo
RUN bun add -g turbo@2.7.5
COPY . .
RUN turbo prune server --docker

# --- css: build Tailwind output (needs dev deps + full workspace for @depthly/theme) ---
FROM base AS css
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile
RUN bun run --cwd apps/server css:build

# --- installer: install production deps against the pruned manifests ---
FROM base AS installer
WORKDIR /app
COPY --from=pruner /repo/out/json/ .
RUN bun install --frozen-lockfile --production --ignore-scripts --linker=hoisted
COPY --from=pruner /repo/out/full/ .

# --- runner: minimal final image, non-root, with curl for healthcheck ---
FROM base AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=installer /app .
COPY --from=css /repo/apps/server/src/static/dist/app.css apps/server/src/static/dist/app.css
USER bun
WORKDIR /app/apps/server
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
