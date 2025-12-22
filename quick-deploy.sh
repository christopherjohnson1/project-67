#!/bin/bash

# ============================================================================
# Quick Deploy Script (No Rebuild)
# ============================================================================
# This script pulls changes and restarts containers without rebuilding
# Use when you only have code changes, not dependency changes
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}==>${NC} Quick deployment (no rebuild)..."
echo ""

cd "$(dirname "${BASH_SOURCE[0]}")"

# Detect docker compose command (V1 vs V2)
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  echo -e "${RED}✗${NC} Docker Compose is not installed"
  echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi

echo -e "${BLUE}==>${NC} Pulling latest changes..."
git pull origin main

echo ""
echo -e "${BLUE}==>${NC} Restarting containers..."
$DOCKER_COMPOSE down
$DOCKER_COMPOSE up -d

echo ""
echo -e "${GREEN}✓${NC} Quick deploy complete!"
echo ""
echo "View logs: $DOCKER_COMPOSE logs -f"
echo ""

