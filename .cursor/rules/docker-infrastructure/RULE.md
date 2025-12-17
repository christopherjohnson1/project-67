---
description: "Docker and infrastructure standards - Dockerfile best practices, docker-compose configuration, multi-stage builds, and deployment patterns"
alwaysApply: false
globs:
  - "**/Dockerfile"
  - "**/docker-compose*.yml"
  - "**/.dockerignore"
  - "**/nginx.conf"
---

# Docker & Infrastructure Standards

## Core Principles

- **Multi-stage builds**: Minimize image size and attack surface
- **Layer caching**: Order instructions for optimal cache usage
- **Security first**: Run as non-root, scan for vulnerabilities
- **Explicit versions**: Pin base image versions
- **Health checks**: Monitor container health

## Dockerfile Standards

### Node.js Backend Dockerfile

```dockerfile
# backend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript config
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm install -D typescript @types/node && \
    npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Create non-root user
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

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
```

**Dockerfile rules:**
- Use multi-stage builds to reduce image size
- Order layers from least to most frequently changing
- Copy `package.json` before source code (cache dependencies)
- Run as non-root user in production
- Use `npm ci` instead of `npm install` for reproducible builds
- Clean npm cache to reduce image size
- Use Alpine-based images when possible
- Add health checks
- Pin specific Node version (not `latest`)

### Angular Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# Stage 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Angular app files
COPY . .

# Build for production
RUN npm run build -- --configuration production

# Stage 2: Serve with NGINX
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/treasure-hunt /usr/share/nginx/html

# Create non-root user for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend Dockerfile rules:**
- Build Angular app in first stage
- Serve with NGINX in second stage
- Remove default NGINX config
- Run NGINX as non-root user
- Use port 8080 (non-privileged) instead of 80
- Add health check endpoint
- Minimize final image size

### NGINX Configuration

```nginx
# frontend/nginx.conf

server {
    listen 8080;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Serve Angular app
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**NGINX rules:**
- Use non-privileged port (8080)
- Enable gzip compression
- Add security headers
- Cache static assets aggressively
- Proxy API requests to backend
- Add health check endpoint
- Deny access to hidden files
- Set appropriate timeouts

## .dockerignore Files

### Backend .dockerignore

```
# backend/.dockerignore

# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Build output
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Tests
coverage/
*.test.ts
*.spec.ts
__tests__/

# Documentation
README.md
docs/

# Docker files
Dockerfile
docker-compose*.yml
.dockerignore
```

### Frontend .dockerignore

```
# frontend/.dockerignore

# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Build output
dist/
.angular/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store

# Git
.git/
.gitignore

# Tests
coverage/
*.spec.ts
karma.conf.js
e2e/

# Documentation
README.md

# Docker files
Dockerfile
docker-compose*.yml
.dockerignore
```

**.dockerignore rules:**
- Exclude `node_modules` (install in container)
- Exclude build output (`dist/`, `.angular/`)
- Exclude environment files (use docker-compose)
- Exclude IDE and OS files
- Exclude git directory
- Exclude test files in production builds

## Docker Compose

### docker-compose.yml

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: treasure-hunt-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-treasure_hunt}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD is required}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - treasure-hunt-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: treasure-hunt-backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_NAME: ${DB_NAME:-treasure_hunt}
      DATABASE_USER: ${DB_USER:-postgres}
      DATABASE_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD is required}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:?JWT_ACCESS_SECRET is required}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET is required}
      JWT_ACCESS_EXPIRES_IN: ${JWT_ACCESS_EXPIRES_IN:-15m}
      JWT_REFRESH_EXPIRES_IN: ${JWT_REFRESH_EXPIRES_IN:-7d}
    ports:
      - "3000:3000"
    volumes:
      - ./backend/uploads:/app/uploads
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - treasure-hunt-network

  # Frontend with NGINX
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: treasure-hunt-frontend
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "80:8080"
      - "443:8443"
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    networks:
      - treasure-hunt-network

# Named volumes
volumes:
  postgres_data:
    driver: local

# Networks
networks:
  treasure-hunt-network:
    driver: bridge
```

**docker-compose rules:**
- Use version 3.9 or later
- Give containers descriptive names
- Use `restart: unless-stopped` for resilience
- Define health checks for all services
- Use `depends_on` with `condition: service_healthy`
- Use named volumes for persistence
- Create custom network for service isolation
- Use environment variable defaults: `${VAR:-default}`
- Require critical env vars: `${VAR:?error message}`
- Expose only necessary ports
- Mount volumes read-only (`:ro`) when appropriate

### Development Override

```yaml
# docker-compose.dev.yml

version: '3.9'

services:
  backend:
    build:
      target: builder
    environment:
      NODE_ENV: development
    volumes:
      - ./backend/src:/app/src:ro
      - /app/node_modules
    command: npm run dev
    ports:
      - "3000:3000"
      - "9229:9229"  # Node debugger

  frontend:
    build:
      target: builder
    volumes:
      - ./frontend/src:/app/src:ro
      - /app/node_modules
    command: npm start
    ports:
      - "4200:4200"
    environment:
      NODE_ENV: development
```

