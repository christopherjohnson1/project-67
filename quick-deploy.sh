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
NC='\033[0m'

echo ""
echo -e "${BLUE}==>${NC} Quick deployment (no rebuild)..."
echo ""

cd "$(dirname "${BASH_SOURCE[0]}")"

echo -e "${BLUE}==>${NC} Pulling latest changes..."
git pull origin main

echo ""
echo -e "${BLUE}==>${NC} Restarting containers..."
docker-compose down
docker-compose up -d

echo ""
echo -e "${GREEN}✓${NC} Quick deploy complete!"
echo ""
echo "View logs: docker-compose logs -f"
echo ""

