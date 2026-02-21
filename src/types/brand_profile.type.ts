import { Document, Types } from 'mongoose';

export interface IBrandProfile extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    companyName: string;
    industry?: string;
    website?: string;
    description?: string;
    logo?: string;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
