import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    userRole: 'brand' | 'influencer' | 'admin';
    type: string;
    title: string;
    message: string;
    icon?: string;
    iconColor?: string;
    link?: string;
    metadata?: {
        campaignId?: string;
        applicationId?: string;
        messageId?: string;
        transactionId?: string;
        reportId?: string;
        userId?: string;
    };
    isRead: boolean;
    readAt?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, enum: ['brand', 'influencer', 'admin'], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String },
    iconColor: { type: String },
    link: { type: String },
    metadata: {
        campaignId: { type: String },
        applicationId: { type: String },
        messageId: { type: String },
        transactionId: { type: String },
        reportId: { type: String },
        userId: { type: String }
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, {
    timestamps: true
});

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
