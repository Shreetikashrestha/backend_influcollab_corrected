import { Document, Types } from 'mongoose';

export interface INotification extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    type: 'application' | 'message' | 'campaign' | 'payment' | 'review' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
