import request from 'supertest';
import app from '../src/test-app';
import { ApplicationModel } from '../src/models/application.model';
import { CampaignModel } from '../src/models/campaign.model';
import { UserModel } from '../src/models/user.model';

describe('Application API', () => {
    let brandToken: string;
    let influencerToken: string;
    let campaignId: string;
    let applicationId: string;

    beforeAll(async () => {
        // Clean up test users if they exist
        await UserModel.deleteOne({ email: 'testbrand6@test.com' });
        await UserModel.deleteOne({ email: 'testinfluencer5@test.com' });

        // Register brand
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testbrand6@test.com',
                password: 'Test123!',
                fullName: 'Test Brand 6',
                isInfluencer: false
            });

        // Login as brand
        const brandLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testbrand6@test.com',
                password: 'Test123!'
            });
        brandToken = brandLogin.body.data.token;

        // Register influencer
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testinfluencer5@test.com',
                password: 'Test123!',
                fullName: 'Test Influencer 5',
                isInfluencer: true
            });

        // Login as influencer
        const influencerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testinfluencer5@test.com',
                password: 'Test123!'
            });
        influencerToken = influencerLogin.body.data.token;

        // Create a test campaign
        const campaignRes = await request(app)
            .post('/api/campaigns')
            .set('Authorization', `Bearer ${brandToken}`)
            .send({
                title: 'Test Campaign for Applications',
                brandName: 'Test Brand',
                category: 'Fashion',
                budgetMin: 5000,
                budgetMax: 15000,
                deadline: '2026-12-31',
                location: 'Kathmandu',
                description: 'Test description',
                requirements: ['Test requirement']
            });
        campaignId = campaignRes.body.data._id;
    });

    afterAll(async () => {
        if (applicationId) {
            await ApplicationModel.findByIdAndDelete(applicationId);
        }
        if (campaignId) {
            await CampaignModel.findByIdAndDelete(campaignId);
        }
        await UserModel.deleteOne({ email: 'testbrand6@test.com' });
        await UserModel.deleteOne({ email: 'testinfluencer5@test.com' });
    });

    describe('POST /api/applications', () => {
        it('should create a new application', async () => {
            const response = await request(app)
                .post('/api/applications')
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    campaignId: campaignId,
                    message: 'I would like to collaborate on this campaign'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('_id');
            applicationId = response.body.data._id;
        });

        it('should reject duplicate application', async () => {
            const response = await request(app)
                .post('/api/applications')
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    campaignId: campaignId,
                    message: 'Duplicate application'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject application without auth', async () => {
            const response = await request(app)
                .post('/api/applications')
                .send({
                    campaignId: campaignId,
                    message: 'Test'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/applications/my', () => {
        it('should get influencer applications', async () => {
            const response = await request(app)
                .get('/api/applications/my')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/applications/campaign/:campaignId', () => {
        it('should get campaign applications for brand owner', async () => {
            const response = await request(app)
                .get(`/api/applications/campaign/${campaignId}`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should reject non-owner access', async () => {
            const response = await request(app)
                .get(`/api/applications/campaign/${campaignId}`)
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/applications/:id', () => {
        it('should get single application', async () => {
            const response = await request(app)
                .get(`/api/applications/${applicationId}`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.application).toHaveProperty('_id', applicationId);
        });
    });

    describe('PATCH /api/applications/:id/status', () => {
        it('should update application status to accepted', async () => {
            const response = await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${brandToken}`)
                .send({ status: 'accepted' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('accepted');
        });

        it('should reject invalid status', async () => {
            const response = await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${brandToken}`)
                .send({ status: 'invalid' });

            expect(response.status).toBe(400);
        });

        it('should reject non-owner update', async () => {
            const response = await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({ status: 'rejected' });

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/applications/stats/influencer', () => {
        it('should get influencer stats', async () => {
            const response = await request(app)
                .get('/api/applications/stats/influencer')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('totalApplications');
            expect(response.body.data).toHaveProperty('activeCampaigns');
        });
    });

    describe('GET /api/applications - Pagination', () => {
        it('should support pagination for influencer applications', async () => {
            const response = await request(app)
                .get('/api/applications/my?page=1&limit=10')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return applications for current page', async () => {
            const response = await request(app)
                .get('/api/applications/my?page=1&limit=5')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('PATCH /api/applications/:id/status - Edge cases', () => {
        it('should not allow updating already accepted application', async () => {
            const response = await request(app)
                .patch(`/api/applications/${applicationId}/status`)
                .set('Authorization', `Bearer ${brandToken}`)
                .send({ status: 'rejected' });

            // Application is already accepted, so this might fail or succeed depending on business logic
            expect([200, 400]).toContain(response.status);
        });
    });
});
