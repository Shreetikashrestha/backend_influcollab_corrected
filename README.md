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
│   ├── index.ts     # Environment variables
│   └── socket.ts    # Socket.io configuration
├── controllers/      # Request handlers
├── database/        # Database connection
├── dtos/            # Data Transfer Objects
├── errors/          # Custom error classes
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── repositories/    # Database repositories (data access layer)
│   ├── application.repository.ts
│   ├── campaign.repository.ts
│   ├── message.repository.ts
│   ├── notification.repository.ts
│   ├── payment.repository.ts
│   ├── profile.repository.ts
│   ├── review.repository.ts
│   └── user.repository.ts
├── routes/          # API routes
├── services/        # Business logic
├── tests/           # Test files
│   ├── setup.ts    # Test configuration
│   └── integration/ # Integration tests
├── types/           # TypeScript type definitions
├── app.ts           # Express app configuration
└── index.ts         # Application entry point
```

## Architecture

The project follows a layered architecture pattern:

1. **Routes** → Define API endpoints
2. **Controllers** → Handle HTTP requests/responses
3. **Services** → Business logic
4. **Repositories** → Data access layer
5. **Models** → Database schemas

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

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Run production build
npm start
```
