#!/bin/bash

# Rebuild PWA with Icons
# This script rebuilds the frontend Docker container to include the new PWA icons

set -e

echo "🔄 Rebuilding PWA with icons..."
echo ""

# Detect docker compose command (V1 vs V2)
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  echo "✗ Docker Compose is not installed"
  echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi

# Stop containers
echo "1️⃣ Stopping containers..."
$DOCKER_COMPOSE down

# Rebuild frontend with no cache
echo ""
echo "2️⃣ Rebuilding frontend container (this may take a few minutes)..."
$DOCKER_COMPOSE build --no-cache frontend

# Start containers
echo ""
echo "3️⃣ Starting containers..."
$DOCKER_COMPOSE up -d

# Wait for services to be ready
echo ""
echo "4️⃣ Waiting for services to start..."
sleep 5

# Verify icons are accessible
echo ""
echo "5️⃣ Verifying PWA assets..."
echo ""

# Check manifest
echo "Checking manifest.json..."
MANIFEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/manifest.json)
if [ "$MANIFEST_STATUS" = "200" ]; then
  echo "✅ manifest.json: OK"
else
  echo "❌ manifest.json: Failed (HTTP $MANIFEST_STATUS)"
fi

# Check service worker
echo "Checking service-worker.js..."
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/service-worker.js)
if [ "$SW_STATUS" = "200" ]; then
  echo "✅ service-worker.js: OK"
else
  echo "❌ service-worker.js: Failed (HTTP $SW_STATUS)"
fi

# Check favicons
echo "Checking favicons..."
FAVICON_32_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/favicon-32x32.png)
if [ "$FAVICON_32_STATUS" = "200" ]; then
  echo "✅ favicon-32x32.png: OK"
else
  echo "❌ favicon-32x32.png: Failed (HTTP $FAVICON_32_STATUS)"
fi

FAVICON_16_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/favicon-16x16.png)
if [ "$FAVICON_16_STATUS" = "200" ]; then
  echo "✅ favicon-16x16.png: OK"
else
  echo "❌ favicon-16x16.png: Failed (HTTP $FAVICON_16_STATUS)"
fi

# Check key icons
echo "Checking icons..."
for size in 72 96 128 144 152 192 384 512; do
  ICON_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/icons/icon-${size}x${size}.png)
  if [ "$ICON_STATUS" = "200" ]; then
    echo "✅ icon-${size}x${size}.png: OK"
  else
    echo "❌ icon-${size}x${size}.png: Failed (HTTP $ICON_STATUS)"
  fi
done

# Check maskable icons
for size in 192 512; do
  ICON_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/icons/icon-${size}x${size}-maskable.png)
  if [ "$ICON_STATUS" = "200" ]; then
    echo "✅ icon-${size}x${size}-maskable.png: OK"
  else
    echo "❌ icon-${size}x${size}-maskable.png: Failed (HTTP $ICON_STATUS)"
  fi
done

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open http://localhost in Chrome/Edge"
echo "2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Open DevTools → Application → Manifest"
echo "4. Verify all icons show up"
echo "5. Check for install prompt in address bar"
echo ""
echo "🔧 If issues persist:"
echo "- Clear browser cache completely"
echo "- Unregister service worker in DevTools → Application → Service Workers"
echo "- Try incognito/private window"
echo ""

