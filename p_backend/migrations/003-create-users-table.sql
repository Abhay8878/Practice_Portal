-- Migration: Create users table for staff
-- Database: aoapro

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(100) NOT NULL,
  "middleName" VARCHAR(100),
  "lastName" VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  "phoneNumber" VARCHAR(20) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  specialization VARCHAR(50),
  "practitionerType" VARCHAR(20) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update address table to support both patients and users
-- Add entityType column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'address' AND column_name = 'entityType'
  ) THEN
    ALTER TABLE address ADD COLUMN "entityType" VARCHAR(20);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");
CREATE INDEX IF NOT EXISTS idx_address_entity_type ON address("entityType");
