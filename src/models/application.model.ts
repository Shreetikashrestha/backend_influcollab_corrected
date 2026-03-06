import mongoose, { Document, Schema } from "mongoose";

export interface IApplication extends Document {
    _id: mongoose.Types.ObjectId;
    influencerId: mongoose.Types.ObjectId;
    campaignId: mongoose.Types.ObjectId;
    brandId: mongoose.Types.ObjectId;
    proposalMessage?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    influencerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campaignId: {
        type: Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    proposalMessage: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
}, {
    timestamps: true,
});

ApplicationSchema.index({ campaignId: 1, status: 1 });
ApplicationSchema.index({ influencerId: 1 });
ApplicationSchema.index({ brandId: 1 });

ApplicationSchema.index({ influencerId: 1, campaignId: 1 }, { unique: true });

export const ApplicationModel = mongoose.model<IApplication>('Application', ApplicationSchema);
