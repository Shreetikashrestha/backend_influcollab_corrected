# Testing Guide

## Overview

This project uses Jest and Supertest for testing. We have two types of tests:
- **Integration Tests**: Test complete API endpoints with database
- **Unit Tests**: Test individual services/functions in isolation

## Test Structure

```
src/tests/
├── setup.ts                    # Test configuration
├── integration/                # Integration tests
│   ├── auth.test.ts           # Authentication endpoints
│   ├── campaign.test.ts       # Campaign endpoints
│   └── profile.test.ts        # Profile endpoints
└── unit/                       # Unit tests
    └── user.service.test.ts   # User service tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should register"
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    verbose: true,
    forceExit: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/tests/**',
        '!src/index.ts',
        '!src/app.ts',
    ],
};
```

### Test Setup (`src/tests/setup.ts`)

```typescript
import { connectDatabase } from '../database/mongodb';
import mongoose from 'mongoose';

beforeAll(async () => {
    await connectDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});
```

## Writing Integration Tests

Integration tests test complete API endpoints with the database.

### Example: Authentication Test

```typescript
import request from 'supertest';
import app from '../../app';
import User from '../../models/user.model';

describe('Authentication Integration Tests', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'Test@1234',
        fullName: 'Test User',
        role: 'influencer'
    };

    beforeAll(async () => {
        // Clean up before tests
        await User.deleteMany({ email: testUser.email });
    });

    afterAll(async () => {
        // Clean up after tests
        await User.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email');
        });

        test('should fail with existing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});
```

### Integration Test Best Practices

1. **Clean up data** before and after tests
2. **Use unique test data** to avoid conflicts
3. **Test both success and failure cases**
4. **Test authentication and authorization**
5. **Test validation errors**
6. **Use descriptive test names**

## Writing Unit Tests

Unit tests test individual functions/services in isolation using mocks.

### Example: Service Test

```typescript
import { UserService } from '../../services/user.service';
import userRepository from '../../repositories/user.repository';

// Mock the repository
jest.mock('../../repositories/user.repository');

describe('UserService Unit Tests', () => {
    let userService: UserService;
    const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        test('should register a new user', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Test@1234',
                fullName: 'Test User',
                role: 'influencer'
            };

            const mockUser = { _id: '123', ...userData };
            
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(mockUser as any);

            const result = await userService.registerUser(userData);

            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockUserRepository.create).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        test('should throw error if email exists', async () => {
            mockUserRepository.findByEmail.mockResolvedValue({ email: 'test@example.com' } as any);

            await expect(userService.registerUser({} as any))
                .rejects
                .toThrow();
        });
    });
});
```

### Unit Test Best Practices

1. **Mock dependencies** (repositories, external services)
2. **Test one function at a time**
3. **Test edge cases and error handling**
4. **Clear mocks between tests**
5. **Use descriptive test names**
6. **Test return values and side effects**

## Test Patterns

### Testing Protected Routes

```typescript
describe('Protected Route', () => {
    let authToken: string;

    beforeAll(async () => {
        // Login to get token
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'Test@1234' });
        
        authToken = response.body.data.token;
    });

    test('should access protected route with token', async () => {
        const response = await request(app)
            .get('/api/protected')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(200);
    });

    test('should fail without token', async () => {
        const response = await request(app)
            .get('/api/protected');
        
        expect(response.status).toBe(401);
    });
});
```

### Testing File Uploads

```typescript
test('should upload file', async () => {
    const response = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'path/to/test/file.jpg');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('fileUrl');
});
```

### Testing Validation

```typescript
describe('Validation Tests', () => {
    test('should fail with invalid email', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'invalid-email',
                password: 'Test@1234',
                fullName: 'Test User'
            });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test('should fail with short password', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: '123',
                fullName: 'Test User'
            });
        
        expect(response.status).toBe(400);
    });
});
```

### Testing Role-Based Access

