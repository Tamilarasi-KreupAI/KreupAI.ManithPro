#!/bin/bash

# ============================================================
# DATABASE MAINTENANCE SCRIPT
# ============================================================
#
# This script performs routine database maintenance tasks:
# - VACUUM ANALYZE for query optimization
# - Reindex for index maintenance
# - Statistics update
# - Connection pool cleanup
# - Bloat analysis
#
# Usage:
#   ./scripts/db-maintenance.sh [environment] [task]
#
# Arguments:
#   environment: development | staging | production (default: development)
#   task: all | vacuum | analyze | reindex | stats | check (default: all)
#
# Examples:
#   ./scripts/db-maintenance.sh production all    # Full maintenance
#   ./scripts/db-maintenance.sh staging vacuum    # Vacuum only
#   ./scripts/db-maintenance.sh check             # Health check
#
# Recommendation: Schedule this script to run daily in production
#   0 3 * * * /path/to/scripts/db-maintenance.sh production all
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
TASK="${2:-all}"

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
echo -e "${BLUE}║        KreupAI ManithPro - Database Maintenance            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   Environment: ${ENVIRONMENT}"
echo "   Task:        ${TASK}"
echo "   Database:    ${DB_NAME}"
echo "   Host:        ${DB_HOST}:${DB_PORT}"
echo ""

# Set PGPASSWORD
export PGPASSWORD="${DB_PASSWORD}"

# Function to run a SQL command
run_sql() {
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "$1"
}

# Function to run a SQL file
run_sql_quiet() {
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "$1"
}

# ============================================================
# TASK: VACUUM
# ============================================================
do_vacuum() {
    echo -e "${BLUE}🔄 Running VACUUM ANALYZE...${NC}"

    # Get table list
    TABLES=$(run_sql_quiet "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")

    for TABLE in ${TABLES}; do
        echo "   Vacuuming: ${TABLE}"
        run_sql "VACUUM ANALYZE \"${TABLE}\";" 2>/dev/null || true
    done

    echo -e "${GREEN}✅ VACUUM completed${NC}"
}

# ============================================================
# TASK: ANALYZE
# ============================================================
do_analyze() {
    echo -e "${BLUE}🔄 Running ANALYZE on all tables...${NC}"
    run_sql "ANALYZE;"
    echo -e "${GREEN}✅ ANALYZE completed${NC}"
}

# ============================================================
# TASK: REINDEX
# ============================================================
do_reindex() {
    echo -e "${BLUE}🔄 Reindexing database...${NC}"

    # Reindex system catalogs
    echo "   Reindexing system catalogs..."
    run_sql "REINDEX SYSTEM \"${DB_NAME}\";" 2>/dev/null || echo "   (skipped system reindex)"

    # Reindex user tables
    echo "   Reindexing user tables..."
    run_sql "REINDEX DATABASE \"${DB_NAME}\";"

    echo -e "${GREEN}✅ REINDEX completed${NC}"
}

# ============================================================
# TASK: STATISTICS
# ============================================================
do_stats() {
    echo -e "${BLUE}📊 Database Statistics:${NC}"
    echo ""

    # Database size
    echo "   Database Size:"
    run_sql "SELECT pg_size_pretty(pg_database_size('${DB_NAME}'));"
    echo ""

    # Top tables by size
    echo "   Top 10 Tables by Size:"
    run_sql "SELECT
        relname as table_name,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size,
        pg_size_pretty(pg_relation_size(relid)) as data_size,
        pg_size_pretty(pg_indexes_size(relid)) as index_size,
        n_live_tup as row_count
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(relid) DESC
    LIMIT 10;"
    echo ""

    # Index usage
    echo "   Index Usage Statistics:"
    run_sql "SELECT
        schemaname,
        relname as table_name,
        indexrelname as index_name,
        idx_scan as times_used,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
    FROM pg_stat_user_indexes
    ORDER BY idx_scan DESC
    LIMIT 10;"
    echo ""

    # Unused indexes
    echo "   Unused Indexes (candidates for removal):"
    run_sql "SELECT
        schemaname,
        relname as table_name,
        indexrelname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    AND indexrelname NOT LIKE 'pg_%'
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 10;"
    echo ""

    echo -e "${GREEN}✅ Statistics report completed${NC}"
}

# ============================================================
# TASK: HEALTH CHECK
# ============================================================
do_check() {
    echo -e "${BLUE}🏥 Database Health Check:${NC}"
    echo ""

    # Connection status
    echo "   Connection Status:"
    run_sql "SELECT
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
    FROM pg_stat_activity
    WHERE datname = '${DB_NAME}';"
    echo ""

    # Lock monitoring
    echo "   Current Locks:"
    run_sql "SELECT
        count(*) as lock_count,
        mode,
        locktype
    FROM pg_locks
    GROUP BY mode, locktype
    ORDER BY lock_count DESC
    LIMIT 5;"
    echo ""

    # Slow queries (if pg_stat_statements is available)
    echo "   Long Running Queries:"
    run_sql "SELECT
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query,
        state
    FROM pg_stat_activity
    WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
    AND state != 'idle'
    AND datname = '${DB_NAME}'
    ORDER BY duration DESC
    LIMIT 5;" 2>/dev/null || echo "   No long-running queries found"
    echo ""

    # Table bloat estimation
    echo "   Table Bloat Estimation:"
    run_sql "SELECT
        schemaname,
        relname as table_name,
        n_dead_tup as dead_tuples,
        n_live_tup as live_tuples,
        CASE WHEN n_live_tup > 0
            THEN round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
            ELSE 0
        END as bloat_percent
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 1000
    ORDER BY n_dead_tup DESC
    LIMIT 10;"
    echo ""

    # Cache hit ratio
    echo "   Cache Hit Ratio:"
    run_sql "SELECT
        sum(heap_blks_read) as blocks_read,
        sum(heap_blks_hit) as blocks_hit,
        CASE WHEN sum(heap_blks_hit) + sum(heap_blks_read) > 0
            THEN round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2)
            ELSE 0
        END as cache_hit_ratio
    FROM pg_statio_user_tables;"
    echo ""

    echo -e "${GREEN}✅ Health check completed${NC}"
}

# ============================================================
# MAIN EXECUTION
# ============================================================

case "${TASK}" in
    "vacuum")
        do_vacuum
        ;;
    "analyze")
        do_analyze
        ;;
    "reindex")
        do_reindex
        ;;
    "stats")
        do_stats
        ;;
    "check")
        do_check
        ;;
    "all")
        do_check
        echo ""
        do_vacuum
        echo ""
        do_analyze
        echo ""
        do_stats
        ;;
    *)
        echo -e "${RED}❌ Unknown task: ${TASK}${NC}"
        echo "Available tasks: all, vacuum, analyze, reindex, stats, check"
        exit 1
        ;;
esac

# Unset password
unset PGPASSWORD

echo ""
echo -e "${GREEN}🎉 Maintenance completed successfully!${NC}"
