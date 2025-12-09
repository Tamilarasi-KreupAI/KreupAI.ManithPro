#!/bin/bash
# KreupAI ManithPro - Docker Rollback Script
# Usage: ./scripts/docker-rollback.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$PROJECT_DIR"

echo -e "${YELLOW}=== ManithPro Rollback ===${NC}"

# Check for rollback files
if [ ! -f .rollback-backend ] || [ ! -f .rollback-frontend ]; then
    echo -e "${RED}Error: No rollback information found.${NC}"
    echo "Rollback files (.rollback-backend, .rollback-frontend) are missing."
    exit 1
fi

PREV_BACKEND=$(cat .rollback-backend)
PREV_FRONTEND=$(cat .rollback-frontend)

echo "Rolling back to:"
echo "  Backend: $PREV_BACKEND"
echo "  Frontend: $PREV_FRONTEND"
echo ""

read -p "Continue with rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo -e "${YELLOW}Starting rollback...${NC}"

# Stop current containers
docker-compose stop backend frontend

# Pull previous images if needed
docker pull "$PREV_BACKEND" 2>/dev/null || true
docker pull "$PREV_FRONTEND" 2>/dev/null || true

# Update tags
docker tag "$PREV_BACKEND" manithpro-backend:rollback
docker tag "$PREV_FRONTEND" manithpro-frontend:rollback

# Start with rolled back images
export BACKEND_IMAGE="manithpro-backend:rollback"
export FRONTEND_IMAGE="manithpro-frontend:rollback"

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend frontend

# Wait for services
sleep 15

# Health check
if curl -sf http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✓ Rollback successful!${NC}"

    # Cleanup rollback files
    rm -f .rollback-backend .rollback-frontend
else
    echo -e "${RED}✗ Rollback may have failed. Please check manually.${NC}"
    exit 1
fi
