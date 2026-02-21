import { Document, Types } from 'mongoose';

export interface IInfluencerProfile extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    bio?: string;
    categories?: string[];
    platforms?: {
        platform: string;
        username: string;
        followers: number;
        engagementRate?: number;
    }[];
    portfolio?: string[];
    rate?: number;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}