```typescript
describe('Role-Based Access', () => {
    let brandToken: string;
    let influencerToken: string;

    beforeAll(async () => {
        // Get brand token
        const brandResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'brand@test.com', password: 'Test@1234' });
        brandToken = brandResponse.body.data.token;

        // Get influencer token
        const influencerResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'influencer@test.com', password: 'Test@1234' });
        influencerToken = influencerResponse.body.data.token;
    });

    test('should allow brand to create campaign', async () => {
        const response = await request(app)
            .post('/api/campaigns')
            .set('Authorization', `Bearer ${brandToken}`)
            .send({ title: 'Test Campaign', budget: 1000 });
        
        expect(response.status).toBe(201);
    });

    test('should not allow influencer to create campaign', async () => {
        const response = await request(app)
            .post('/api/campaigns')
            .set('Authorization', `Bearer ${influencerToken}`)
            .send({ title: 'Test Campaign', budget: 1000 });
        
        expect(response.status).toBe(403);
    });
});
```

## Test Coverage

### Viewing Coverage

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory.

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### What to Test

✅ **Do Test:**
- All API endpoints
- Authentication and authorization
- Validation logic
- Business logic in services
- Error handling
- Edge cases

❌ **Don't Test:**
- Third-party libraries
- Database operations (test through repositories)
- Configuration files
- Type definitions

## Common Test Scenarios

### 1. CRUD Operations

```typescript
describe('CRUD Operations', () => {
    let resourceId: string;

    test('CREATE - should create resource', async () => {
        const response = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Resource' });
        
        expect(response.status).toBe(201);
        resourceId = response.body.data._id;
    });

    test('READ - should get resource', async () => {
        const response = await request(app)
            .get(`/api/resources/${resourceId}`);
        
        expect(response.status).toBe(200);
    });

    test('UPDATE - should update resource', async () => {
        const response = await request(app)
            .put(`/api/resources/${resourceId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Resource' });
        
        expect(response.status).toBe(200);
    });

    test('DELETE - should delete resource', async () => {
        const response = await request(app)
            .delete(`/api/resources/${resourceId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
    });
});
```

### 2. Pagination

```typescript
test('should paginate results', async () => {
    const response = await request(app)
        .get('/api/resources?page=1&limit=10');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('items');
    expect(response.body.data).toHaveProperty('pagination');
    expect(response.body.data.pagination).toHaveProperty('page', 1);
    expect(response.body.data.pagination).toHaveProperty('limit', 10);
});
```

### 3. Search/Filter

```typescript
test('should filter results', async () => {
    const response = await request(app)
        .get('/api/campaigns?status=active&budget_min=1000');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    response.body.data.forEach((campaign: any) => {
        expect(campaign.status).toBe('active');
        expect(campaign.budget).toBeGreaterThanOrEqual(1000);
    });
});
```

## Debugging Tests

### Running Single Test

```bash
npm test -- --testNamePattern="should register a new user"
```

### Debugging with VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Verbose Output

```bash
npm test -- --verbose
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Tips and Tricks

1. **Use test.only() for debugging**
   ```typescript
   test.only('should test this one', async () => {
       // Only this test will run
   });
   ```

2. **Skip tests temporarily**
   ```typescript
   test.skip('should test this later', async () => {
       // This test will be skipped
   });
   ```

3. **Group related tests**
   ```typescript
   describe('User Management', () => {
       describe('Registration', () => {
           // Registration tests
       });
       
       describe('Login', () => {
           // Login tests
       });
   });
   ```

4. **Use beforeEach for common setup**
   ```typescript
   beforeEach(async () => {
       await User.deleteMany({});
   });
   ```

5. **Test async code properly**
   ```typescript
   test('should handle async', async () => {
       await expect(asyncFunction()).resolves.toBe(value);
       await expect(asyncFunction()).rejects.toThrow(Error);
   });
   ```

## Troubleshooting

### Tests Hanging

- Check for open database connections
- Use `forceExit: true` in jest.config.js
- Close all connections in `afterAll`

### Database Issues

- Ensure MongoDB is running
- Check connection string in `.env`
- Clean up test data properly

### Timeout Errors

```typescript
test('long running test', async () => {
    // Increase timeout for this test
}, 10000); // 10 seconds
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
