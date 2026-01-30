# API Testing Reference

## Base URL
```
http://localhost:5050/api
```

## Authentication Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "John Doe",
  "isInfluencer": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "isInfluencer": true,
    "createdAt": "2026-01-20T10:30:00.000Z"
  },
  "message": "Registration successful"
}
```

### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "profilePicture": "https://example.com/photo.jpg",
      "createdAt": "2026-01-20T10:30:00.000Z"
    }
  },
  "message": "Login successful"
}
```

## Admin Endpoints (Require Authentication + Admin Role)

**Note:** All admin endpoints require the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### 3. Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "profilePicture": "https://example.com/photo.jpg",
      "isInfluencer": true,
      "createdAt": "2026-01-20T10:30:00.000Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

### 4. Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer <token>
```

### 5. Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated Doe",
  "isInfluencer": false
}
```

### 6. Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  },
  "message": "User deleted successfully"
}
```

## Health Check

### 7. Server Health
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized, Token missing"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Email already in use"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Testing with curl

### Register
```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "fullName": "Test User",
    "isInfluencer": true
  }'
```

### Login
```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Get All Users (Admin)
```bash
curl -X GET http://localhost:5050/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Creating an Admin User

By default, users are created with role 'user'. To create an admin:

1. Register a user normally
2. Manually update in MongoDB:
```javascript
db.users.updateOne(
  { username: "adminuser" },
  { $set: { role: "admin" } }
)
```

Or update via the update endpoint after getting a token.
