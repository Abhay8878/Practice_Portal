# Troubleshooting Guide

## Issue: Migration Command Not Running

### Problem
The `psql` command is not recognized or not working on Windows.

### Solutions

#### Solution 1: Use PowerShell Script (Recommended for Windows)
```powershell
cd backend
.\migrations\run-migration.ps1
```

#### Solution 2: Use Full Path to psql
Find your PostgreSQL installation (usually in `C:\Program Files\PostgreSQL\<version>\bin\`) and use the full path:

```powershell
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d aoapro -f migrations\001-create-patients-table.sql
```

#### Solution 3: Use pgAdmin (Easiest)
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click on `aoapro` database → Query Tool
4. Open `migrations/001-create-patients-table.sql`
5. Copy and paste the SQL
6. Click Execute (F5)

#### Solution 4: Skip Manual Migration (TypeORM Auto-Sync)
Since TypeORM has `synchronize: true` in development, it will automatically create the table when you start the server:

```bash
npm run start:dev
```

The table will be created automatically if it doesn't exist.

---

## Issue: Table Created But No Data

### Important Understanding
**The migration file ONLY creates the table structure. It does NOT insert any data.**

Data insertion happens through:
1. **API calls** when you submit the patient form from the frontend
2. **Manual API calls** using curl/Postman
3. **Direct SQL INSERT** statements (for testing)

### How to Insert Data

#### Method 1: Through Frontend Form (Recommended)
1. Start the backend: `npm run start:dev`
2. Start the frontend
3. Fill out the patient form and submit
4. Data will be saved to the database

#### Method 2: Test Database Connection First
```bash
npm run test:db
```

This will verify:
- Database connection works
- Table exists
- Current record count

#### Method 3: Manual API Call (Testing)
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

#### Method 4: Direct SQL (For Testing Only)
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

---

## Issue: Data Not Being Inserted via API

### Check These:

1. **Backend is Running**
   ```bash
   npm run start:dev
   ```
   Should see: `Application is running on: http://localhost:3000`

2. **Database Connection**
   ```bash
   npm run test:db
   ```
   Should show successful connection

3. **Table Exists**
   ```bash
   npm run test:db
   ```
   Should show "Patients table exists"

4. **Check Backend Logs**
   When you submit the form, check the terminal running `npm run start:dev` for errors

5. **Check Frontend API Call**
   - Open browser DevTools → Network tab
   - Submit the form
   - Check if request goes to `http://localhost:3000/patients`
   - Check response status and error messages

6. **CORS Issues**
   - Backend CORS is configured for `http://localhost:5173`
   - If frontend runs on different port, update `main.ts`

---

## Common Errors

### "psql: command not found"
**Fix:** Use PowerShell script or full path to psql.exe

### "password authentication failed"
**Fix:** Check `.env` file - password should be `gautam@3210`

### "database aoapro does not exist"
**Fix:** Create database:
```sql
CREATE DATABASE aoapro;
```

### "relation patients already exists"
**Fix:** This is fine! Table already exists. You can proceed.

### "Cannot connect to database"
**Fix:**
1. Check PostgreSQL service is running
2. Verify credentials in `.env`
3. Check if port 5432 is correct
4. Run `npm run test:db` to diagnose

---

## Quick Verification Steps

1. **Test Database Connection:**
   ```bash
   npm run test:db
   ```

2. **Start Backend:**
   ```bash
   npm run start:dev
   ```

3. **Verify API Endpoint:**
   ```bash
   curl http://localhost:3000/patients
   ```
   Should return `[]` (empty array) if no data, or list of patients

4. **Check Table in Database:**
   ```sql
   SELECT * FROM patients;
   ```

---

## Still Having Issues?

1. Check all error messages carefully
2. Verify PostgreSQL is running
3. Verify database `aoapro` exists
4. Check `.env` file has correct credentials
5. Run `npm run test:db` to diagnose connection issues
6. Check backend logs when submitting form
