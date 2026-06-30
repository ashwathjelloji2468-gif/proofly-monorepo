# Multi-stage Dockerfile for Monorepo
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency configs
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy sources
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generate client and build
RUN npx prisma generate --schema=./backend/prisma/schema.prisma
RUN npm run build --workspace=backend
RUN npm run build --workspace=frontend

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules

EXPOSE 4000 3000
CMD ["npm", "start"]
