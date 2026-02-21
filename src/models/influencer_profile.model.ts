import mongoose, { Document, Schema } from 'mongoose';

export interface IInfluencerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    bio: string;
    location: {
        city: string;
        state: string;
        country: string;
    };
    categories: string[];
    niches: string[];
    languages: string[];
    socialAccounts: Array<{
        platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
        handle: string;
        followers: number;
        engagementRate: number;
        isPrimary: boolean;
    }>;
    portfolio: Array<{
        title: string;
        description: string;
        media: string[];
        tags: string[];
    }>;
    isVerified: boolean;
    joinedAt: Date;
    avgRating: number;
    reviewCount: number;
}

const InfluencerProfileSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    username: { type: String, required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    location: {
        city: { type: String },
        state: { type: String },
        country: { type: String }
    },
    categories: [{ type: String }],
    niches: [{ type: String }],
    languages: [{ type: String }],
    socialAccounts: [{
        platform: { type: String, enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'] },
        handle: { type: String },
        followers: { type: Number, default: 0 },
        engagementRate: { type: Number, default: 0 },
        isPrimary: { type: Boolean, default: false }
    }],
    portfolio: [{
        title: { type: String },
        description: { type: String },
        media: [{ type: String }],
        tags: [{ type: String }]
    }],
    isVerified: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

export const InfluencerProfileModel = mongoose.model<IInfluencerProfile>('InfluencerProfile', InfluencerProfileSchema);
