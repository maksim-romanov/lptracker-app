# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.6-slim AS base

# --- pruner: emit a partial monorepo containing only landing + its workspace deps ---
FROM base AS pruner
WORKDIR /repo
RUN bun add -g turbo@2.7.5
COPY . .
RUN turbo prune landing --docker

# --- builder: install (incl. devDeps for the tokens build) and run eleventy ---
FROM base AS builder
WORKDIR /app
COPY --from=pruner /repo/out/json/ .
RUN bun install --frozen-lockfile --ignore-scripts --linker=hoisted
COPY --from=pruner /repo/out/full/ .
RUN cd apps/landing && bun run build

# --- runner: caddy serving _site as static files ---
FROM caddy:2-alpine AS runner
COPY --from=builder /app/apps/landing/_site /srv
COPY apps/landing/Caddyfile /etc/caddy/Caddyfile
EXPOSE 8080
