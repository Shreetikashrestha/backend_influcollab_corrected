import { Document, Types } from 'mongoose';

export interface IConversation extends Document {
    _id: Types.ObjectId;
    participants: Types.ObjectId[];
    lastMessage?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
