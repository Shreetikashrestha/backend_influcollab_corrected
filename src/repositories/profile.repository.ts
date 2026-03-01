import { BrandProfileModel } from '../models/brand_profile.model';
import { InfluencerProfileModel } from '../models/influencer_profile.model';
import { IBrandProfile } from '../types/brand_profile.type';
import { IInfluencerProfile } from '../types/influencer_profile.type';

export class ProfileRepository {
    async createBrandProfile(profileData: Partial<IBrandProfile>): Promise<IBrandProfile> {
        const profile = new BrandProfileModel(profileData);
        return await profile.save();
    }

    async findBrandProfileByUserId(userId: string): Promise<IBrandProfile | null> {
        return await BrandProfileModel.findOne({ userId }).populate('userId');
    }

    async updateBrandProfile(userId: string, updateData: Partial<IBrandProfile>): Promise<IBrandProfile | null> {
        return await BrandProfileModel.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );
    }

    async createInfluencerProfile(profileData: Partial<IInfluencerProfile>): Promise<IInfluencerProfile> {
        const profile = new InfluencerProfileModel(profileData);
        return await profile.save();
    }

    async findInfluencerProfileByUserId(userId: string): Promise<IInfluencerProfile | null> {
        return await InfluencerProfileModel.findOne({ userId }).populate('userId');
    }

    async findAllInfluencerProfiles(filter: any = {}): Promise<IInfluencerProfile[]> {
        return await InfluencerProfileModel.find(filter).populate('userId');
    }

    async updateInfluencerProfile(userId: string, updateData: Partial<IInfluencerProfile>): Promise<IInfluencerProfile | null> {
        return await InfluencerProfileModel.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, upsert: true }
        );
    }

    async searchInfluencers(searchCriteria: any): Promise<IInfluencerProfile[]> {
        return await InfluencerProfileModel.find(searchCriteria).populate('userId');
    }
}

export default new ProfileRepository();
