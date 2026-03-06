import request from 'supertest';
import app from '../src/test-app';

describe('Campaign API', () => {
    let brandToken: string;
    let influencerToken: string;
    let campaignId: string;

    beforeEach(async () => {
        // Register brand
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testbrand5@test.com',
                password: 'Test123!',
                fullName: 'Test Brand 5',
                isInfluencer: false
            });

        // Login as brand
        const brandResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testbrand5@test.com',
                password: 'Test123!'
            });
        brandToken = brandResponse.body.data.token;

        // Register influencer
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testinfluencer4@test.com',
                password: 'Test123!',
                fullName: 'Test Influencer 4',
                isInfluencer: true
            });

        // Login as influencer
        const influencerResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testinfluencer4@test.com',
                password: 'Test123!'
            });
        influencerToken = influencerResponse.body.data.token;
    });

    describe('POST /api/campaigns', () => {
        it('should create a new campaign', async () => {
            const response = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1', 'Requirement 2']
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
        });

        it('should reject campaign creation without auth', async () => {
            const response = await request(app)
                .post('/api/campaigns')
                .send({
                    title: 'Test Campaign'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/campaigns', () => {
        it('should fetch all campaigns', async () => {
            // Create a campaign first
            await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1']
                });

            const response = await request(app)
                .get('/api/campaigns')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/campaigns/:id', () => {
        it('should fetch campaign by ID', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1']
                });
            const campaignId = createRes.body.data._id;

            const response = await request(app)
                .get(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Test Campaign');
        });
    });

    describe('PATCH /api/campaigns/:id', () => {
        it('should update campaign', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1']
                });
            const campaignId = createRes.body.data._id;

            const response = await request(app)
                .patch(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Updated Campaign Title'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Campaign Title');
        });

        it('should reject update by non-owner', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1']
                });
            const campaignId = createRes.body.data._id;

            const response = await request(app)
                .patch(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    title: 'Hacked Title'
                });

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/campaigns/:id/join', () => {
        it('should allow influencer to apply', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1']
                });
            const campaignId = createRes.body.data._id;

            const response = await request(app)
                .post(`/api/campaigns/${campaignId}/join`)
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    message: 'I would like to join this campaign'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/campaigns - Filtering', () => {
        beforeEach(async () => {
            // Create a campaign for filtering tests
            await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    title: 'Test Campaign',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 5000,
                    budgetMax: 15000,
                    deadline: '2026-12-31',
                    location: 'Kathmandu',
                    description: 'Test campaign description',
                    requirements: ['Requirement 1']
                });
        });

        it('should filter campaigns by category', async () => {
            const response = await request(app)
                .get('/api/campaigns?category=Fashion')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should filter campaigns by location', async () => {
            const response = await request(app)
                .get('/api/campaigns?location=Kathmandu')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should search campaigns by title', async () => {
            const response = await request(app)
                .get('/api/campaigns?search=Test')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return empty array for non-matching search', async () => {
            const response = await request(app)
                .get('/api/campaigns?search=NonExistentCampaign12345')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
