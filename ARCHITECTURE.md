# Architecture Documentation

## Overview

This backend follows a clean, layered architecture pattern inspired by Domain-Driven Design (DDD) and SOLID principles. The separation of concerns ensures maintainability, testability, and scalability.

## Layered Architecture

```
┌─────────────────────────────────────┐
│         Routes (API Layer)          │  ← HTTP endpoints
├─────────────────────────────────────┤
│      Controllers (Presentation)     │  ← Request/Response handling
├─────────────────────────────────────┤
│       Services (Business Logic)     │  ← Core business rules
├─────────────────────────────────────┤
│    Repositories (Data Access)       │  ← Database operations
├─────────────────────────────────────┤
│       Models (Data Layer)           │  ← Database schemas
└─────────────────────────────────────┘
```

## Directory Structure

### `/src/config`
Configuration files for the application.
- `index.ts` - Environment variables and app configuration
- `socket.ts` - Socket.io setup and event handlers

### `/src/routes`
API endpoint definitions. Routes should be thin and only define:
- HTTP methods and paths
- Middleware chains
- Controller method calls

**Example:**
```typescript
router.post('/campaigns', authorizedMiddleware, campaignController.create);
```

### `/src/controllers`
Handle HTTP requests and responses. Controllers should:
- Validate request data (using DTOs/Zod)
- Call appropriate service methods
- Format responses
- Handle errors

**Responsibilities:**
- Extract data from request
- Call service layer
- Return HTTP responses

**Example:**
```typescript
async create(req: Request, res: Response) {
    const data = req.body;
    const result = await campaignService.createCampaign(data);
    res.status(201).json({ success: true, data: result });
}
```

### `/src/services`
Business logic layer. Services should:
- Implement business rules
- Orchestrate multiple repositories
- Handle complex operations
- Validate business constraints

**Responsibilities:**
- Business logic
- Transaction management
- Cross-entity operations

**Example:**
```typescript
async createCampaign(data: CampaignDTO) {
    // Business validation
    if (data.budget < 100) throw new Error('Minimum budget is $100');
    
    // Create campaign
    const campaign = await campaignRepository.create(data);
    
    // Send notification
    await notificationService.notifyNewCampaign(campaign);
    
    return campaign;
}
```

### `/src/repositories`
Data access layer. Repositories should:
- Encapsulate database operations
- Provide clean API for data access
- Handle query complexity
- Return domain models

**Responsibilities:**
- CRUD operations
- Complex queries
- Data aggregation

**Example:**
```typescript
async findById(id: string): Promise<ICampaign | null> {
    return await Campaign.findById(id).populate('brandId');
}
```

### `/src/models`
Mongoose schemas and models. Define:
- Database schema structure
- Validation rules
- Indexes
- Virtual properties
- Instance methods

### `/src/middleware`
Express middleware for:
- Authentication (`authorization.middleware.ts`)
- Role-based access (`admin.middleware.ts`, `brand.middleware.ts`, `influencer.middleware.ts`)
- File uploads (`upload.middleware.ts`)
- Error handling

### `/src/dtos`
Data Transfer Objects for:
- Request validation
- Response formatting
- Type safety

### `/src/types`
TypeScript type definitions for:
- Domain models
- Request/Response types
- Utility types

### `/src/errors`
Custom error classes for:
- HTTP errors
- Business logic errors
- Validation errors

### `/src/tests`
Test files organized by type:
- `setup.ts` - Test configuration
- `integration/` - Integration tests
- `unit/` - Unit tests (to be added)

## Key Improvements

### 1. Separation of Concerns
- **Before:** All logic in `index.ts` (200+ lines)
- **After:** Separated into `index.ts` (entry point), `app.ts` (Express config), `config/socket.ts` (Socket.io)

### 2. Complete Repository Layer
- **Before:** Only `user.repository.ts`
- **After:** Full repository layer for all entities:
  - application.repository.ts
  - campaign.repository.ts
  - message.repository.ts
  - notification.repository.ts
  - payment.repository.ts
  - profile.repository.ts
  - review.repository.ts
  - user.repository.ts

### 3. Type Definitions
- **Before:** Only `user.type.ts`
- **After:** Complete type definitions for all entities

### 4. Test Infrastructure
- **Before:** No test setup
- **After:** 
  - Jest configuration with coverage
  - Test setup with MongoDB Memory Server
  - Integration test examples
  - Test scripts in package.json

## Data Flow Example

### Creating a Campaign

```
1. Client Request
   POST /api/campaigns
   ↓
2. Route
   routes/campaign.route.ts
   ↓
3. Middleware
   - authorizedMiddleware (verify JWT)
   - brandMiddleware (verify brand role)
   ↓
4. Controller
   controllers/campaign.controller.ts
   - Validate request data
   - Extract user info from token
   ↓
5. Service
   services/campaign.service.ts
   - Apply business rules
   - Check brand permissions
   ↓
6. Repository
   repositories/campaign.repository.ts
   - Create database record
   ↓
7. Model
   models/campaign.model.ts
   - Mongoose schema validation
   - Save to MongoDB
   ↓
8. Response
   ← Return through layers
   ← Format response
   ← Send to client
```

## Best Practices

### Controllers
- Keep thin - delegate to services
- Handle HTTP concerns only
- Use DTOs for validation
- Return consistent response format

### Services
- Implement business logic
- Don't access request/response objects
- Use repositories for data access
- Keep testable and reusable

### Repositories
- One repository per model
- Encapsulate query logic
- Return domain models
- Handle database errors

### Testing
- Unit test services (business logic)
- Integration test API endpoints
- Mock repositories in service tests
- Use MongoDB Memory Server for integration tests

## Socket.io Integration

Socket.io is configured separately in `config/socket.ts` and attached to the Express app in `index.ts`. This allows:
- Clean separation of real-time logic
- Easy testing of HTTP endpoints
- Modular socket event handling

## Environment Variables

Required in `.env`:
```
PORT=5050
MONGODB_URI=mongodb://localhost:27017/database_name
JWT_SECRET=your_secret_key
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Future Improvements

1. Add unit tests for services
2. Implement DTOs for all endpoints
3. Add API documentation (Swagger)
4. Implement caching layer (Redis)
5. Add logging service (Winston)
6. Implement event-driven architecture
7. Add rate limiting
8. Implement API versioning
