-- Migration: Create patients and address tables
-- Database: aoapro

-- Create patients table (without address fields)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(100) NOT NULL,
  "middleName" VARCHAR(100),
  "lastName" VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create address table
CREATE TABLE IF NOT EXISTS address (
  address_id SERIAL PRIMARY KEY,
  house_no VARCHAR(20),
  street VARCHAR(100),
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  "zipCode" VARCHAR(15) NOT NULL,
  address_type VARCHAR(15),
  user_id UUID,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_address_patient
    FOREIGN KEY (user_id)
    REFERENCES patients(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients("createdAt");
CREATE INDEX IF NOT EXISTS idx_address_user_id ON address(user_id);
