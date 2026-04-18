FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/build-03-rag-pipeline/package.json ./apps/build-03-rag-pipeline/
RUN pnpm install --frozen-lockfile --filter build-03-rag-pipeline...
COPY apps/build-03-rag-pipeline ./apps/build-03-rag-pipeline
WORKDIR /app/apps/build-03-rag-pipeline
EXPOSE 3003
CMD ["pnpm", "start"]
