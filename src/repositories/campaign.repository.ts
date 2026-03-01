import { CampaignModel } from '../models/campaign.model';
import { ICampaign } from '../types/campaign.type';

export class CampaignRepository {
    async create(campaignData: Partial<ICampaign>): Promise<ICampaign> {
        const campaign = new CampaignModel(campaignData);
        return await campaign.save();
    }

    async findById(id: string): Promise<ICampaign | null> {
        return await CampaignModel.findById(id).populate('brandId');
    }

    async findAll(filter: any = {}): Promise<ICampaign[]> {
        return await CampaignModel.find(filter).populate('brandId');
    }

    async findByBrandId(brandId: string): Promise<ICampaign[]> {
        return await CampaignModel.find({ brandId }).populate('brandId');
    }

    async update(id: string, updateData: Partial<ICampaign>): Promise<ICampaign | null> {
        return await CampaignModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<ICampaign | null> {
        return await CampaignModel.findByIdAndDelete(id);
    }

    async updateStatus(id: string, status: string): Promise<ICampaign | null> {
        return await CampaignModel.findByIdAndUpdate(id, { status }, { new: true });
    }
}

export default new CampaignRepository();
