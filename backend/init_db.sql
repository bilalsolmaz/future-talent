DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'localshop_user') THEN
        CREATE ROLE localshop_user WITH LOGIN PASSWORD 'localshop123';
    END IF;
END
$$;

SELECT 'User check complete' AS status;

-- Create database if not exists (will error if exists, that's OK)
-- Run separately: CREATE DATABASE localshop OWNER localshop_user;
