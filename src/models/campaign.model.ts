import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    brandName: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    deadline: Date;
    location: string;
    requirements: string[];
    deliverables: string[];
    creatorId: mongoose.Types.ObjectId;
    applicantsCount: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const CampaignSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    brandName: { type: String, required: true },
    category: { type: String, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    deadline: { type: Date, required: true },
    location: { type: String, required: true },
    requirements: [{ type: String }],
    deliverables: [{ type: String }],
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicantsCount: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['draft', 'active', 'completed', 'cancelled'], 
        default: 'active' 
    },
}, {
    timestamps: true,
});

// Index for faster queries
CampaignSchema.index({ status: 1, deadline: 1 });
CampaignSchema.index({ creatorId: 1 });

export const CampaignModel = mongoose.model<ICampaign>('Campaign', CampaignSchema);
