
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PORT } from './config';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';

dotenv.config();

const app: Application = express();

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3003"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

async function start() {
    await connectDatabase();
    app.listen(PORT, () => {
        console.log(`Server running at: http://localhost:${PORT}`);
    });
}

start().catch((error) => console.log(error));


import { authorizedMiddleware } from './middleware/authorization.middleware';
import { brandMiddleware } from './middleware/brand.middleware';
// If influencerMiddleware is exported from influencer.middleware.ts
import { influencerMiddleware } from './middleware/influencer.middleware';



// Brand dashboard route
app.get(
    "/api/brand/dashboard",
    authorizedMiddleware,
    brandMiddleware,
    (req: Request, res: Response) => {
        res.json({ success: true, message: "Welcome brand!" });
    },
);

// Influencer dashboard route
app.get(
    "/api/influencer/dashboard",
    authorizedMiddleware,
    influencerMiddleware,
    (req: Request, res: Response) => {
        res.json({ success: true, message: "Welcome influencer!" });
    },
);