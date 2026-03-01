import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { PORT } from './config';
import { connectDatabase } from './database/mongodb';
import { initializeSocket } from './config/socket';
import app from './app';

// Create HTTP server and initialize socket.io
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Attach io to request for use in controllers (MUST be before routes)
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

connectDatabase();

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});