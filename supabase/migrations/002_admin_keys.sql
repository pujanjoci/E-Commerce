-- =========================================================
-- Migration 002 — Admin Access Keys
-- Adds test_key (plain-text, dev only) and verification_key
-- (bcrypt hash of a numeric string, for future production use)
-- =========================================================

-- Enable pgcrypto so we can use crypt() / gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add columns to admin_users
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS test_key     TEXT,
  ADD COLUMN IF NOT EXISTS verification_key TEXT;

-- =========================================================
-- NOTE: These UPDATE statements will only run if you already
-- have a row in admin_users (i.e. your admin account exists).
-- For a brand-new database, values are set here as defaults
-- and applied to any existing rows.
-- =========================================================

-- Set test_key = 'testkey' on all existing admin rows
UPDATE public.admin_users
  SET test_key = 'testkey'
  WHERE test_key IS NULL;

-- Set verification_key = bcrypt hash of numeric string '20260409'
-- To verify later: SELECT (verification_key = crypt('20260409', verification_key)) FROM public.admin_users;
UPDATE public.admin_users
  SET verification_key = crypt('20260409', gen_salt('bf'))
  WHERE verification_key IS NULL;

-- Also set sensible defaults for NEW rows going forward
ALTER TABLE public.admin_users
  ALTER COLUMN test_key     SET DEFAULT 'testkey',
  ALTER COLUMN verification_key SET DEFAULT crypt('20260409', gen_salt('bf'));
