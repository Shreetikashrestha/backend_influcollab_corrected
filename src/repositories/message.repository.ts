import { MessageModel } from '../models/message.model';
import { ConversationModel } from '../models/conversation.model';
import { IMessage } from '../types/message.type';
import { IConversation } from '../types/conversation.type';

export class MessageRepository {
    async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
        const message = new MessageModel(messageData);
        return await message.save();
    }

    async findMessageById(id: string): Promise<IMessage | null> {
        return await MessageModel.findById(id)
            .populate('senderId')
            .populate('receiverId');
    }

    async findMessagesByConversation(conversationId: string): Promise<IMessage[]> {
        return await MessageModel.find({ conversationId })
            .populate('senderId')
            .populate('receiverId')
            .sort({ createdAt: 1 });
    }

    async markAsRead(messageId: string): Promise<IMessage | null> {
        return await MessageModel.findByIdAndUpdate(
            messageId,
            { isRead: true },
            { new: true }
        );
    }

    async createConversation(conversationData: Partial<IConversation>): Promise<IConversation> {
        const conversation = new ConversationModel(conversationData);
        return await conversation.save();
    }

    async findConversationById(id: string): Promise<IConversation | null> {
        return await ConversationModel.findById(id)
            .populate('participants')
            .populate('lastMessage');
    }

    async findConversationByParticipants(participant1: string, participant2: string): Promise<IConversation | null> {
        return await ConversationModel.findOne({
            participants: { $all: [participant1, participant2] }
        }).populate('participants').populate('lastMessage');
    }

    async findUserConversations(userId: string): Promise<IConversation[]> {
        return await ConversationModel.find({ participants: userId })
            .populate('participants')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
    }

    async updateConversation(id: string, updateData: Partial<IConversation>): Promise<IConversation | null> {
        return await ConversationModel.findByIdAndUpdate(id, updateData, { new: true });
    }
}

export default new MessageRepository();
