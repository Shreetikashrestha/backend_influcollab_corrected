import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
    userId: mongoose.Types.ObjectId;
    category: 'general' | 'technical' | 'billing' | 'account' | 'feature';
    message: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    response?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'technical', 'billing', 'account', 'feature'],
        required: true,
        default: 'general'
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    response: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export const SupportTicketModel = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
