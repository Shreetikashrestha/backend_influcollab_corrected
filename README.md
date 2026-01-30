# Re-WebAPI Backend

Backend API for Mobile App Year 3 Assignment built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication (register/login) with JWT
- Password hashing with bcrypt
- MongoDB database integration
- TypeScript for type safety
- Zod for schema validation
- Admin routes with role-based access control
- CORS enabled
- Environment variable configuration

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
│   └── admin/       # Admin-specific controllers
├── database/        # Database connection
├── dtos/            # Data Transfer Objects
├── errors/          # Custom error classes
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── repositories/    # Database repositories
├── routes/          # API routes
│   └── admin/      # Admin routes
├── services/        # Business logic
├── types/           # TypeScript types
└── index.ts         # Application entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5050
MONGODB_URI=mongodb://localhost:27017/redomobile_backend
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

3. Make sure MongoDB is running on your system

4. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Admin (requires authentication and admin role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Health Check
- `GET /api/health` - Check server status

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Zod for validation
- CORS
- dotenv

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```
