import { ApplicationModel } from '../models/application.model';
import { IApplication } from '../types/application.type';

export class ApplicationRepository {
    async create(applicationData: Partial<IApplication>): Promise<IApplication> {
        const application = new ApplicationModel(applicationData);
        return await application.save();
    }

    async findById(id: string): Promise<IApplication | null> {
        return await ApplicationModel.findById(id)
            .populate('campaignId')
            .populate('influencerId');
    }

    async findAll(filter: any = {}): Promise<IApplication[]> {
        return await ApplicationModel.find(filter)
            .populate('campaignId')
            .populate('influencerId');
    }

    async findByCampaignId(campaignId: string): Promise<IApplication[]> {
        return await ApplicationModel.find({ campaignId })
            .populate('influencerId');
    }

    async findByInfluencerId(influencerId: string): Promise<IApplication[]> {
        return await ApplicationModel.find({ influencerId })
            .populate('campaignId');
    }

    async findOne(filter: any): Promise<IApplication | null> {
        return await ApplicationModel.findOne(filter);
    }

    async update(id: string, updateData: Partial<IApplication>): Promise<IApplication | null> {
        return await ApplicationModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateStatus(id: string, status: string): Promise<IApplication | null> {
        return await ApplicationModel.findByIdAndUpdate(id, { status }, { new: true });
    }

    async delete(id: string): Promise<IApplication | null> {
        return await ApplicationModel.findByIdAndDelete(id);
    }
}

export default new ApplicationRepository();
