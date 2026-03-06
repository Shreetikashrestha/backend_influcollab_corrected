import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    participants: Array<{
        user: mongoose.Types.ObjectId;
        role: 'brand' | 'influencer' | 'admin';
    }>;
    lastMessage?: mongoose.Types.ObjectId;
    unreadCount: Map<string, number>; // userId -> count
    campaignId?: mongoose.Types.ObjectId;
    isPinned: Map<string, boolean>; // userId -> isPinned
    isMuted: Map<string, boolean>; // userId -> isMuted
    isArchived: Map<string, boolean>; // userId -> isArchived
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['brand', 'influencer', 'admin'], required: true }
    }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    unreadCount: { type: Map, of: Number, default: {} },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    isPinned: { type: Map, of: Boolean, default: {} },
    isMuted: { type: Map, of: Boolean, default: {} },
    isArchived: { type: Map, of: Boolean, default: {} }
}, {
    timestamps: true
});

ConversationSchema.index({ 'participants.user': 1 });

export const ConversationModel = mongoose.model<IConversation>('Conversation', ConversationSchema);
