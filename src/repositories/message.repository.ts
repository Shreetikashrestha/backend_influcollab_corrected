import Message from '../models/message.model';
import Conversation from '../models/conversation.model';
import { IMessage } from '../types/message.type';
import { IConversation } from '../types/conversation.type';

export class MessageRepository {
    async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
        const message = new Message(messageData);
        return await message.save();
    }

    async findMessageById(id: string): Promise<IMessage | null> {
        return await Message.findById(id)
            .populate('senderId')
            .populate('receiverId');
    }

    async findMessagesByConversation(conversationId: string): Promise<IMessage[]> {
        return await Message.find({ conversationId })
            .populate('senderId')
            .populate('receiverId')
            .sort({ createdAt: 1 });
    }

    async markAsRead(messageId: string): Promise<IMessage | null> {
        return await Message.findByIdAndUpdate(
            messageId,
            { isRead: true },
            { new: true }
        );
    }

    async createConversation(conversationData: Partial<IConversation>): Promise<IConversation> {
        const conversation = new Conversation(conversationData);
        return await conversation.save();
    }

    async findConversationById(id: string): Promise<IConversation | null> {
        return await Conversation.findById(id)
            .populate('participants')
            .populate('lastMessage');
    }

    async findConversationByParticipants(participant1: string, participant2: string): Promise<IConversation | null> {
        return await Conversation.findOne({
            participants: { $all: [participant1, participant2] }
        }).populate('participants').populate('lastMessage');
    }

    async findUserConversations(userId: string): Promise<IConversation[]> {
        return await Conversation.find({ participants: userId })
            .populate('participants')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
    }

    async updateConversation(id: string, updateData: Partial<IConversation>): Promise<IConversation | null> {
        return await Conversation.findByIdAndUpdate(id, updateData, { new: true });
    }
}

export default new MessageRepository();
