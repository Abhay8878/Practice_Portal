# AOA Backend - NestJS API

This is the backend API for the AOA Practice application, built with NestJS and PostgreSQL.

## Features

- RESTful API with NestJS
- PostgreSQL database integration
- Industry-level validation using class-validator
- Proper error handling
- CORS enabled for frontend communication
- TypeORM for database operations

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database named `aoapro`:
```sql
CREATE DATABASE aoapro;
```

3. Update the `.env` file with your database credentials if needed.

## Running the Application

### Development Mode
```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

### Production Mode
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Patients

- `POST /patients` - Create a new patient
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get a patient by ID
- `PATCH /patients/:id` - Update a patient
- `DELETE /patients/:id` - Delete a patient

## Database Schema

The `patients` table includes the following fields:
- id (UUID, Primary Key)
- firstName (VARCHAR)
- middleName (VARCHAR, nullable)
- lastName (VARCHAR)
- email (VARCHAR, unique)
- contact (VARCHAR)
- dob (DATE)
- gender (VARCHAR)
- street (VARCHAR)
- country (VARCHAR)
- state (VARCHAR)
- city (VARCHAR)
- zipCode (VARCHAR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)

## Validation

The API includes comprehensive validation for all patient fields:
- Required field validation
- Email format validation
- Contact number format validation
- String length validation
- Date format validation
- Enum validation for gender

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 404: Not Found
- 409: Conflict (duplicate email)
- 500: Internal Server Error
