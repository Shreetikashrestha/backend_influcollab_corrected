import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
