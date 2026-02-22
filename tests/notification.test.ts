import request from 'supertest';
import app from '../src/app';
import { NotificationModel } from '../src/models/notification.model';
import { UserModel } from '../src/models/user.model';
import { connectDatabase } from '../src/database/mongodb';
import mongoose from 'mongoose';

describe('Notification API', () => {
    let brandToken: string;
    let brandUserId: string;
    let notificationId: string;

    beforeAll(async () => {
        await connectDatabase();

        // Clean up test user if exists
        await UserModel.deleteOne({ email: 'testbrand@test.com' });

        // Register brand user
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testbrand@test.com',
                password: 'Test123!',
                fullName: 'Test Brand',
                isInfluencer: false
            });

        brandUserId = registerRes.body.data.userId;

        // Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testbrand@test.com',
                password: 'Test123!'
            });

        brandToken = loginRes.body.data.token;

        // Create a test notification
        const notification = await NotificationModel.create({
            userId: brandUserId,
            userRole: 'brand',
            type: 'application',
            title: 'Test Notification',
            message: 'This is a test notification',
            metadata: { test: true }
        });
        notificationId = notification._id.toString();
    });

    afterAll(async () => {
        await NotificationModel.deleteMany({ userId: brandUserId });
        await UserModel.deleteOne({ email: 'testbrand@test.com' });
        await mongoose.connection.close();
    });

    describe('GET /api/notifications', () => {
        it('should get user notifications', async () => {
            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.notifications)).toBe(true);
        });

        it('should reject request without auth', async () => {
            const response = await request(app)
                .get('/api/notifications');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/notifications/unread-count', () => {
        it('should get unread notification count', async () => {
            const response = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.count).toBe('number');
        });
    });

    describe('PATCH /api/notifications/:id/read', () => {
        it('should mark notification as read', async () => {
            const response = await request(app)
                .patch(`/api/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('PATCH /api/notifications/mark-all-read', () => {
        it('should mark all notifications as read', async () => {
            const response = await request(app)
                .patch('/api/notifications/mark-all-read')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('DELETE /api/notifications/:id', () => {
        it('should delete notification', async () => {
            const response = await request(app)
                .delete(`/api/notifications/${notificationId}`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 404 for non-existent notification', async () => {
            const response = await request(app)
                .delete(`/api/notifications/${notificationId}`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/notifications - Filtering', () => {
        it('should filter notifications by read status', async () => {
            const response = await request(app)
                .get('/api/notifications?isRead=false')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should filter notifications by type', async () => {
            const response = await request(app)
                .get('/api/notifications?type=application')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('PATCH /api/notifications/:id/read - Edge cases', () => {
        beforeAll(async () => {
            // Create a new notification for testing
            const notification = await NotificationModel.create({
                userId: brandUserId,
                userRole: 'brand',
                type: 'test',
                title: 'Test Notification 2',
                message: 'Test message 2'
            });
            notificationId = notification._id.toString();
        });

        it('should mark already read notification as read', async () => {
            // Mark as read first time
            await request(app)
                .patch(`/api/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${brandToken}`);

            // Mark as read second time
            const response = await request(app)
                .patch(`/api/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
