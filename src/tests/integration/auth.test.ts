import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Authentication Integration Tests', () => {
    const testInfluencer = {
        email: 'influencer@test.com',
        password: 'Test@1234',
        fullName: 'Test Influencer',
        role: 'influencer',
        isInfluencer: true
    };

    const testBrand = {
        email: 'brand@test.com',
        password: 'Test@5678',
        fullName: 'Test Brand',
        role: 'brand',
        isInfluencer: false
    };

    beforeAll(async () => {
        // Clean up test users before starting
        await UserModel.deleteMany({ 
            email: { $in: [testInfluencer.email, testBrand.email] } 
        });
    });

    afterAll(async () => {
        // Clean up test users after all tests
        await UserModel.deleteMany({ 
            email: { $in: [testInfluencer.email, testBrand.email] } 
        });
    });

    describe('POST /api/auth/register', () => {
        test('should register a new influencer successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testInfluencer);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('message', 'Registration successful');
            expect(response.body.data).toHaveProperty('email', testInfluencer.email);
            expect(response.body.data).toHaveProperty('fullName', testInfluencer.fullName);
            expect(response.body.data).toHaveProperty('role', 'influencer');
            expect(response.body.data).not.toHaveProperty('password');
        });

        test('should register a new brand successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testBrand);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email', testBrand.email);
            expect(response.body.data).toHaveProperty('role', 'brand');
        });

        test('should fail to register with existing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testInfluencer);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        test('should fail to register without email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    password: 'Test@1234',
                    fullName: 'Test User',
                    role: 'influencer'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail to register with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalidemail',
                    password: 'Test@1234',
                    fullName: 'Test User',
                    role: 'influencer'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail to register with short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@test.com',
                    password: '123',
                    fullName: 'Test User',
                    role: 'influencer'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail to register without fullName', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@test.com',
                    password: 'Test@1234',
                    role: 'influencer'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail to register without role', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@test.com',
                    password: 'Test@1234',
                    fullName: 'Test User'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login influencer successfully', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testInfluencer.email,
                    password: testInfluencer.password
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe(testInfluencer.email);
            expect(response.body.data.user).not.toHaveProperty('password');
        });

        test('should login brand successfully', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testBrand.email,
                    password: testBrand.password
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(testBrand.email);
        });

        test('should fail to login with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testInfluencer.email,
                    password: 'WrongPassword123'
                });
            
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('should fail to login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'Test@1234'
                });
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        test('should fail to login without email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'Test@1234'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail to login without password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testInfluencer.email
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        test('should send password reset email for valid email', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: testInfluencer.email
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('reset link has been sent');
        });

        test('should return success for non-existent email (security)', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    email: 'nonexistent@test.com'
                });
            
            // Should return success for security reasons
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should fail without email', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/reset-password', () => {
        test('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalidtoken123',
                    newPassword: 'NewPassword@123'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail without token', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    newPassword: 'NewPassword@123'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail without new password', async () => {
            const response = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'sometoken'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/whoami', () => {
        let authToken: string;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testInfluencer.email,
                    password: testInfluencer.password
                });
            authToken = loginResponse.body.data.token;
        });

        test('should get user info with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email');
        });

        test('should fail to get user info without token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami');
            
            expect(response.status).toBe(401);
        });

        test('should fail to get user info with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', 'Bearer invalidtoken123');
            
            expect(response.status).toBe(401);
        });
    });
});
