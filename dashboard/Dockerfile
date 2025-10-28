FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Solo copiamos lo necesario para producción
COPY package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.production ./

EXPOSE 3000
CMD ["npm", "start"]
