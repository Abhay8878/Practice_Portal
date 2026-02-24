# API Documentation

## Base URL
```
http://localhost:3000
```

## Patients API

### Create Patient
**POST** `/patients`

Creates a new patient record.

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "Michael",  // Optional
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contact": "+1234567890",
  "dob": "1990-01-15",  // ISO date string (YYYY-MM-DD)
  "gender": "Male",  // One of: "Male", "Female", "Other"
  "street": "123 Main Street",
  "country": "United States",
  "state": "California",
  "city": "Los Angeles",
  "zipCode": "90001"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-here",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contact": "+1234567890",
  "dob": "1990-01-15T00:00:00.000Z",
  "gender": "Male",
  "street": "123 Main Street",
  "country": "United States",
  "state": "California",
  "city": "Los Angeles",
  "zipCode": "90001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Validation Errors:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": [
    "First name is required",
    "Email must be an email"
  ],
  "error": "Bad Request"
}
```

**Conflict Error:** `409 Conflict` (if email already exists)
```json
{
  "statusCode": 409,
  "message": "Patient with email john.doe@example.com already exists",
  "error": "Conflict"
}
```

---

### Get All Patients
**GET** `/patients`

Retrieves all patients, ordered by creation date (newest first).

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    ...
  },
  {
    "id": "uuid-2",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    ...
  }
]
```

---

### Get Patient by ID
**GET** `/patients/:id`

Retrieves a specific patient by their UUID.

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contact": "+1234567890",
  "dob": "1990-01-15T00:00:00.000Z",
  "gender": "Male",
  "street": "123 Main Street",
  "country": "United States",
  "state": "California",
  "city": "Los Angeles",
  "zipCode": "90001",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Not Found:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Patient with ID uuid-here not found",
  "error": "Not Found"
}
```

---

### Update Patient
**PATCH** `/patients/:id`

Updates a patient record. All fields are optional - only provided fields will be updated.

**Request Body:**
```json
{
  "firstName": "Johnny",  // Optional - only include fields to update
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "firstName": "Johnny",
  ...
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### Delete Patient
**DELETE** `/patients/:id`

Deletes a patient record.

**Response:** `204 No Content`

**Not Found:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Patient with ID uuid-here not found",
  "error": "Not Found"
}
```

---

## Validation Rules

### Required Fields
- `firstName` - String, 1-100 characters
- `lastName` - String, 1-100 characters
- `email` - Valid email format, max 255 characters, unique
- `contact` - Valid phone number format, max 20 characters
- `dob` - Valid date string (YYYY-MM-DD)
- `gender` - One of: "Male", "Female", "Other"
- `street` - String, 1-255 characters
- `country` - String, 1-100 characters
- `state` - String, 1-100 characters
- `city` - String, 1-100 characters
- `zipCode` - String, 3-20 characters, alphanumeric with spaces and hyphens

### Optional Fields
- `middleName` - String, max 100 characters

## Error Responses

All error responses follow this format:
```json
{
  "statusCode": <HTTP_STATUS_CODE>,
  "message": <ERROR_MESSAGE_OR_ARRAY>,
  "error": <ERROR_TYPE>
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error
