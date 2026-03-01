import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Database connected successfully");
    } catch (error: any) {
        console.error(`❌ Database connection failed: ${error.message}`);
    }
}
