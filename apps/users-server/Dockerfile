FROM node:24.8.0-alpine AS base

ENV NODE_ENV=production

WORKDIR /app

# =========================================================================== #

FROM base AS builder-base

ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1

RUN corepack enable pnpm

# =========================================================================== #

FROM builder-base AS builder

RUN pnpm install --global turbo@^2

COPY . .

# Prune the monorepo to only users-server and its dependencies
# https://turbo.build/repo/docs/guides/tools/docker#the-solution
RUN turbo prune @niki/users-server --docker

# =========================================================================== #

FROM builder-base AS installer

# Copy pruned workspace
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
COPY --from=builder /app/turbo.json ./turbo.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --from=builder /app/out/full/ .

# Build the users-server
RUN pnpm --filter=users-server build

# =========================================================================== #

FROM base AS production

# Install runtime dependencies
RUN apk add --no-cache curl tini

# Enable pnpm for running migrations
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs fastify

# Copy pnpm workspace configuration
COPY --from=installer --chown=fastify:nodejs /app/package.json /app/root-package.json
COPY --from=installer --chown=fastify:nodejs /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml

# Copy workspace node_modules (contains all dependencies)
COPY --from=installer --chown=fastify:nodejs /app/node_modules /app/node_modules

# Copy packages directory for internal workspace dependencies
COPY --from=installer --chown=fastify:nodejs /app/packages /app/packages

# Copy the users-server app
COPY --from=installer --chown=fastify:nodejs /app/apps/users-server /app/apps/users-server

USER fastify

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl --fail --silent http://localhost:3000/healthcheck || exit 1

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["sh", "-c", "pnpm --filter=users-server db:migrate && node /app/apps/users-server/dist/server.js"]
