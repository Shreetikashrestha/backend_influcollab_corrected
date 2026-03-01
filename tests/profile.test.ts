import request from 'supertest';
import app from '../src/app';
import { UserModel } from '../src/models/user.model';
import { InfluencerProfileModel } from '../src/models/influencer_profile.model';
import { BrandProfileModel } from '../src/models/brand_profile.model';
import { connectDatabase } from '../src/database/mongodb';
import mongoose from 'mongoose';

describe('Profile API', () => {
    let influencerToken: string;
    let brandToken: string;

    beforeAll(async () => {
        await connectDatabase();

        // Clean up stale profiles and test users from previous runs
        await InfluencerProfileModel.deleteOne({ username: 'testinfluencer3' });
        await BrandProfileModel.deleteOne({ companyName: 'Test Brand 4' });
        await UserModel.deleteOne({ email: 'testinfluencer3@test.com' });
        await UserModel.deleteOne({ email: 'testbrand4@test.com' });

        // Register and login as influencer
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testinfluencer3@test.com',
                password: 'Test123!',
                fullName: 'Test Influencer 3',
                isInfluencer: true
            });

        const influencerLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testinfluencer3@test.com',
                password: 'Test123!'
            });
        influencerToken = influencerLogin.body.data.token;

        // Register and login as brand
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testbrand4@test.com',
                password: 'Test123!',
                fullName: 'Test Brand 4',
                isInfluencer: false
            });

        const brandLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testbrand4@test.com',
                password: 'Test123!'
            });
        brandToken = brandLogin.body.data.token;
    });

    afterAll(async () => {
        await InfluencerProfileModel.deleteOne({ username: 'testinfluencer3' });
        await BrandProfileModel.deleteOne({ companyName: 'Test Brand 4' });
        await UserModel.deleteOne({ email: 'testinfluencer3@test.com' });
        await UserModel.deleteOne({ email: 'testbrand4@test.com' });
        await mongoose.connection.close();
    });

    describe('GET /api/profiles/me', () => {
        it('should get current user profile', async () => {
            const response = await request(app)
                .get('/api/profiles/me')
                .set('Authorization', `Bearer ${influencerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.profile).toHaveProperty('userId');
        });

        it('should reject request without auth', async () => {
            const response = await request(app)
                .get('/api/profiles/me');

            expect(response.status).toBe(401);
        });
    });

    describe('PATCH /api/profiles/update', () => {
        it('should update influencer profile', async () => {
            const response = await request(app)
                .patch('/api/profiles/update')
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    bio: 'Updated bio for testing',
                    socialLinks: {
                        instagram: 'https://instagram.com/testuser',
                        tiktok: 'https://tiktok.com/@testuser'
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.profile.bio).toBe('Updated bio for testing');
        });

        it('should update brand profile', async () => {
            const response = await request(app)
                .patch('/api/profiles/update')
                .set('Authorization', `Bearer ${brandToken}`)
                .send({
                    companyName: 'Updated Company Name',
                    website: 'https://example.com',
                    socialLinks: {
                        facebook: 'https://facebook.com/testbrand'
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/profiles/influencers', () => {
        it('should get list of influencers', async () => {
            const response = await request(app)
                .get('/api/profiles/influencers')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/profiles/:id', () => {
        it('should get profile by user ID', async () => {
            // First get current user to get their ID
            const meRes = await request(app)
                .get('/api/profiles/me')
                .set('Authorization', `Bearer ${influencerToken}`);
            
            const userId = meRes.body.profile.userId;

            const response = await request(app)
                .get(`/api/profiles/${userId}`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 404 for non-existent user', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/profiles/${fakeId}`)
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/profiles/influencers - Filtering', () => {
        it('should filter influencers by niche', async () => {
            const response = await request(app)
                .get('/api/profiles/influencers?niche=Fashion')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should search influencers by username', async () => {
            const response = await request(app)
                .get('/api/profiles/influencers?search=test')
                .set('Authorization', `Bearer ${brandToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('PATCH /api/profiles/update - Validation', () => {
        it('should handle profile updates gracefully', async () => {
            const response = await request(app)
                .patch('/api/profiles/update')
                .set('Authorization', `Bearer ${influencerToken}`)
                .send({
                    bio: 'Updated bio'
                });

            expect(response.status).toBe(200);
        });
    });
});
