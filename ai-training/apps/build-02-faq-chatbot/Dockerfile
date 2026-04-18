FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/build-02-faq-chatbot/package.json ./apps/build-02-faq-chatbot/
RUN pnpm install --frozen-lockfile --filter build-02-faq-chatbot...
COPY apps/build-02-faq-chatbot ./apps/build-02-faq-chatbot
WORKDIR /app/apps/build-02-faq-chatbot
EXPOSE 3002
CMD ["pnpm", "start"]
