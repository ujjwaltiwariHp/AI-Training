FROM node:20-alpine AS base
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend-build-02/package.json ./apps/frontend-build-02/
RUN CI=true pnpm install --no-frozen-lockfile --filter frontend-build-02...

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend-build-02/node_modules ./apps/frontend-build-02/node_modules
COPY . .
WORKDIR /app/apps/frontend-build-02
RUN pnpm build

# Runner stage (minimal)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend-build-02/.next/standalone ./
COPY --from=builder /app/apps/frontend-build-02/.next/static ./apps/frontend-build-02/.next/static
COPY --from=builder /app/apps/frontend-build-02/public ./apps/frontend-build-02/public

USER nextjs
EXPOSE 3004
ENV PORT=3004
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend-build-02/server.js"]
