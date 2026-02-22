# Test Suite Documentation

## Overview
This test suite provides comprehensive coverage for the InfluCollab API, including unit tests, integration tests, and end-to-end tests.

## Test Structure

### Test Files
- `auth.test.ts` - Authentication endpoints (register, login, whoami)
- `campaign.test.ts` - Campaign CRUD operations
- `application.test.ts` - Application management (create, update status, retrieve)
- `notification.test.ts` - Notification system
- `profile.test.ts` - User profile management

### Test Coverage
- **Unit Tests**: Individual controller methods
- **Integration Tests**: API endpoints with database
- **Authentication Tests**: JWT token validation
- **Authorization Tests**: Role-based access control

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test -- auth.test.ts
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

## Test Requirements

### Prerequisites
1. MongoDB running (local or test database)
2. Test users created:
   - Brand: `brand@gmail.com` / `brand123`
   - Influencer: `influencer@gmail.com` / `influencer123`

### Environment Variables
Create `.env.test` file:
```
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/influcollab-test
JWT_SECRET=test-secret-key
PORT=5051
```

## Test Scenarios Covered

### Authentication (auth.test.ts)
- ✅ User registration with valid data
- ✅ Duplicate email rejection
- ✅ Required field validation
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Get current user with valid token
- ✅ Reject request without token

### Campaigns (campaign.test.ts)
- ✅ Create campaign (brand only)
- ✅ Reject campaign creation without auth
- ✅ Fetch all campaigns
- ✅ Fetch campaign by ID
- ✅ Return 404 for invalid ID
- ✅ Update campaign (owner only)
- ✅ Reject update by non-owner
- ✅ Apply to campaign (influencer)

### Applications (application.test.ts)
- ✅ Create application
- ✅ Reject duplicate application
- ✅ Get influencer applications
- ✅ Get campaign applications (brand owner)
- ✅ Reject non-owner access
- ✅ Get single application
- ✅ Update application status (accept/reject)
- ✅ Reject invalid status
- ✅ Reject non-owner update
- ✅ Get influencer stats

### Notifications (notification.test.ts)
- ✅ Get user notifications
- ✅ Get unread count
- ✅ Mark notification as read
- ✅ Mark all as read
- ✅ Delete notification
- ✅ Return 404 for non-existent notification

### Profiles (profile.test.ts)
- ✅ Get current user profile
- ✅ Update influencer profile
- ✅ Update brand profile
- ✅ Get list of influencers
- ✅ Get profile by user ID

## Coverage Goals
- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

## Best Practices
1. Each test is independent and isolated
2. Database cleanup after each test suite
3. Use beforeAll/afterAll for setup/teardown
4. Mock external dependencies when needed
5. Test both success and failure scenarios
6. Validate response structure and status codes

## Troubleshooting

### Tests Failing
1. Ensure MongoDB is running
2. Check test users exist in database
3. Verify environment variables
4. Clear test database: `mongo influcollab-test --eval "db.dropDatabase()"`

### Coverage Not Meeting Threshold
1. Add more test cases for edge scenarios
2. Test error handling paths
3. Add tests for middleware functions
4. Test validation logic

## CI/CD Integration
Tests can be integrated into CI/CD pipeline:
```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test
  env:
    MONGODB_URI: ${{ secrets.MONGODB_TEST_URI }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```
