import { Document, Types } from 'mongoose';

export interface ITransaction extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    campaignId: Types.ObjectId;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
