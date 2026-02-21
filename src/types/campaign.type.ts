import { Document, Types } from 'mongoose';

export interface ICampaign extends Document {
    _id: Types.ObjectId;
    brandId: Types.ObjectId;
    title: string;
    description: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    requirements?: string[];
    targetAudience?: string;
    deliverables?: string[];
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}
