import mongoose, { Document, Schema } from 'mongoose';

export interface IBrandProfile extends Document {
    userId: mongoose.Types.ObjectId;
    companyName: string;
    logo: string;
    coverImage: string;
    description: string;
    industry: string;
    website: string;
    headquarters: {
        address: string;
        city: string;
        country: string;
    };
    socialLinks: {
        instagram?: string;
        tiktok?: string;
        facebook?: string;
    };
    isVerified: boolean;
    subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
}

const BrandProfileSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true },
    logo: { type: String },
    coverImage: { type: String },
    description: { type: String, maxlength: 1000 },
    industry: { type: String },
    website: { type: String },
    headquarters: {
        address: { type: String },
        city: { type: String },
        country: { type: String }
    },
    socialLinks: {
        instagram: { type: String },
        tiktok: { type: String },
        facebook: { type: String }
    },
    isVerified: { type: Boolean, default: false },
    subscriptionTier: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' }
}, {
    timestamps: true
});

export const BrandProfileModel = mongoose.model<IBrandProfile>('BrandProfile', BrandProfileSchema);
