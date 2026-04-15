FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the app package.json
COPY apps/day0-foundation/package.json ./apps/day0-foundation/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter day0-foundation...

# Copy the app source code
COPY apps/day0-foundation ./apps/day0-foundation

# Set working directory to the app
WORKDIR /app/apps/day0-foundation

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
