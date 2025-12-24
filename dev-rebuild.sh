#!/bin/bash

# ============================================================================
# Local Development Rebuild Script
# ============================================================================
# This script rebuilds all Docker containers with your latest local changes
# Use this when developing locally to see changes before creating a PR
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print functions
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

# Start
clear
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Local Development Rebuild"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$SCRIPT_DIR"

# Detect docker compose command
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  print_error "Docker Compose is not installed"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  print_status "Uncommitted changes detected (this is normal for local dev)"
  echo ""
fi

# Stop running containers
print_status "Stopping containers..."
$DOCKER_COMPOSE down
print_success "Containers stopped"
echo ""

# Rebuild all containers
print_status "Rebuilding all containers with latest changes..."
print_warning "This will take a moment..."
echo ""

if $DOCKER_COMPOSE build --no-cache; then
  print_success "All containers rebuilt successfully"
else
  print_error "Failed to rebuild containers"
  exit 1
fi
echo ""

# Start containers
print_status "Starting containers..."
if $DOCKER_COMPOSE up -d; then
  print_success "Containers started"
else
  print_error "Failed to start containers"
  exit 1
fi
echo ""

# Wait for services
print_status "Waiting for services to start..."
sleep 3
echo ""

# Show container status
print_status "Container status:"
$DOCKER_COMPOSE ps
echo ""

# Success message
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Development environment is ready!"
echo ""
echo "  🌐 Frontend:  http://localhost"
echo "  🔧 Backend:   http://localhost:3000"
echo "  🗄️  Database:  localhost:5432"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Useful commands
print_status "Useful commands:"
echo "  • View all logs:       $DOCKER_COMPOSE logs -f"
echo "  • View frontend logs:  $DOCKER_COMPOSE logs -f frontend"
echo "  • View backend logs:   $DOCKER_COMPOSE logs -f backend"
echo "  • Stop containers:     $DOCKER_COMPOSE down"
echo "  • Restart a service:   $DOCKER_COMPOSE restart [frontend|backend|db]"
echo ""

# Ask if user wants to follow logs
print_status "Would you like to follow the logs now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
  echo ""
  print_status "Following logs (press Ctrl+C to exit)..."
  echo ""
  $DOCKER_COMPOSE logs -f
fi


