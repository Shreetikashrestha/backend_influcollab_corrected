// Test setup file
// This runs before all tests

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Set test environment variables
Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true
});
process.env.JWT_SECRET = 'test-secret-key-for-testing';

// Increase timeout for database operations
jest.setTimeout(60000);

// Setup in-memory MongoDB before all tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

// Clear collections between tests (except in tests that manage their own data)
afterEach(async () => {
    // Skip cleanup for tests that handle their own data lifecycle
    // This prevents token invalidation issues
});

// Suppress console logs during tests (optional)
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging
    error: console.error,
};
