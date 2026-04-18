FROM node:20-alpine AS base
 
# Install pnpm
RUN npm install -g pnpm
 
WORKDIR /app
 
# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
 
# Copy the app package.json
COPY apps/build-01-streaming-llm/package.json ./apps/build-01-streaming-llm/
 
# Install dependencies
RUN pnpm install --frozen-lockfile --filter build-01-streaming-llm...
 
# Copy the app source code
COPY apps/build-01-streaming-llm ./apps/build-01-streaming-llm
 
# Set working directory to the app
WORKDIR /app/apps/build-01-streaming-llm
 
EXPOSE 3001
 
# Start the application
CMD ["pnpm", "start"]
