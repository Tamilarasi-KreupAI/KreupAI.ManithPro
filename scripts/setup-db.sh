#!/bin/bash
# KreupAI ManithPro - Database Setup Script
# Usage: ./scripts/setup-db.sh [action]
# Actions: migrate, seed, reset, backup, restore

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ACTION=${1:-migrate}
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_DIR="$PROJECT_DIR/backups"

echo -e "${GREEN}=== ManithPro Database Setup ===${NC}"
echo "Action: $ACTION"

cd "$PROJECT_DIR/backend"

case $ACTION in
    migrate)
        echo -e "${YELLOW}Running database migrations...${NC}"
        npx prisma migrate deploy
        echo -e "${GREEN}✓ Migrations complete${NC}"
        ;;

    generate)
        echo -e "${YELLOW}Generating Prisma client...${NC}"
        npx prisma generate
        echo -e "${GREEN}✓ Prisma client generated${NC}"
        ;;

    seed)
        echo -e "${YELLOW}Seeding database...${NC}"
        npx prisma db seed
        echo -e "${GREEN}✓ Database seeded${NC}"
        ;;

    reset)
        echo -e "${RED}WARNING: This will delete all data!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}Resetting database...${NC}"
            npx prisma migrate reset --force
            echo -e "${GREEN}✓ Database reset complete${NC}"
        else
            echo "Cancelled."
        fi
        ;;

    backup)
        echo -e "${YELLOW}Creating database backup...${NC}"
        mkdir -p "$BACKUP_DIR"

        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/manithpro_backup_$TIMESTAMP.sql"

        # Get database URL components
        if [ -z "$DATABASE_URL" ]; then
            source .env 2>/dev/null || source .env.development 2>/dev/null || true
        fi

        # Extract connection details from DATABASE_URL
        if [ -n "$DATABASE_URL" ]; then
            # Parse PostgreSQL URL
            DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
            DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
            DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

            # Create backup using pg_dump
            PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
            pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE"

            echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
        else
            # Docker backup fallback
            docker exec manithpro-postgres pg_dump -U manithpro -F c manithpro > "$BACKUP_FILE"
            echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
        fi
        ;;

    restore)
        BACKUP_FILE=$2
        if [ -z "$BACKUP_FILE" ]; then
            echo "Usage: ./setup-db.sh restore <backup_file>"
            echo ""
            echo "Available backups:"
            ls -la "$BACKUP_DIR"/*.sql 2>/dev/null || echo "No backups found."
            exit 1
        fi

        echo -e "${RED}WARNING: This will overwrite current database!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}Restoring database from $BACKUP_FILE...${NC}"

            if [ -n "$DATABASE_URL" ]; then
                DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
                DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
                DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
                DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

                PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
                pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$BACKUP_FILE"
            else
                docker exec -i manithpro-postgres pg_restore -U manithpro -d manithpro -c < "$BACKUP_FILE"
            fi

            echo -e "${GREEN}✓ Database restored${NC}"
        else
            echo "Cancelled."
        fi
        ;;

    studio)
        echo -e "${YELLOW}Opening Prisma Studio...${NC}"
        npx prisma studio
        ;;

    status)
        echo -e "${YELLOW}Checking migration status...${NC}"
        npx prisma migrate status
        ;;

    *)
        echo "Usage: $0 {migrate|generate|seed|reset|backup|restore|studio|status}"
        echo ""
        echo "Actions:"
        echo "  migrate  - Run pending migrations"
        echo "  generate - Generate Prisma client"
        echo "  seed     - Seed database with initial data"
        echo "  reset    - Reset database (DESTRUCTIVE)"
        echo "  backup   - Create database backup"
        echo "  restore  - Restore from backup"
        echo "  studio   - Open Prisma Studio"
        echo "  status   - Check migration status"
        exit 1
        ;;
esac
