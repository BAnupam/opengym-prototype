-- Migration: 20261121000000_create_users
-- Creates the initial users table for OpenGym FRD-01.
-- UUID v7 primary key, unique email, display name, IANA time zone, UTC creation time, is_demo defaulting false.

-- UUID v7 generator (RFC 9562). PostgreSQL 16 does not provide a native v7
-- generator, so construct the 48-bit millisecond timestamp and RFC bit layout.
CREATE OR REPLACE FUNCTION uuidv7() RETURNS UUID AS $$
BEGIN
    RETURN (
      lpad(to_hex(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint), 12, '0') ||
      '7' || substr(md5(random()::text), 1, 3) ||
      substr('89ab', floor(random() * 4)::integer + 1, 1) ||
      substr(md5(random()::text), 1, 15)
    )::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    time_zone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_demo BOOLEAN NOT NULL DEFAULT false
);
