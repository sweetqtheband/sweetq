FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


# ---- Runtime ----
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PRIVATE_TARGET=server
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont && \
    npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml .npmrc ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.production ./

EXPOSE 3000

CMD ["pnpm", "start"]