import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    reviewerId: mongoose.Types.ObjectId;
    revieweeId: mongoose.Types.ObjectId;
    campaignId: mongoose.Types.ObjectId;
    rating: number; // 1-5
    comment?: string;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
}, {
    timestamps: true
});

// Index for fetching reviews for a user
ReviewSchema.index({ revieweeId: 1, createdAt: -1 });

// Composite index to prevent duplicate reviews for the same campaign
ReviewSchema.index({ reviewerId: 1, campaignId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);
