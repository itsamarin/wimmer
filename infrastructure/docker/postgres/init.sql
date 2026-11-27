-- Wimmer PostgreSQL initialisation script
-- Creates the wimmer database (if it does not already exist) and
-- grants all privileges to the wimmer role.

-- Create the wimmer role if it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'wimmer'
  ) THEN
    CREATE ROLE wimmer WITH LOGIN PASSWORD 'wimmer';
  END IF;
END
$$;

-- PostgreSQL does not support CREATE DATABASE inside a transaction block,
-- so we use a DO block that calls dblink to run it outside the transaction.
-- As an alternative (simpler) approach supported by the official postgres
-- Docker image: the POSTGRES_DB env-var already creates the database before
-- this script runs, so we just ensure the role has full access.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'wimmer'
  ) THEN
    PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE wimmer OWNER wimmer');
  END IF;
EXCEPTION
  WHEN undefined_function THEN
    -- dblink not available; the database was already created by POSTGRES_DB env var.
    NULL;
END
$$;

-- Grant all privileges on the wimmer database to the wimmer role.
GRANT ALL PRIVILEGES ON DATABASE wimmer TO wimmer;

-- Connect to the wimmer database and grant schema privileges.
\connect wimmer

GRANT ALL ON SCHEMA public TO wimmer;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wimmer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wimmer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wimmer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wimmer;
