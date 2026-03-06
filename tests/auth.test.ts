import request from 'supertest';
import app from '../src/test-app';

describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@test.com',
                    password: 'Test123!',
                    fullName: 'Test User',
                    isInfluencer: false
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('userId');
            expect(response.body.data).toHaveProperty('email', 'test@test.com');
        });

        it('should reject duplicate email registration', async () => {
            // First register
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@test.com',
                    password: 'Test123!',
                    fullName: 'Test User',
                    isInfluencer: false
                });

            // Try to register again
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@test.com',
                    password: 'Test123!',
                    fullName: 'Test User',
                    isInfluencer: false
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test2@test.com'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Register a user for login tests
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login@test.com',
                    password: 'Test123!',
                    fullName: 'Login Test User',
                    isInfluencer: false
                });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'Test123!'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'WrongPassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/whoami', () => {
        let token: string;

        beforeEach(async () => {
            // Register and login to get token
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'whoami@test.com',
                    password: 'Test123!',
                    fullName: 'Whoami Test User',
                    isInfluencer: false
                });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'whoami@test.com',
                    password: 'Test123!'
                });
            token = loginResponse.body.data.token;
        });

        it('should return user data with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email', 'whoami@test.com');
        });

        it('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami');

            expect(response.status).toBe(401);
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });

        it('should reject request with malformed authorization header', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', 'InvalidFormat');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/register - Additional validation', () => {
        it('should reject registration with weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'weak@test.com',
                    password: '123',
                    fullName: 'Weak Password User',
                    isInfluencer: false
                });

            expect(response.status).toBe(400);
        });

        it('should reject registration with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Test123!',
                    fullName: 'Invalid Email User',
                    isInfluencer: false
                });

            expect(response.status).toBe(400);
        });

        it('should reject registration without fullName', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'noname@test.com',
                    password: 'Test123!',
                    isInfluencer: false
                });

            expect(response.status).toBe(400);
        });
    });
});
