import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase(retries = 5, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Connecting to MongoDB (attempt ${attempt}/${retries})...`);
            await mongoose.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log("✅ Database connected successfully");
            return;
        } catch (error: any) {
            console.error(`❌ DB connection attempt ${attempt} failed: ${error.message}`);
            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay = Math.min(delay * 2, 30000); // exponential backoff, max 30s
            } else {
                console.error("========================================");
                console.error("DATABASE CONNECTION FAILED after all retries.");
                console.error("Possible Solution:");
                console.error("  macOS (Homebrew): brew services start mongodb-community@7.0");
                console.error("  Verify MONGODB_URI in your .env file.");
                console.error("========================================");
                // Don't call process.exit(1) - log error but keep server running
                // so that when MongoDB comes back up, mongoose will reconnect automatically
                console.error("Server will continue running. Reconnect will happen automatically when MongoDB is available.");
            }
        }
    }
}
