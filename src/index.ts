import dotenv from 'dotenv';
import { createServer } from 'http';
import { PORT } from './config';
import { connectDatabase } from './database/mongodb';
import { initializeSocket } from './config/socket';
import app from './app';

dotenv.config();

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Attach io to request for use in controllers
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

async function startServer() {
    await connectDatabase();
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running at: http://localhost:${PORT}`);
    });
}

startServer().catch((error) => console.log(error));