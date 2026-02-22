// Test setup file
// This runs before all tests

// Set test environment variables
Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true
});
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/influcollab-test';

// Increase timeout for database operations
jest.setTimeout(30000);

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
