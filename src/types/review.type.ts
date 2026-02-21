import { Document, Types } from 'mongoose';

export interface IReview extends Document {
    _id: Types.ObjectId;
    reviewerId: Types.ObjectId;
    revieweeId: Types.ObjectId;
    rating: number;
    comment?: string;
    campaignId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
