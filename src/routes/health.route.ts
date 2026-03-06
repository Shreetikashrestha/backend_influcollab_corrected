import { Router, Request, Response } from 'express';
import { isDatabaseConnected, getDatabaseStatus } from '../database/mongodb';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const dbConnected = isDatabaseConnected();
    const dbStatus = getDatabaseStatus();
    
    const health = {
        status: dbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            connected: dbConnected,
            status: dbStatus
        },
        environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(health);
});

router.get('/detailed', (req: Request, res: Response) => {
    const dbConnected = isDatabaseConnected();
    const dbStatus = getDatabaseStatus();
    
    const health = {
        status: dbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            connected: dbConnected,
            status: dbStatus,
            uri: process.env.MONGODB_URI?.replace(/\/\/.*@/, '//<credentials>@') || 'Not configured'
        },
        server: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB'
            }
        },
        environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = dbConnected ? 200 : 503;
    res.status(statusCode).json(health);
});

export default router;
