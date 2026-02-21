import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import campaignRoutes from './routes/campaign.route';
import applicationRoutes from './routes/application.route';
import messageRoutes from './routes/message.route';
import notificationRoutes from './routes/notification.route';
import profileRoutes from './routes/profile.route';
import paymentRoutes from './routes/payment.route';
import reviewRoutes from './routes/review.route';
import { authorizedMiddleware } from './middleware/authorization.middleware';
import { brandMiddleware } from './middleware/brand.middleware';
import { influencerMiddleware } from './middleware/influencer.middleware';

const app: Application = express();

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3003"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Role-based dashboard routes
app.get(
    "/api/brand/dashboard",
    authorizedMiddleware,
    brandMiddleware,
    (req: Request, res: Response) => {
        res.json({ success: true, message: "Welcome brand!" });
    },
);

app.get(
    "/api/influencer/dashboard",
    authorizedMiddleware,
    influencerMiddleware,
    (req: Request, res: Response) => {
        res.json({ success: true, message: "Welcome influencer!" });
    },
);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

export default app;
