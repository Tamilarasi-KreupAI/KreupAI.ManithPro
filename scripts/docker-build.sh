#!/bin/bash
# KreupAI ManithPro - Docker Build Script
# Usage: ./scripts/docker-build.sh [environment] [service]
# Example: ./scripts/docker-build.sh production backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-development}
SERVICE=${2:-all}
REGISTRY=${DOCKER_REGISTRY:-""}
VERSION=${VERSION:-$(date +%Y%m%d%H%M%S)}

echo -e "${GREEN}=== ManithPro Docker Build ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Service: $SERVICE"
echo "Version: $VERSION"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use development, staging, or production.${NC}"
    exit 1
fi

# Set build target based on environment
if [ "$ENVIRONMENT" = "development" ]; then
    BUILD_TARGET="development"
else
    BUILD_TARGET="production"
fi

# Build function
build_service() {
    local service=$1
    local context=$2
    local dockerfile=$3

    echo -e "${YELLOW}Building $service...${NC}"

    local tag="manithpro-$service:$VERSION"
    if [ -n "$REGISTRY" ]; then
        tag="$REGISTRY/manithpro-$service:$VERSION"
    fi

    docker build \
        --target $BUILD_TARGET \
        --build-arg NODE_ENV=$ENVIRONMENT \
        --tag $tag \
        --tag manithpro-$service:latest \
        --file $dockerfile \
        $context

    echo -e "${GREEN}✓ Built $service: $tag${NC}"
}

# Build services
case $SERVICE in
    backend)
        build_service "backend" "./backend" "./backend/Dockerfile"
        ;;
    frontend)
        build_service "frontend" "./frontend" "./frontend/Dockerfile"
        ;;
    nginx)
        docker build \
            --tag manithpro-nginx:$VERSION \
            --tag manithpro-nginx:latest \
            --file ./nginx/Dockerfile \
            ./nginx
        echo -e "${GREEN}✓ Built nginx${NC}"
        ;;
    all)
        build_service "backend" "./backend" "./backend/Dockerfile"
        build_service "frontend" "./frontend" "./frontend/Dockerfile"
        docker build \
            --tag manithpro-nginx:$VERSION \
            --tag manithpro-nginx:latest \
            --file ./nginx/Dockerfile \
            ./nginx
        echo -e "${GREEN}✓ Built nginx${NC}"
        ;;
    *)
        echo -e "${RED}Error: Unknown service '$SERVICE'. Use backend, frontend, nginx, or all.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}=== Build Complete ===${NC}"

# List built images
echo ""
echo "Built images:"
docker images | grep manithpro | head -10
