# Multi-stage Dockerfile for NestJS backend
# Stage 1: Builder - compiles TypeScript
# Stage 2: Production - runs compiled application

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig*.json ./
COPY mikro-orm.config.ts ./

# Copy source code
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/mikro-orm.config.ts ./

# Create uploads directory
RUN mkdir -p /app/uploads && chown nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check using wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "dist/src/main.js"]

