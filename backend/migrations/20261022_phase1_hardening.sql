-- Phase 1 hardening migration (PostgreSQL)
-- Run inside a transaction during a maintenance window.
BEGIN;

ALTER TABLE events
  ALTER COLUMN price TYPE NUMERIC(10, 2) USING ROUND(CAST(price AS NUMERIC), 2);

ALTER TABLE tickets
  ALTER COLUMN price TYPE NUMERIC(10, 2) USING ROUND(CAST(price AS NUMERIC), 2);

COMMIT;
