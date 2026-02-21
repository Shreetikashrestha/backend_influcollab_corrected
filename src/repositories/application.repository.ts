import Application from '../models/application.model';
import { IApplication } from '../types/application.type';

export class ApplicationRepository {
    async create(applicationData: Partial<IApplication>): Promise<IApplication> {
        const application = new Application(applicationData);
        return await application.save();
    }

    async findById(id: string): Promise<IApplication | null> {
        return await Application.findById(id)
            .populate('campaignId')
            .populate('influencerId');
    }

    async findAll(filter: any = {}): Promise<IApplication[]> {
        return await Application.find(filter)
            .populate('campaignId')
            .populate('influencerId');
    }

    async findByCampaignId(campaignId: string): Promise<IApplication[]> {
        return await Application.find({ campaignId })
            .populate('influencerId');
    }

    async findByInfluencerId(influencerId: string): Promise<IApplication[]> {
        return await Application.find({ influencerId })
            .populate('campaignId');
    }

    async findOne(filter: any): Promise<IApplication | null> {
        return await Application.findOne(filter);
    }

    async update(id: string, updateData: Partial<IApplication>): Promise<IApplication | null> {
        return await Application.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateStatus(id: string, status: string): Promise<IApplication | null> {
        return await Application.findByIdAndUpdate(id, { status }, { new: true });
    }

    async delete(id: string): Promise<IApplication | null> {
        return await Application.findByIdAndDelete(id);
    }
}

export default new ApplicationRepository();
