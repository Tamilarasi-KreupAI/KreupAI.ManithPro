#!/bin/bash
# KreupAI ManithPro - Docker Deploy Script
# Usage: ./scripts/docker-deploy.sh [environment]
# Example: ./scripts/docker-deploy.sh staging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENVIRONMENT=${1:-development}
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo -e "${GREEN}=== ManithPro Docker Deploy ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Project directory: $PROJECT_DIR"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use development, staging, or production.${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Function to wait for a service to be healthy
wait_for_health() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=0

    echo -e "${YELLOW}Waiting for $service to be healthy...${NC}"

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy"; then
            echo -e "${GREEN}✓ $service is healthy${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    echo -e "${RED}✗ $service failed to become healthy${NC}"
    return 1
}

# Deploy based on environment
case $ENVIRONMENT in
    development)
        echo -e "${BLUE}Starting development environment...${NC}"

        # Start with dev overrides
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

        # Wait for core services
        wait_for_health postgres
        wait_for_health redis

        echo -e "${GREEN}Development environment is ready!${NC}"
        echo ""
        echo "Services:"
        echo "  - Backend API: http://localhost:3000"
        echo "  - Frontend: http://localhost:5173"
        echo "  - pgAdmin: http://localhost:5050"
        echo "  - Redis Commander: http://localhost:8081"
        echo "  - Mailhog: http://localhost:8025"
        ;;

    staging)
        echo -e "${BLUE}Deploying to staging...${NC}"

        # Pull latest images
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

        # Deploy with zero-downtime
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps backend
        wait_for_health backend 60

        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps frontend
        sleep 5

        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps nginx

        echo -e "${GREEN}Staging deployment complete!${NC}"
        ;;

    production)
        echo -e "${BLUE}Deploying to production...${NC}"
        echo -e "${YELLOW}WARNING: This will deploy to production!${NC}"

        read -p "Are you sure you want to continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled."
            exit 0
        fi

        # Backup current deployment info
        echo "Creating rollback point..."
        docker inspect --format='{{.Config.Image}}' manithpro-backend 2>/dev/null > .rollback-backend || true
        docker inspect --format='{{.Config.Image}}' manithpro-frontend 2>/dev/null > .rollback-frontend || true

        # Pull latest images
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull

        # Rolling deployment
        echo "Deploying backend..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --scale backend=2 backend
        sleep 15

        # Health check
        if ! curl -sf http://localhost:3000/health > /dev/null; then
            echo -e "${RED}Backend health check failed! Rolling back...${NC}"
            ./scripts/docker-rollback.sh
            exit 1
        fi

        echo "Deploying frontend..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps frontend
        sleep 10

        # Scale down to normal
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=1 backend

        # Final health check
        if curl -sf http://localhost:3000/health > /dev/null; then
            echo -e "${GREEN}Production deployment complete!${NC}"
        else
            echo -e "${RED}Final health check failed!${NC}"
            exit 1
        fi
        ;;
esac

# Show running containers
echo ""
echo "Running containers:"
docker-compose ps
