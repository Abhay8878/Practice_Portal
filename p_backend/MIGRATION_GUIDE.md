# Database Migration Guide - Patients and Address Tables

## Overview

The database structure has been updated to separate patient information from address details:
- **patients** table: Contains personal information (name, email, contact, dob, gender)
- **address** table: Contains address details with foreign key reference to patients

## Database Schema

### Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  middleName VARCHAR(100),
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Address Table
```sql
CREATE TABLE address (
  address_id SERIAL PRIMARY KEY,
  house_no VARCHAR(20),
  street VARCHAR(100),
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  zipCode VARCHAR(15) NOT NULL,
  address_type VARCHAR(15),
  user_id UUID REFERENCES patients(id) ON DELETE SET NULL ON UPDATE CASCADE,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## Migration Steps

### Option 1: Run SQL Migration (Recommended)

1. **Drop existing patients table** (if it exists with old structure):
   ```sql
   DROP TABLE IF EXISTS patients CASCADE;
   ```

2. **Run the migration script**:
   ```bash
   psql -U postgres -d aoapro -f migrations/002-create-patients-and-address-tables.sql
   ```

   Or use PowerShell:
   ```powershell
   .\migrations\run-migration.ps1
   ```

### Option 2: Use TypeORM Auto-Sync (Development Only)

If `synchronize: true` is enabled in development:
1. Start the NestJS server: `npm run start:dev`
2. TypeORM will automatically create/update tables based on entities

**Note:** This will drop and recreate tables, so existing data will be lost!

## API Changes

### Request Format

**Before:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001"
}
```

**After:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001",
    "house_no": "123",  // Optional
    "address_type": "Home"  // Optional
  }
}
```

### Response Format

The API now returns patients with an `addresses` array:
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "addresses": [
    {
      "address_id": 1,
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    }
  ]
}
```

## Frontend Changes

The frontend has been updated to:
1. Use nested address structure in forms
2. Handle `addresses` array from API responses
3. Display address from either `address` object or `addresses[0]`

## Testing

1. **Start the backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Test creating a patient:**
   ```bash
   curl -X POST http://localhost:3000/patients \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "contact": "+1234567890",
       "dob": "1990-01-15",
       "gender": "Male",
       "address": {
         "street": "123 Main St",
         "city": "New York",
         "state": "NY",
         "country": "USA",
         "zipCode": "10001"
       }
     }'
   ```

3. **Verify data in database:**
   ```sql
   -- Check patients
   SELECT * FROM patients;
   
   -- Check addresses
   SELECT * FROM address;
   
   -- Join query
   SELECT p.*, a.* 
   FROM patients p 
   LEFT JOIN address a ON p.id = a.user_id;
   ```

## Important Notes

1. **Foreign Key:** The `address.user_id` references `patients.id`
2. **Cascade:** Deleting a patient sets `user_id` to NULL in address (ON DELETE SET NULL)
3. **Multiple Addresses:** The structure supports multiple addresses per patient (future enhancement)
4. **Required Fields:** City, State, Country, and ZipCode are required in address
5. **Optional Fields:** House number, street, and address_type are optional

## Troubleshooting

### Error: "relation patients does not exist"
- Run the migration script first
- Or let TypeORM auto-sync create the tables

### Error: "foreign key constraint fails"
- Make sure patients table exists before creating address table
- Check that the foreign key references the correct column

### Data not saving
- Check that address object is properly nested in the request
- Verify all required address fields are provided
- Check backend logs for validation errors
