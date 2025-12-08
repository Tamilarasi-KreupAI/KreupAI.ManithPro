#!/bin/bash
# KreupAI ManithPro - Health Check Script
# Usage: ./scripts/health-check.sh [environment]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENVIRONMENT=${1:-development}

echo -e "${GREEN}=== ManithPro Health Check ===${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Set URLs based on environment
case $ENVIRONMENT in
    development)
        BACKEND_URL="http://localhost:3000"
        FRONTEND_URL="http://localhost:5173"
        ;;
    staging)
        BACKEND_URL="${STAGING_API_URL:-http://staging.manithpro.com}"
        FRONTEND_URL="${STAGING_FRONTEND_URL:-http://staging.manithpro.com}"
        ;;
    production)
        BACKEND_URL="${PRODUCTION_API_URL:-https://api.manithpro.com}"
        FRONTEND_URL="${PRODUCTION_FRONTEND_URL:-https://manithpro.com}"
        ;;
esac

# Track overall status
ALL_HEALTHY=true

# Function to check a service
check_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    printf "%-20s" "$name:"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null || echo "0")

    if [ "$HTTP_CODE" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $HTTP_CODE, ${RESPONSE_TIME}s)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
        ALL_HEALTHY=false
    fi
}

# Function to check database connection
check_database() {
    printf "%-20s" "Database:"

    if docker exec manithpro-postgres pg_isready -U manithpro > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
        ALL_HEALTHY=false
    fi
}

# Function to check Redis
check_redis() {
    printf "%-20s" "Redis:"

    if docker exec manithpro-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
        ALL_HEALTHY=false
    fi
}

# Run checks
echo "Service Status:"
echo "---------------"

check_service "Backend API" "$BACKEND_URL/health"
check_service "Backend Ready" "$BACKEND_URL/ready"
check_service "Frontend" "$FRONTEND_URL"

if [ "$ENVIRONMENT" = "development" ]; then
    check_database
    check_redis
fi

echo ""

# Docker container status
echo "Container Status:"
echo "-----------------"
docker-compose ps 2>/dev/null || echo "Docker Compose not running"

echo ""

# Resource usage
echo "Resource Usage:"
echo "---------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -10 || true

echo ""

# Final status
if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}=== All services healthy ===${NC}"
    exit 0
else
    echo -e "${RED}=== Some services are unhealthy ===${NC}"
    exit 1
fi
