-- KreupAI ManithPro - Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO manithpro;
GRANT ALL ON ALL TABLES IN SCHEMA public TO manithpro;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO manithpro;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO manithpro;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO manithpro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO manithpro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO manithpro;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'ManithPro database initialized successfully';
END $$;
