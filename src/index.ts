import dotenv from 'dotenv';
import { createServer } from 'http';
import { PORT } from './config';
import { connectDatabase } from './database/mongodb';
import { initializeSocket } from './config/socket';
import express from 'express';
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
import supportRoutes from './routes/support.route';
import { authorizedMiddleware } from './middleware/authorization.middleware';
import { brandMiddleware } from './middleware/brand.middleware';
import { influencerMiddleware } from './middleware/influencer.middleware';

dotenv.config();

const app = express();

// Dynamic CORS configuration for web and mobile clients
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3003",
    "http://10.0.2.2:5050", // Android emulator
    process.env.FRONTEND_URL || "",
].filter((origin): origin is string => Boolean(origin));

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create HTTP server and initialize socket.io
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Attach io to request for use in controllers (MUST be before routes)
app.use((req: any, res, next) => {
    req.io = io;
    next();
});

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
app.use('/api/support', supportRoutes);

// Mobile app admin route aliases
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/campaigns', campaignRoutes);
app.use('/api/admin/applications', applicationRoutes);

// Role-based dashboard routes
app.get(
    "/api/brand/dashboard",
    authorizedMiddleware,
    brandMiddleware,
    (req, res) => {
        res.json({ success: true, message: "Welcome brand!" });
    },
);

app.get(
    "/api/influencer/dashboard",
    authorizedMiddleware,
    influencerMiddleware,
    (req, res) => {
        res.json({ success: true, message: "Welcome influencer!" });
    },
);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: "Server is running" });
});

connectDatabase();

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});