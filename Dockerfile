# Multi-stage Dockerfile for Monorepo
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency configs
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --prefix backend --ignore-scripts
RUN npm install --prefix frontend --ignore-scripts --no-audit --no-fund --legacy-peer-deps

# Copy sources
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Generate client and build
RUN npm run db:generate --prefix backend
RUN npm run build --prefix backend
RUN npm run build --prefix frontend

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules

EXPOSE 4000 3000
CMD ["node", "backend/dist/index.js"]
