-- SENTRA Database Initialization
-- This script runs automatically when the PostgreSQL container starts for the first time.

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log success
DO $$
BEGIN
    RAISE NOTICE 'SENTRA database initialized with TimescaleDB and uuid-ossp extensions.';
END $$;

