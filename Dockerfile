# Multi-stage Docker build for full-stack application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files for both client and server
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm ci --only=production
RUN cd server && npm ci --only=production

# Build stage for client
FROM base AS client-builder
WORKDIR /app/client

# Copy client package files and install all dependencies (including dev)
COPY client/package*.json ./
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the client
RUN npm run build

# Build stage for server
FROM base AS server-builder
WORKDIR /app/server

# Copy server package files and install all dependencies (including dev)
COPY server/package*.json ./
RUN npm ci

# Copy server source code and prisma schema
COPY server/ ./

# Debug: Check what's in prisma directory
RUN ls -la prisma/

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production node_modules
COPY --from=deps --chown=nextjs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/client/node_modules ./client/node_modules

# Copy built applications
COPY --from=server-builder --chown=nextjs:nodejs /app/server/dist ./server/dist
COPY --from=server-builder --chown=nextjs:nodejs /app/server/public ./server/public
COPY --from=server-builder --chown=nextjs:nodejs /app/server/prisma ./server/prisma
COPY --from=server-builder --chown=nextjs:nodejs /app/server/package.json ./server/package.json
COPY --from=client-builder --chown=nextjs:nodejs /app/client/dist ./client/dist

# Copy any additional server files needed at runtime
COPY --from=server-builder --chown=nextjs:nodejs /app/server/node_modules/.prisma ./server/node_modules/.prisma

# Debug commands (run as root before switching user)
RUN ls -la /app/server/prisma/
RUN cat /app/server/package.json | grep -A5 prisma

USER nextjs

# Expose the port your server runs on
EXPOSE 3000

# Set working directory to server
WORKDIR /app/server

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]