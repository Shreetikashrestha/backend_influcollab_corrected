import BrandProfile from '../models/brand_profile.model';
import InfluencerProfile from '../models/influencer_profile.model';
import { IBrandProfile } from '../types/brand_profile.type';
import { IInfluencerProfile } from '../types/influencer_profile.type';

export class ProfileRepository {
    // Brand Profile methods
    async createBrandProfile(profileData: Partial<IBrandProfile>): Promise<IBrandProfile> {
        const profile = new BrandProfile(profileData);
        return await profile.save();
    }

    async findBrandProfileByUserId(userId: string): Promise<IBrandProfile | null> {
        return await BrandProfile.findOne({ userId }).populate('userId');
    }

    async updateBrandProfile(userId: string, updateData: Partial<IBrandProfile>): Promise<IBrandProfile | null> {
        return await BrandProfile.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );
    }

    // Influencer Profile methods
    async createInfluencerProfile(profileData: Partial<IInfluencerProfile>): Promise<IInfluencerProfile> {
        const profile = new InfluencerProfile(profileData);
        return await profile.save();
    }

    async findInfluencerProfileByUserId(userId: string): Promise<IInfluencerProfile | null> {
        return await InfluencerProfile.findOne({ userId }).populate('userId');
    }

    async findAllInfluencerProfiles(filter: any = {}): Promise<IInfluencerProfile[]> {
        return await InfluencerProfile.find(filter).populate('userId');
    }

    async updateInfluencerProfile(userId: string, updateData: Partial<IInfluencerProfile>): Promise<IInfluencerProfile | null> {
        return await InfluencerProfile.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );
    }

    async searchInfluencers(searchCriteria: any): Promise<IInfluencerProfile[]> {
        return await InfluencerProfile.find(searchCriteria).populate('userId');
    }
}

export default new ProfileRepository();
