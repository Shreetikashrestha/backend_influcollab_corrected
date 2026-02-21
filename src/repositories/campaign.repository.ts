import Campaign from '../models/campaign.model';
import { ICampaign } from '../types/campaign.type';

export class CampaignRepository {
    async create(campaignData: Partial<ICampaign>): Promise<ICampaign> {
        const campaign = new Campaign(campaignData);
        return await campaign.save();
    }

    async findById(id: string): Promise<ICampaign | null> {
        return await Campaign.findById(id).populate('brandId');
    }

    async findAll(filter: any = {}): Promise<ICampaign[]> {
        return await Campaign.find(filter).populate('brandId');
    }

    async findByBrandId(brandId: string): Promise<ICampaign[]> {
        return await Campaign.find({ brandId }).populate('brandId');
    }

    async update(id: string, updateData: Partial<ICampaign>): Promise<ICampaign | null> {
        return await Campaign.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<ICampaign | null> {
        return await Campaign.findByIdAndDelete(id);
    }

    async updateStatus(id: string, status: string): Promise<ICampaign | null> {
        return await Campaign.findByIdAndUpdate(id, { status }, { new: true });
    }
}

export default new CampaignRepository();
