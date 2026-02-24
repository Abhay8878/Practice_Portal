# Database Setup Guide

## Important Note
The migration file **only creates the table structure**. It does NOT insert any data. Data will be inserted through the API when you submit the patient form from the frontend.

## Running the Migration

### Option 1: Using psql Command Line (Windows PowerShell/CMD)

```bash
# Navigate to backend directory first
cd backend

# Run the migration
psql -U postgres -d aoapro -f migrations/001-create-patients-table.sql
```

**If you get "psql is not recognized":**
- Add PostgreSQL bin directory to your PATH, or
- Use the full path: `C:\Program Files\PostgreSQL\<version>\bin\psql.exe -U postgres -d aoapro -f migrations\001-create-patients-table.sql`

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on the `aoapro` database
4. Select "Query Tool"
5. Open the file `migrations/001-create-patients-table.sql`
6. Copy and paste the SQL into the query tool
7. Click "Execute" (F5)

### Option 3: Using TypeORM Auto-Sync (Easier for Development)

Since `synchronize: true` is enabled in development mode, TypeORM will automatically create/update the table when you start the server. You can skip the manual migration if you prefer.

**To use this method:**
1. Make sure your `.env` file has correct database credentials
2. Start the NestJS server: `npm run start:dev`
3. TypeORM will automatically create the table if it doesn't exist

### Option 4: Using SQL Script Directly

1. Open your PostgreSQL client (pgAdmin, DBeaver, etc.)
2. Connect to the `aoapro` database
3. Copy the SQL from `migrations/001-create-patients-table.sql`
4. Execute it directly

## Verifying the Table Was Created

Run this query in your PostgreSQL client:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'patients';

-- Check table structure
\d patients

-- Or
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'patients';
```

## Inserting Test Data (Optional)

If you want to insert test data manually, you can run:

```sql
INSERT INTO patients (
  "firstName", "lastName", email, contact, dob, gender, 
  street, country, state, city, "zipCode"
) VALUES (
  'John', 'Doe', 'john.doe@example.com', '+1234567890', 
  '1990-01-15', 'Male', '123 Main St', 'United States', 
  'California', 'Los Angeles', '90001'
);
```

## Troubleshooting

### "psql: command not found"
- **Windows**: Add PostgreSQL bin to PATH or use full path
- **Linux/Mac**: Install PostgreSQL client or use full path

### "password authentication failed"
- Check your PostgreSQL password in `.env` file
- Default password is: `gautam@3210`

### "database aoapro does not exist"
- Create the database first:
  ```sql
  CREATE DATABASE aoapro;
  ```

### "relation patients already exists"
- The table already exists, which is fine
- You can drop and recreate if needed:
  ```sql
  DROP TABLE IF EXISTS patients CASCADE;
  ```
  Then run the migration again

## Data Insertion

**Remember:** The migration only creates the table. To insert data:

1. Start the NestJS backend: `npm run start:dev`
2. Use the frontend form to create patients (data goes to `/patients` endpoint)
3. Or use curl/Postman to POST to `http://localhost:3000/patients`

Example API call:
```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "contact": "+1234567890",
    "dob": "1990-01-15",
    "gender": "Male",
    "street": "123 Main St",
    "country": "United States",
    "state": "California",
    "city": "Los Angeles",
    "zipCode": "90001"
  }'
```
