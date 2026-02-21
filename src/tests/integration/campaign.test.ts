import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { CampaignModel } from '../../models/campaign.model';

describe('Campaign Integration Tests', () => {
    let brandToken: string;
    let influencerToken: string;
    let brandUserId: string;
    let campaignId: string;

    const brandUser = {
        email: 'brand@campaign.test',
        password: 'Test@1234',
        fullName: 'Test Brand',
        role: 'brand',
        isInfluencer: false
    };

    const influencerUser = {
        email: 'influencer@campaign.test',
        password: 'Test@5678',
        fullName: 'Test Influencer',
        role: 'influencer',
        isInfluencer: true
    };

    beforeAll(async () => {
        // Clean up
        await UserModel.deleteMany({ 
            email: { $in: [brandUser.email, influencerUser.email] } 
        });
        await CampaignModel.deleteMany({});

        // Register brand user
        const brandResponse = await request(app)
            .post('/api/auth/register')
            .send(brandUser);
        
        // Login brand
        const brandLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: brandUser.email,
                password: brandUser.password
            });
        brandToken = brandLogin.body.data.token;
        brandUserId = brandLogin.body.data.user.userId;

        // Register influencer user
        await request(app)
            .post('/api/auth/register')
            .send(influencerUser);
        
        // Login influencer
        const influencerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: influencerUser.email,
                password: influencerUser.password
            });
        influencerToken = influencerLogin.body.data.token;
    });

    afterAll(async () => {
        await UserModel.deleteMany({ 
            email: { $in: [brandUser.email, influencerUser.email] } 
        });
        await CampaignModel.deleteMany({});
    });

    describe('POST /api/campaigns', () => {
        test('should create a campaign as brand', async () => {
            const campaignData = {
                title: 'Test Campaign',
                description: 'This is a test campaign',
                brandName: 'Test Brand Company',
                category: 'Fashion',
                budgetMin: 500,
                budgetMax: 1000,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'New York',
                requirements: ['Instagram', 'YouTube'],
                deliverables: ['2 Instagram posts', '1 YouTube video']
            };

            const response = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`)
                .send(campaignData);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.title).toBe(campaignData.title);
            
            campaignId = response.body.data._id;
        });

        test('should fail to create campaign without authentication', async () => {
            const response = await request(app)
                .post('/api/campaigns')
                .send({
                    title: 'Test Campaign',
                    description: 'Test',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 500,
                    budgetMax: 1000,
                    deadline: new Date().toISOString(),
                    location: 'New York'
                });
            
            expect(response.status).toBe(401);
        });

        test('should fail to create campaign as influencer', async () => {
            const response = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    title: 'Test Campaign',
                    description: 'Test',
                    brandName: 'Test Brand',
                    category: 'Fashion',
                    budgetMin: 500,
                    budgetMax: 1000,
                    deadline: new Date().toISOString(),
                    location: 'New York'
                });
            
            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/campaigns', () => {
        test('should get all campaigns with authentication', async () => {
            const response = await request(app)
                .get('/api/campaigns')
                .set('Authorization', `Bearer ${brandToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/campaigns');
            
            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/campaigns/:id', () => {
        test('should get campaign by id with authentication', async () => {
            const response = await request(app)
                .get(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${brandToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(campaignId);
        });

        test('should fail without authentication', async () => {
            const response = await request(app)
                .get(`/api/campaigns/${campaignId}`);
            
            expect(response.status).toBe(401);
        });

        test('should fail with invalid campaign id', async () => {
            const response = await request(app)
                .get('/api/campaigns/invalid-id')
                .set('Authorization', `Bearer ${brandToken}`);
            
            expect(response.status).toBe(400);
        });

        test('should fail with non-existent campaign id', async () => {
            const response = await request(app)
                .get('/api/campaigns/507f1f77bcf86cd799439011')
                .set('Authorization', `Bearer ${brandToken}`);
            
            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/campaigns/:id', () => {
        test('should update campaign as owner', async () => {
            const updateData = {
                title: 'Updated Campaign Title',
                budgetMax: 1500
            };

            const response = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${brandToken}`)
                .send(updateData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe(updateData.title);
            expect(response.body.data.budgetMax).toBe(updateData.budgetMax);
        });

        test('should fail to update without authentication', async () => {
            const response = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .send({ title: 'Updated' });
            
            expect(response.status).toBe(401);
        });

        test('should fail to update as non-owner', async () => {
            const response = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({ title: 'Updated' });
            
            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/campaigns/:id', () => {
        test('should delete campaign as owner', async () => {
            const response = await request(app)
                .delete(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${brandToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should fail to delete without authentication', async () => {
            const response = await request(app)
                .delete(`/api/campaigns/${campaignId}`);
            
            expect(response.status).toBe(401);
        });
    });
});
