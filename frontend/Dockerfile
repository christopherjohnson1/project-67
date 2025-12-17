# Multi-stage Dockerfile for Angular frontend
# Stage 1: Builder - builds Angular application
# Stage 2: Production - serves with NGINX

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Angular application files
COPY . .

# Build for production with optimization
RUN npm run build -- --configuration production

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM nginx:1.25-alpine AS production

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy built Angular app from builder stage
# Note: Update 'treasure-hunt' to match your Angular project name from angular.json
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Create non-root user for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose non-privileged port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

