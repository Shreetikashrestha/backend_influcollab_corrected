import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    senderRole: 'brand' | 'influencer' | 'admin';
    content: string;
    attachments?: Array<{
        type: 'image' | 'document' | 'video';
        url: string;
        name: string;
        size: number;
    }>;
    isRead: boolean;
    readAt?: Date;
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['brand', 'influencer', 'admin'], required: true },
    content: { type: String, required: true },
    attachments: [{
        type: { type: String, enum: ['image', 'document', 'video'], required: true },
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number, required: true }
    }],
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
}, {
    timestamps: true
});

// Index for performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
