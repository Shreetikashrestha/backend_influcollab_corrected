import { connectDatabase } from '../database/mongodb';
import mongoose from 'mongoose';

beforeAll(async () => {
    // Connect to test database
    await connectDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});

// Optional: Clean up after each test
// Uncomment if you want to clean database after each test
// afterEach(async () => {
//     const collections = mongoose.connection.collections;
//     for (const key in collections) {
//         await collections[key].deleteMany({});
//     }
// });
