import mongoose from "mongoose";
import { MONGODB_URI } from "../config";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const MAX_RETRIES = 10;
const INITIAL_DELAY_MS = 2000;

let isIntentionalDisconnect = false;
let isConnecting = false;

async function isMongoDBRunning(): Promise<boolean> {
    try {
        const { stdout } = await execAsync('lsof -Pi :27017 -sTCP:LISTEN -t');
        return stdout.trim().length > 0;
    } catch (error) {
        return false;
    }
}

async function startMongoDB(): Promise<boolean> {
    try {
        console.log("🔄 Attempting to start MongoDB...");
        
        await execAsync('mkdir -p ~/data/db');
        
        try {
            await execAsync('rm -f ~/data/db/mongod.lock ~/data/db/WiredTiger.lock');
        } catch (e) {
        }
        
        await execAsync('nohup mongod --dbpath ~/data/db --bind_ip 127.0.0.1 > ~/data/db/mongodb.log 2>&1 &');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const isRunning = await isMongoDBRunning();
        if (isRunning) {
            console.log("✅ MongoDB started successfully");
            return true;
        } else {
            console.error("❌ MongoDB failed to start. Check logs at: ~/data/db/mongodb.log");
            return false;
        }
    } catch (error: any) {
        console.error(`❌ Error starting MongoDB: ${error.message}`);
        return false;
    }
}

export async function connectDatabase(retries = MAX_RETRIES): Promise<void> {
    if (isConnecting) {
        console.log("⏳ Connection attempt already in progress...");
        return;
    }

    isIntentionalDisconnect = false;
    isConnecting = true;

    try {
        const mongoRunning = await isMongoDBRunning();
        
        if (!mongoRunning) {
            console.warn("⚠️  MongoDB is not running. Attempting to start it...");
            const started = await startMongoDB();
            
            if (!started) {
                console.error("❌ Could not start MongoDB automatically.");
                console.error("💡 Please start MongoDB manually using: ./start-mongodb.sh");
                isConnecting = false;
                return;
            }
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await mongoose.connect(MONGODB_URI, {
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                    family: 4, // Use IPv4, skip trying IPv6
                });
                console.log("✅ Database connected successfully");
                isConnecting = false;
                return;
            } catch (error: any) {
                if (attempt < retries) {
                    const delay = INITIAL_DELAY_MS * Math.min(attempt, 3); // Cap delay at 6 seconds
                    console.warn(
                        `⚠️  Database connection attempt ${attempt}/${retries} failed: ${error.message}. Retrying in ${delay / 1000}s...`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    console.error(
                        `❌ Database connection failed after ${retries} attempts: ${error.message}`
                    );
                    console.error("💡 Please ensure MongoDB is running: ./start-mongodb.sh");
                }
            }
        }
    } finally {
        isConnecting = false;
    }
}

export async function disconnectDatabase(): Promise<void> {
    isIntentionalDisconnect = true;
    await mongoose.connection.close();
}

export function isDatabaseConnected(): boolean {
    return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): string {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
}

mongoose.connection.on("disconnected", () => {
    if (isIntentionalDisconnect) {
        console.log("ℹ️  MongoDB disconnected (intentional).");
        return;
    }
    console.warn("⚠️  MongoDB disconnected unexpectedly. Attempting to reconnect...");
    setTimeout(() => connectDatabase(5), INITIAL_DELAY_MS);
});

mongoose.connection.on("error", (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    if (!isIntentionalDisconnect && !isConnecting) {
        console.log("🔄 Will attempt to reconnect...");
        setTimeout(() => connectDatabase(5), INITIAL_DELAY_MS);
    }
});

mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connection established");
});

mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected successfully");
});

