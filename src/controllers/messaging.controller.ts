import { Request, Response } from 'express';
import { ConversationModel } from '../models/conversation.model';
import { MessageModel } from '../models/message.model';
import { UserModel } from '../models/user.model';

export const MessageController = {
    // Get all conversations for the current user
    getConversations: async (req: any, res: Response) => {
        try {
            const conversations = await ConversationModel.find({
                'participants.user': req.user._id
            })
                .populate('participants.user', 'fullName email isInfluencer role')
                .populate('lastMessage')
                .sort({ updatedAt: -1 });

            res.status(200).json({ success: true, conversations });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get messages for a specific conversation
    getMessages: async (req: Request, res: Response) => {
        try {
            const { conversationId } = req.params;
            const messages = await MessageModel.find({ conversationId })
                .populate('sender', 'fullName email')
                .sort({ createdAt: 1 });

            res.status(200).json({ success: true, messages });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Send a new message
    sendMessage: async (req: any, res: Response) => {
        try {
            const { conversationId, content, receiverId, campaignId, attachments } = req.body;
            let existingConversationId = conversationId;

            // If no conversationId, check if one exists between these users or create a new one
            if (!existingConversationId && receiverId) {
                let conversation = await ConversationModel.findOne({
                    'participants.user': { $all: [req.user._id, receiverId] },
                    campaignId: campaignId || null
                });

                if (!conversation) {
                    const receiver = await UserModel.findById(receiverId);
                    if (!receiver) {
                        return res.status(404).json({ success: false, message: "Receiver not found" });
                    }

                    conversation = await ConversationModel.create({
                        participants: [
                            {
                                user: req.user._id,
                                role: req.user.isInfluencer ? 'influencer' : (req.user.role === 'admin' ? 'admin' : 'brand')
                            },
                            {
                                user: receiverId,
                                role: receiver.isInfluencer ? 'influencer' : (receiver.role === 'admin' ? 'admin' : 'brand')
                            }
                        ],
                        campaignId: campaignId || null
                    });
                }
                existingConversationId = conversation._id;
            }

            const message = await MessageModel.create({
                conversationId: existingConversationId,
                sender: req.user._id,
                senderRole: req.user.isInfluencer ? 'influencer' : (req.user.role === 'admin' ? 'admin' : 'brand'),
                content,
                attachments: attachments || []
            });

            // Update conversation with last message and increment unread count
            await ConversationModel.findByIdAndUpdate(existingConversationId, {
                lastMessage: message._id,
                $inc: { [`unreadCount.${receiverId}`]: 1 }
            });

            // Emit real-time event
            req.io.to(existingConversationId.toString()).emit('new_message', message);

            res.status(201).json({ success: true, message });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Mark all messages in a conversation as read
    markConversationAsRead: async (req: any, res: Response) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user._id;

            // Update all messages where I am NOT the sender
            await MessageModel.updateMany(
                { conversationId, sender: { $ne: userId }, isRead: false },
                { isRead: true, readAt: new Date() }
            );

            // Reset unread count for this user in the conversation
            await ConversationModel.findByIdAndUpdate(conversationId, {
                $set: { [`unreadCount.${userId}`]: 0 }
            });

            // Emit event to inform other participants (optional, useful for read status in UI)
            req.io.to(conversationId).emit('messages_read', { conversationId, userId });

            res.status(200).json({ success: true, message: "Conversation marked as read" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Mark individual message as read
    markAsRead: async (req: any, res: Response) => {
        try {
            const { messageId } = req.params;
            const message = await MessageModel.findByIdAndUpdate(messageId, {
                isRead: true,
                readAt: new Date()
            }, { new: true });

            if (message) {
                // Decrement unread count for the user
                await ConversationModel.findByIdAndUpdate(message.conversationId, {
                    $inc: { [`unreadCount.${req.user._id}`]: -1 }
                });
            }

            res.status(200).json({ success: true, message });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
