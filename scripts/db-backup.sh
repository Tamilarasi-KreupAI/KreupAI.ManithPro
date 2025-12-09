#!/bin/bash

# ============================================================
# DATABASE BACKUP SCRIPT
# ============================================================
#
# This script creates backups of the PostgreSQL database
# with support for different environments and backup retention.
#
# Usage:
#   ./scripts/db-backup.sh [environment] [backup_type]
#
# Arguments:
#   environment: development | staging | production (default: development)
#   backup_type: full | schema | data (default: full)
#
# Examples:
#   ./scripts/db-backup.sh                    # Full backup of development
#   ./scripts/db-backup.sh production full    # Full backup of production
#   ./scripts/db-backup.sh staging schema     # Schema-only backup of staging
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-development}"
BACKUP_TYPE="${2:-full}"
BACKUP_DIR="./backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Load environment variables
if [ -f "./backend/.env.${ENVIRONMENT}" ]; then
    export $(grep -v '^#' "./backend/.env.${ENVIRONMENT}" | xargs)
fi

# Database connection settings
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-manithpro_dev}"
DB_USER="${DB_USER:-manithpro}"
DB_PASSWORD="${DB_PASSWORD:-manithpro_dev}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           KreupAI ManithPro - Database Backup              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create backup directory
mkdir -p "${BACKUP_DIR}/${ENVIRONMENT}"

# Backup file name
BACKUP_FILE="${BACKUP_DIR}/${ENVIRONMENT}/${DB_NAME}_${BACKUP_TYPE}_${TIMESTAMP}"

echo -e "${YELLOW}📋 Backup Configuration:${NC}"
echo "   Environment: ${ENVIRONMENT}"
echo "   Backup Type: ${BACKUP_TYPE}"
echo "   Database:    ${DB_NAME}"
echo "   Host:        ${DB_HOST}:${DB_PORT}"
echo "   Timestamp:   ${TIMESTAMP}"
echo ""

# Set PGPASSWORD for pg_dump
export PGPASSWORD="${DB_PASSWORD}"

# Perform backup based on type
echo -e "${BLUE}🔄 Starting backup...${NC}"

case "${BACKUP_TYPE}" in
    "full")
        echo "   Creating full backup (schema + data)..."
        pg_dump \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" \
            -F c \
            -f "${BACKUP_FILE}.dump"

        # Also create a plain SQL backup
        pg_dump \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" \
            -F p \
            -f "${BACKUP_FILE}.sql"
        ;;

    "schema")
        echo "   Creating schema-only backup..."
        pg_dump \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" \
            -s \
            -F p \
            -f "${BACKUP_FILE}_schema.sql"
        ;;

    "data")
        echo "   Creating data-only backup..."
        pg_dump \
            -h "${DB_HOST}" \
            -p "${DB_PORT}" \
            -U "${DB_USER}" \
            -d "${DB_NAME}" \
            -a \
            -F c \
            -f "${BACKUP_FILE}_data.dump"
        ;;

    *)
        echo -e "${RED}❌ Unknown backup type: ${BACKUP_TYPE}${NC}"
        exit 1
        ;;
esac

# Compress SQL backups
echo "   Compressing backup files..."
find "${BACKUP_DIR}/${ENVIRONMENT}" -name "*.sql" -newer "${BACKUP_DIR}/${ENVIRONMENT}" -exec gzip {} \;

# Get backup size
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${ENVIRONMENT}" | cut -f1)

echo ""
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📦 Backup Details:${NC}"
echo "   Location: ${BACKUP_DIR}/${ENVIRONMENT}/"
echo "   Size:     ${BACKUP_SIZE}"
echo "   Files:"
ls -la "${BACKUP_DIR}/${ENVIRONMENT}/" | grep "${TIMESTAMP}" | awk '{print "      - " $9 " (" $5 " bytes)"}'

# Cleanup old backups
echo ""
echo -e "${BLUE}🧹 Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
OLD_BACKUPS=$(find "${BACKUP_DIR}/${ENVIRONMENT}" -name "*.dump" -o -name "*.sql.gz" -mtime +${RETENTION_DAYS} 2>/dev/null | wc -l)

if [ "${OLD_BACKUPS}" -gt 0 ]; then
    find "${BACKUP_DIR}/${ENVIRONMENT}" -name "*.dump" -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}/${ENVIRONMENT}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
    echo "   Removed ${OLD_BACKUPS} old backup file(s)"
else
    echo "   No old backups to remove"
fi

# Unset password
unset PGPASSWORD

echo ""
echo -e "${GREEN}🎉 Backup process completed!${NC}"
echo ""

# Print restore instructions
echo -e "${YELLOW}📖 To restore this backup, run:${NC}"
echo "   ./scripts/db-restore.sh ${ENVIRONMENT} ${BACKUP_FILE}.dump"
echo ""
