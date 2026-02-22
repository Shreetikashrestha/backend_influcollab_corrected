# InfluCollab API Documentation

## Base URL
```
http://localhost:5050/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "isInfluencer": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user"
    }
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/whoami
Authorization: Bearer <token>
```

### Campaigns

#### List All Campaigns
```http
GET /campaigns?page=1&limit=10&category=Fashion&sort=createdAt
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

#### Get Single Campaign
```http
GET /campaigns/:id
Authorization: Bearer <token>
```

#### Create Campaign (Brand only)
```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Summer Fashion Campaign",
  "brandName": "Fashion Brand",
  "category": "Fashion",
  "budgetMin": 5000,
  "budgetMax": 15000,
  "deadline": "2026-12-31",
  "location": "Kathmandu",
  "description": "Looking for fashion influencers...",
  "requirements": ["10k+ followers", "Fashion niche"],
  "deliverables": ["3 Instagram posts", "2 Stories"]
}
```

#### Update Campaign
```http
PATCH /campaigns/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "active"
}
```

#### Apply to Campaign (Influencer only)
```http
POST /campaigns/:id/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I would love to collaborate..."
}
```

### Applications

#### Get My Applications (Influencer)
```http
GET /applications/my?status=pending
Authorization: Bearer <token>
```

#### Get Campaign Applications (Brand)
```http
GET /applications/campaign/:campaignId?status=pending
Authorization: Bearer <token>
```

#### Get Single Application
```http
GET /applications/:id
Authorization: Bearer <token>
```

#### Update Application Status (Brand only)
```http
PATCH /applications/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

### Notifications

#### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PATCH /notifications/mark-all-read
Authorization: Bearer <token>
```

### Profiles

#### Get My Profile
```http
GET /profiles/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /profiles/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Fashion influencer...",
  "socialLinks": {
    "instagram": "https://instagram.com/username",
    "tiktok": "https://tiktok.com/@username",
    "facebook": "https://facebook.com/username"
  }
}
```

### Admin (Admin only)

#### Get All Users
```http
GET /users/admin/all?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Get All Campaigns (Admin)
```http
GET /campaigns?page=1&limit=10
Authorization: Bearer <admin_token>
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per 15 minutes per IP

## WebSocket Events (Socket.IO)
Connect to `http://localhost:5050` with authentication token.

**Events:**
- `notification` - New notification received
- `application_update` - Application status changed
- `message` - New message received
