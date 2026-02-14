import request from 'supertest';
import mongoose from 'mongoose';
import express, { Application } from 'express';
import authRoutes from '../routes/auth.route';
import userRoutes from '../routes/user.route';
import { UserModel } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

describe('Integrated Tests: User Management & Auth', () => {
    let authToken: string;
    let userId: string;
    let resetToken: string;

    beforeAll(async () => {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/reweb_test';
        await mongoose.connect(mongoUri);
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // 1-5: Registration Tests
    it('should register a new influencer', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'influencer@test.com',
                password: 'password123',
                fullName: 'Test Influencer',
                isInfluencer: true
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        userId = res.body.data.userId;
    });

    it('should NOT register with duplicate email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'influencer@test.com',
                password: 'password123',
                fullName: 'Duplicate',
                isInfluencer: true
            });
        expect(res.status).toBe(403);
    });

    it('should register a new brand/user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'brand@test.com',
                password: 'password123',
                fullName: 'Test Brand',
                isInfluencer: false
            });
        expect(res.status).toBe(201);
    });

    it('should NOT register with invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'invalid-email',
                password: 'password123',
                fullName: 'Invalid'
            });
        expect(res.status).toBe(400);
    });

    it('should NOT register with short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'short@test.com',
                password: '123',
                fullName: 'Short Pass'
            });
        expect(res.status).toBe(400);
    });

    // 6-10: Login Tests
    it('should login influencer successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'influencer@test.com',
                password: 'password123'
            });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
        authToken = res.body.data.token;
    });

    it('should NOT login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'influencer@test.com',
                password: 'wrongpassword'
            });
        expect(res.status).toBe(401);
    });

    it('should NOT login non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'notfound@test.com',
                password: 'password123'
            });
        expect(res.status).toBe(404);
    });

    it('should login brand successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'brand@test.com',
                password: 'password123'
            });
        expect(res.status).toBe(200);
    });

    it('should NOT login with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'influencer@test.com' });
        expect(res.status).toBe(400);
    });

    // 11-15: Password Reset Tests
    it('should request forgot password token', async () => {
        const res = await request(app)
            .post('/api/users/forgot-password')
            .send({ email: 'influencer@test.com' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        resetToken = res.body.token;
    });

    it('should NOT request forgot password for non-existent email', async () => {
        const res = await request(app)
            .post('/api/users/forgot-password')
            .send({ email: 'unknown@test.com' });
        expect(res.status).toBe(404);
    });

    it('should reset password with valid token', async () => {
        const res = await request(app)
            .post('/api/users/reset-password')
            .send({
                token: resetToken,
                newPassword: 'newpassword123'
            });
        expect(res.status).toBe(200);
    });

    it('should NOT reset password with invalid token', async () => {
        const res = await request(app)
            .post('/api/users/reset-password')
            .send({
                token: 'invalidtoken',
                newPassword: 'newpassword123'
            });
        expect(res.status).toBe(400);
    });

    it('should login with NEW password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'influencer@test.com',
                password: 'newpassword123'
            });
        expect(res.status).toBe(200);
    });

    // 16-20: Pagination Tests
    it('should fetch paginated users (all)', async () => {
        const res = await request(app)
            .get('/api/users/admin/all?page=1&limit=1');
        expect(res.status).toBe(200);
        expect(res.body.users.length).toBe(1);
        expect(res.body.total).toBeGreaterThanOrEqual(2);
    });

    it('should fetch second page of influencers', async () => {
        const res = await request(app)
            .get('/api/users/influencers?page=2&limit=5');
        expect(res.status).toBe(200);
        expect(res.body.page).toBe(2);
    });

    it('should return empty list for out of range page', async () => {
        const res = await request(app)
            .get('/api/users/admin/all?page=100&limit=10');
        expect(res.status).toBe(200);
        expect(res.body.users.length).toBe(0);
    });

    it('should filter influencers by search query', async () => {
        const res = await request(app)
            .get('/api/users/influencers?search=Influencer');
        expect(res.status).toBe(200);
        expect(res.body.count).toBeGreaterThan(0);
    });

    it('should return zero count for search that matches nothing', async () => {
        const res = await request(app)
            .get('/api/users/influencers?search=DoesNotExist123');
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
    });

    // 21-25: Admin CRUD Tests
    it('should get user by ID', async () => {
        const res = await request(app)
            .get(`/api/users/${userId}`);
        expect(res.status).toBe(200);
        expect(res.body.data.fullName).toBe('Test Influencer');
    });

    it('should update user info', async () => {
        const res = await request(app)
            .put(`/api/users/admin/${userId}`)
            .send({ fullName: 'Updated Name' });
        expect(res.status).toBe(200);
        expect(res.body.data.fullName).toBe('Updated Name');
    });

    it('should NOT get user by invalid ID', async () => {
        const res = await request(app)
            .get('/api/users/507f1f77bcf86cd799439011'); // Random valid BSON ID
        expect(res.status).toBe(404);
    });

    it('should delete user successfully', async () => {
        const res = await request(app)
            .delete(`/api/users/admin/${userId}`);
        expect(res.status).toBe(200);
    });

    it('should NOT delete user second time', async () => {
        const res = await request(app)
            .delete(`/api/users/admin/${userId}`);
        expect(res.status).toBe(404);
    });
});
