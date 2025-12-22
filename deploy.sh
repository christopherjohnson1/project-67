#!/bin/bash

# ============================================================================
# Treasure Hunt Deployment Script for Raspberry Pi
# ============================================================================
# This script pulls the latest changes and deploys the application
# Usage: ./deploy.sh [--no-rebuild]
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_DIR/deploy.log"

# Parse arguments
REBUILD=true
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-rebuild)
      REBUILD=false
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: ./deploy.sh [--no-rebuild]"
      exit 1
      ;;
  esac
done

# Function to print colored messages
print_status() {
  echo -e "${BLUE}==>${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Function to log messages
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Start deployment
echo ""
print_status "Starting deployment to Raspberry Pi..."
echo ""
log "Deployment started"

# Step 1: Navigate to project directory
cd "$PROJECT_DIR"
print_status "Working directory: $PROJECT_DIR"

# Step 2: Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  print_warning "You have uncommitted changes. These will not be deployed."
  echo ""
fi

# Step 3: Pull latest changes
print_status "Pulling latest changes from Git..."
if git pull origin main; then
  print_success "Successfully pulled latest changes"
  log "Git pull successful"
else
  print_error "Failed to pull changes from Git"
  log "Git pull failed"
  exit 1
fi
echo ""

# Detect docker compose command (V1 vs V2)
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  print_error "Docker Compose is not installed"
  echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi
print_status "Using Docker Compose: $DOCKER_COMPOSE"
echo ""

# Step 4: Stop running containers
print_status "Stopping running containers..."
if $DOCKER_COMPOSE down; then
  print_success "Containers stopped"
  log "Containers stopped"
else
  print_warning "No containers were running or failed to stop"
  log "Container stop warning"
fi
echo ""

# Step 5: Remove old images (optional, saves space on Pi)
print_status "Cleaning up old Docker images..."
docker image prune -f > /dev/null 2>&1 || true
print_success "Cleanup complete"
echo ""

# Step 6: Build containers
if [ "$REBUILD" = true ]; then
  print_status "Building Docker containers (this may take a while on Raspberry Pi)..."
  if $DOCKER_COMPOSE build --no-cache; then
    print_success "Containers built successfully"
    log "Docker build successful"
  else
    print_error "Failed to build containers"
    log "Docker build failed"
    exit 1
  fi
else
  print_status "Skipping rebuild (--no-rebuild flag used)"
  log "Build skipped"
fi
echo ""

# Step 7: Start containers
print_status "Starting containers..."
if $DOCKER_COMPOSE up -d; then
  print_success "Containers started"
  log "Containers started"
else
  print_error "Failed to start containers"
  log "Container start failed"
  exit 1
fi
echo ""

# Step 8: Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 5

# Check container status
print_status "Container status:"
$DOCKER_COMPOSE ps
echo ""

# Step 9: Show service URLs
print_success "Deployment complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🎉 Application is now running!"
echo ""
echo "  Frontend:  http://localhost"
echo "  Backend:   http://localhost:3000"
echo "  Database:  localhost:5432"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 10: Show recent logs
print_status "Recent logs (last 20 lines):"
echo ""
$DOCKER_COMPOSE logs --tail=20
echo ""

# Step 11: Final instructions
print_status "Useful commands:"
echo "  • View logs:           $DOCKER_COMPOSE logs -f"
echo "  • View specific logs:  $DOCKER_COMPOSE logs -f [frontend|backend|db]"
echo "  • Stop app:            $DOCKER_COMPOSE down"
echo "  • Restart app:         $DOCKER_COMPOSE restart"
echo "  • Check status:        $DOCKER_COMPOSE ps"
echo ""

log "Deployment completed successfully"
print_success "Deployment log saved to: $LOG_FILE"
echo ""

