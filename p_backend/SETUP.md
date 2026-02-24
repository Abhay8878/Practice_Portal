# Backend Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **PostgreSQL** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Make sure PostgreSQL service is running

## Installation Steps

### 1. Install Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Create PostgreSQL Database

Connect to PostgreSQL and create the database:

```bash
# Using psql command line
psql -U postgres

# Then run:
CREATE DATABASE aoapro;
\q
```

Or using pgAdmin or any PostgreSQL client, create a database named `aoapro`.

### 3. Run Database Migration

Execute the SQL migration file to create the patients table:

```bash
# Using psql
psql -U postgres -d aoapro -f migrations/001-create-patients-table.sql
```

Or manually run the SQL from `migrations/001-create-patients-table.sql` in your PostgreSQL client.

### 4. Configure Environment Variables

The `.env` file is already configured with:
- Database: `aoapro`
- Username: `postgres`
- Password: `gautam@3210`
- Port: `3000`

If your PostgreSQL setup differs, update the `.env` file accordingly.

### 5. Start the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Testing the API

### Create a Patient

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

### Get All Patients

```bash
curl http://localhost:3000/patients
```

### Get Patient by ID

```bash
curl http://localhost:3000/patients/{patient-id}
```

## API Endpoints

- `POST /patients` - Create a new patient
- `GET /patients` - Get all patients (ordered by creation date, newest first)
- `GET /patients/:id` - Get a specific patient by ID
- `PATCH /patients/:id` - Update a patient
- `DELETE /patients/:id` - Delete a patient

## Frontend Integration

The frontend is configured to connect to `http://localhost:3000` (see `frontend/src/api/axios.ts`).

Make sure:
1. Backend is running on port 3000
2. CORS is enabled (already configured in `main.ts`)
3. Frontend is running on port 5173 (Vite default)

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready` or check services
- Verify database exists: `psql -U postgres -l | grep aoapro`
- Check credentials in `.env` file
- Verify port 5432 is not blocked

### Port Already in Use

If port 3000 is already in use:
- Change `PORT` in `.env` file
- Update frontend `axios.ts` baseURL accordingly

### TypeORM Synchronization

In development, `synchronize: true` is enabled, which auto-creates/updates tables.
In production, set `NODE_ENV=production` and use migrations instead.
