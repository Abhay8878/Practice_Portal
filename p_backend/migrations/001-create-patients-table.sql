-- Migration: Create patients table
-- Database: aoapro

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(100) NOT NULL,
  "middleName" VARCHAR(100),
  "lastName" VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  street VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  "zipCode" VARCHAR(20) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients("createdAt");