**Development override rules:**
- Use separate file for development config
- Mount source code as volumes for hot reload
- Expose debugger ports
- Use development build targets
- Override commands for dev servers

## Environment Variables

### .env.example

```bash
# .env.example
# Copy to .env and fill in values

# Database Configuration
DB_NAME=treasure_hunt
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_HOST=db
DB_PORT=5432

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_min_32_chars_here
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:4200,http://localhost:80

# Application
NODE_ENV=production
PORT=3000

# Optional: Image Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=/app/uploads
```

**Environment file rules:**
- Provide `.env.example` with all required variables
- Never commit `.env` to version control
- Use strong, unique secrets (min 32 characters)
- Document what each variable does
- Provide sensible defaults where appropriate
- Require critical values in docker-compose

## Health Checks

### Backend Health Check Endpoint

```typescript
// backend/src/routes/health.ts
import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Quick check - don't query actual data
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'backend-api',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'backend-api',
      error: 'Database connection failed'
    });
  }
});

// Detailed health check for monitoring
router.get('/health/detailed', async (_req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'backend-api',
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      memory: 'unknown'
    }
  };
  
  // Database check
  try {
    await pool.query('SELECT 1');
    health.checks.database = 'healthy';
  } catch {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }
  
  // Memory check
  const memUsage = process.memoryUsage();
  health.checks.memory = memUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning';
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

**Health check rules:**
- Simple `/health` endpoint for Docker health checks
- Keep health checks fast (< 1 second)
- Return 200 for healthy, 503 for unhealthy
- Optional detailed endpoint for monitoring
- Check database connectivity
- Include timestamp and service info

## Production Deployment

### Raspberry Pi Deployment Script

```bash
#!/bin/bash
# deploy-to-pi.sh

set -e  # Exit on error

# Configuration
PI_HOST="${PI_HOST:-raspberrypi.local}"
PI_USER="${PI_USER:-pi}"
DEPLOY_DIR="/home/$PI_USER/treasure-hunt"

echo "Deploying to $PI_USER@$PI_HOST..."

# Step 1: Build images locally (for ARM architecture)
echo "Building images..."
docker compose build --build-arg TARGETPLATFORM=linux/arm64

# Step 2: Save images to tar files
echo "Saving images..."
docker save treasure-hunt-backend:latest | gzip > backend-image.tar.gz
docker save treasure-hunt-frontend:latest | gzip > frontend-image.tar.gz

# Step 3: Copy to Pi
echo "Copying files to Pi..."
ssh "$PI_USER@$PI_HOST" "mkdir -p $DEPLOY_DIR"
scp backend-image.tar.gz "$PI_USER@$PI_HOST:$DEPLOY_DIR/"
scp frontend-image.tar.gz "$PI_USER@$PI_HOST:$DEPLOY_DIR/"
scp docker-compose.yml "$PI_USER@$PI_HOST:$DEPLOY_DIR/"
scp .env "$PI_USER@$PI_HOST:$DEPLOY_DIR/"
scp database/init.sql "$PI_USER@$PI_HOST:$DEPLOY_DIR/"

# Step 4: Load and start on Pi
echo "Loading images on Pi..."
ssh "$PI_USER@$PI_HOST" << 'EOF'
cd ~/treasure-hunt
gunzip -c backend-image.tar.gz | docker load
gunzip -c frontend-image.tar.gz | docker load
docker compose down
docker compose up -d
docker compose ps
EOF

# Cleanup
rm backend-image.tar.gz frontend-image.tar.gz

echo "Deployment complete!"
echo "Access the app at: http://$PI_HOST"
```

**Deployment rules:**
- Build for correct architecture (ARM for Pi)
- Use environment-specific configs
- Backup database before deploying
- Run health checks after deployment
- Keep logs of deployments
- Have rollback plan ready

## Monitoring & Logs

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# View container stats
docker stats

# Inspect container
docker compose exec backend sh

# Check health status
docker compose ps
curl http://localhost:3000/health
```

## Best Practices Checklist

- [ ] Use multi-stage builds
- [ ] Run containers as non-root user
- [ ] Pin specific image versions
- [ ] Add health checks to all services
- [ ] Use `.dockerignore` to exclude unnecessary files
- [ ] Order Dockerfile layers for optimal caching
- [ ] Use named volumes for persistence
- [ ] Define resource limits in production
- [ ] Use secrets management for sensitive data
- [ ] Enable logging and monitoring
- [ ] Test images for vulnerabilities
- [ ] Document environment variables
- [ ] Use docker-compose for local development
- [ ] Keep images small (<500MB when possible)
- [ ] Add labels for image metadata

