import { Document, Types } from 'mongoose';

export interface IApplication extends Document {
    _id: Types.ObjectId;
    campaignId: Types.ObjectId;
    influencerId: Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    proposedRate?: number;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}
