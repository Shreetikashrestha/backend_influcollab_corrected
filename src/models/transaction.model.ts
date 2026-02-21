import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    campaignId: mongoose.Types.ObjectId;
    brandId: mongoose.Types.ObjectId;
    influencerId?: mongoose.Types.ObjectId;
    amount: number;
    platformFee: number;
    netAmount: number;
    currency: string;
    status: 'pending' | 'funded' | 'escrow' | 'released' | 'refunded' | 'failed';
    type: 'payment' | 'payout' | 'refund';
    stripePaymentIntentId?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
    {
        campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
        brandId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        influencerId: { type: Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
        platformFee: { type: Number, required: true },
        netAmount: { type: Number, required: true },
        currency: { type: String, default: 'npr' },
        status: {
            type: String,
            enum: ['pending', 'funded', 'escrow', 'released', 'refunded', 'failed'],
            default: 'pending',
        },
        type: {
            type: String,
            enum: ['payment', 'payout', 'refund'],
            required: true,
        },
        stripePaymentIntentId: { type: String },
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
