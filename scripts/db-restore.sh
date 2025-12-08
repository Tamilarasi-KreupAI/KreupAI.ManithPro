#!/bin/bash

# ============================================================
# DATABASE RESTORE SCRIPT
# ============================================================
#
# This script restores a PostgreSQL database from a backup file.
#
# Usage:
#   ./scripts/db-restore.sh [environment] [backup_file]
#
# Arguments:
#   environment: development | staging | production
#   backup_file: Path to the backup file (.dump or .sql.gz)
#
# Examples:
#   ./scripts/db-restore.sh development ./backups/development/manithpro_dev_full_20241207.dump
#   ./scripts/db-restore.sh staging ./backups/staging/manithpro_staging_full_20241207.dump
#
# WARNING: This will DROP the existing database and recreate it!
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-}"
BACKUP_FILE="${2:-}"

# Validate arguments
if [ -z "${ENVIRONMENT}" ] || [ -z "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Usage: ./scripts/db-restore.sh [environment] [backup_file]${NC}"
    echo ""
    echo "Available environments: development, staging, production"
    echo ""
    echo "Example:"
    echo "  ./scripts/db-restore.sh development ./backups/development/manithpro_dev_full_20241207.dump"
    exit 1
fi

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

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
echo -e "${BLUE}║          KreupAI ManithPro - Database Restore              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Restore Configuration:${NC}"
echo "   Environment:  ${ENVIRONMENT}"
echo "   Backup File:  ${BACKUP_FILE}"
echo "   Database:     ${DB_NAME}"
echo "   Host:         ${DB_HOST}:${DB_PORT}"
echo ""

# Production safety check
if [ "${ENVIRONMENT}" = "production" ]; then
    echo -e "${RED}⚠️  WARNING: You are about to restore the PRODUCTION database!${NC}"
    echo -e "${RED}   This will DELETE all existing data!${NC}"
    echo ""
    read -p "Type 'RESTORE PRODUCTION' to confirm: " CONFIRM
    if [ "${CONFIRM}" != "RESTORE PRODUCTION" ]; then
        echo -e "${RED}❌ Restore cancelled.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  WARNING: This will DROP the database '${DB_NAME}' and restore from backup.${NC}"
    read -p "Continue? (y/N): " CONFIRM
    if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
        echo -e "${RED}❌ Restore cancelled.${NC}"
        exit 1
    fi
fi

echo ""

# Set PGPASSWORD for psql/pg_restore
export PGPASSWORD="${DB_PASSWORD}"

# Drop and recreate database
echo -e "${BLUE}🔄 Dropping existing database...${NC}"
psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "postgres" \
    -c "DROP DATABASE IF EXISTS \"${DB_NAME}\";"

echo -e "${BLUE}🔄 Creating new database...${NC}"
psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "postgres" \
    -c "CREATE DATABASE \"${DB_NAME}\" OWNER \"${DB_USER}\";"

# Restore based on file type
echo -e "${BLUE}🔄 Restoring from backup...${NC}"

if [[ "${BACKUP_FILE}" == *.dump ]]; then
    # Custom format backup
    pg_restore \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -v \
        --no-owner \
        --no-privileges \
        "${BACKUP_FILE}"
elif [[ "${BACKUP_FILE}" == *.sql.gz ]]; then
    # Compressed SQL backup
    gunzip -c "${BACKUP_FILE}" | psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}"
elif [[ "${BACKUP_FILE}" == *.sql ]]; then
    # Plain SQL backup
    psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f "${BACKUP_FILE}"
else
    echo -e "${RED}❌ Unknown backup file format: ${BACKUP_FILE}${NC}"
    echo "   Supported formats: .dump, .sql, .sql.gz"
    exit 1
fi

# Run Prisma migrations to ensure schema is up to date
echo ""
echo -e "${BLUE}🔄 Running Prisma migrations...${NC}"
cd backend
npx prisma migrate deploy
cd ..

# Analyze tables for query optimization
echo ""
echo -e "${BLUE}🔄 Analyzing tables for query optimization...${NC}"
psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -c "ANALYZE;"

# Unset password
unset PGPASSWORD

echo ""
echo -e "${GREEN}✅ Database restore completed successfully!${NC}"
echo ""

# Show table counts
echo -e "${YELLOW}📊 Restored Tables Summary:${NC}"
export PGPASSWORD="${DB_PASSWORD}"
psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -c "SELECT schemaname, relname as table_name, n_live_tup as row_count
        FROM pg_stat_user_tables
        WHERE n_live_tup > 0
        ORDER BY n_live_tup DESC
        LIMIT 15;"
unset PGPASSWORD

echo ""
echo -e "${GREEN}🎉 Restore process completed!${NC}"
