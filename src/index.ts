import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { PORT } from './config';
import { connectDatabase, disconnectDatabase } from './database/mongodb';
import { initializeSocket } from './config/socket';
import { setupApp } from './app';

const httpServer = createServer();
const io = initializeSocket(httpServer);

const app = setupApp(io);
httpServer.on('request', app);

connectDatabase();

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});

async function gracefulShutdown(signal: string) {
    console.log(`\n🔄 ${signal} received. Shutting down gracefully...`);
    await disconnectDatabase();
    httpServer.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
    });
    setTimeout(() => process.exit(0), 3000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon uses SIGUSR2