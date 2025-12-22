# Treasure Hunt Application

A personalized treasure hunt web application with Angular frontend, NestJS backend, and PostgreSQL database. Built for a special treasure hunt experience with puzzles, hints, and console easter eggs.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Angular Frontend                │
│  (Standalone components, NGINX)         │
│         Port 80 → 8080                  │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST (/api/*)
┌─────────────────▼───────────────────────┐
│      NestJS Backend API                 │
│  (MikroORM, JWT Auth)                   │
│         Port 3000                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    PostgreSQL Database                  │
│         Port 5432                       │
└─────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Angular 17+** - Standalone components
- **SCSS** - Mobile-first styling
- **RxJS** - Reactive state management
- **NGINX** - Production web server

### Backend
- **NestJS 10** - Modular Node.js framework
- **TypeScript** - Strict mode enabled
- **MikroORM** - PostgreSQL ORM
- **JWT** - Authentication
- **Sharp** - Image manipulation
- **Bcrypt** - Password hashing

### Database
- **PostgreSQL 15** - Primary database
- **UUID** primary keys
- **JSONB** for flexible puzzle data

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Cloudflare Tunnel** - Secure remote access (future)

## Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Angular CLI**: `npm install -g @angular/cli`
- **NestJS CLI**: `npm install -g @nestjs/cli`

## Project Structure

```
project-67/
├── frontend/              # Angular application
├── backend/               # NestJS API
├── database/              # Database initialization
├── docker-compose.yml     # Container orchestration
├── .env.example          # Environment template
└── README.md             # This file
```

## Getting Started

### 1. Clone and Setup

```bash
# Clone the repository and navigate to the project directory
git clone <repository-url>
cd project-67
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` and set secure values for:
- `DB_PASSWORD` - Strong database password
- `JWT_ACCESS_SECRET` - Min 32 characters
- `JWT_REFRESH_SECRET` - Min 32 characters

### 3. Start with Docker (Recommended)

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

### 4. Verify Installation

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api/health
- **Database**: Port 5432

```bash
# Test backend health
curl http://localhost:3000/api/health

# Test frontend health
curl http://localhost/health
```

## Development Workflow

### Local Development (Without Docker)

**Backend:**
```bash
cd backend
npm install
npm run start:dev
# Runs on http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
ng serve
# Runs on http://localhost:4200
```

**Database:**
```bash
# Start only the database container
docker compose up db -d
```

### With Docker

```bash
# Start all services
npm run docker:up

# Rebuild after changes
npm run docker:rebuild

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_NAME` | Database name | `treasure_hunt` |
| `DB_USER` | Database user | `treasure_user` |
| `DB_PASSWORD` | Database password | **Required** |
| `DB_HOST` | Database host | `db` (Docker) / `localhost` |
| `DB_PORT` | Database port | `5432` |
| `JWT_ACCESS_SECRET` | JWT access token secret | **Required** |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | **Required** |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:4200` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Backend port | `3000` |

## Docker Commands

```bash
# Build images
docker compose build

# Start services in background
docker compose up -d

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Stop services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Restart a service
docker compose restart backend

# Execute command in container
docker compose exec backend sh
docker compose exec db psql -U treasure_user -d treasure_hunt

# Check container health
docker compose ps
```

## Database Access

```bash
# Connect to database via Docker
docker compose exec db psql -U treasure_user -d treasure_hunt

# Common SQL commands
\dt              # List tables
\d table_name    # Describe table
\q               # Quit

# Test backend API endpoint
curl http://localhost:3000/api/health
```

## Deployment to Raspberry Pi

### Quick Start

This project includes automated deployment scripts for easy deployment to your Raspberry Pi.

**Full deployment (with rebuild):**
```bash
./deploy.sh
```

**Quick deployment (code changes only):**
```bash
./quick-deploy.sh
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Prerequisites on Pi
- Docker and Docker Compose installed
- SSH access configured
- Port 80 and 3000 available
- Git installed

### Initial Setup

1. **Clone the repository on your Pi:**
```bash
ssh pi@raspberrypi.local
cd /home/pi
git clone <your-repo-url> treasure-hunt
cd treasure-hunt
```

2. **Make deployment scripts executable:**
```bash
chmod +x deploy.sh quick-deploy.sh
```

3. **Run initial deployment:**
```bash
./deploy.sh
```

### Deployment Options

| Script | Use Case | Time |
|--------|----------|------|
| `./deploy.sh` | Full rebuild (dependencies changed) | ~10-15 min |
| `./quick-deploy.sh` | Code changes only (no dependencies) | ~30 sec |
| `./deploy.sh --no-rebuild` | Pull and restart (no rebuild) | ~1 min |

### What the Deploy Script Does

✅ Pulls latest changes from Git  
✅ Stops running containers  
✅ Cleans up old Docker images  
✅ Rebuilds containers with fresh code  
✅ Starts all services  
✅ Shows status and logs  
✅ Logs all operations to `deploy.log`

### Monitoring After Deployment

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Check container status
docker-compose ps

# Check deployment history
tail -50 deploy.log
```

### Remote Access with Cloudflare Tunnel (Optional)

For secure remote access without opening ports:

```bash
# Install on Pi
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create treasure-hunt

# Route domain
cloudflared tunnel route dns treasure-hunt treasure.yourdomain.com

# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
```

## Troubleshooting

### Backend won't start
```bash
# Check backend logs
docker compose logs backend

# Verify database connection
docker compose exec backend sh
# Inside container:
wget -O- http://localhost:3000/api/health
```

### Frontend won't load
```bash
# Check NGINX logs
docker compose logs frontend

# Verify NGINX config
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Database connection issues
```bash
# Test database health
docker compose exec db pg_isready -U treasure_user

# Check database logs
docker compose logs db

# Verify database exists
docker compose exec db psql -U treasure_user -l
```

### Port conflicts
```bash
# Check what's using the ports
lsof -i :80
lsof -i :3000
lsof -i :5432

# Use different ports in docker-compose.yml
ports:
  - "8080:8080"  # Instead of 80:8080
```

## Development Best Practices

### Backend (NestJS)
- Use modular architecture (one module per domain)
- Keep controllers thin, services fat
- Use DTOs with class-validator for all inputs
- Use MikroORM entities for database models
- Add JSDoc comments to public methods
- Follow TypeScript strict mode
- Use early returns to reduce nesting

### Frontend (Angular)
- Use standalone components
- Implement OnDestroy for cleanup
- Use signals for reactive state
- Type all properties and returns
- Use async pipe in templates
- Mobile-first SCSS styling
- Handle loading and error states

### Database
- Use snake_case for all identifiers
- Always use parameterized queries
- Add indexes for foreign keys
- Use TIMESTAMP WITH TIME ZONE
- Specify ON DELETE behavior
- Use transactions for multi-step operations

## Features to Implement

- [ ] User authentication (JWT)
- [ ] Puzzle system with multiple types
- [ ] Linear progression tracking
- [ ] Hint system with request tracking
- [ ] Image manipulation and viewing
- [ ] Console easter eggs
- [ ] Activity logging
- [ ] Admin panel

## License

Private project - All rights reserved

## Contact

Christopher Johnson - Project Owner

